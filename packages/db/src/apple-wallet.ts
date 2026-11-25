import http2 from 'node:http2';

import * as forge from 'node-forge';

import { createAdminClient } from './admin';

/**
 * Apple Wallet — utilidades de servidor compartidas por apps/web y apps/cards.
 *
 * Push de actualización de passes (APNs):
 *   - Se autentica con el MISMO certificado del Pass Type ID (.p12); no hace
 *     falta un certificado APNs aparte.
 *   - Wallet siempre usa el entorno de producción de APNs, incluso en desarrollo.
 *   - El payload es `{}`: Apple solo despierta al dispositivo, que luego llama
 *     a nuestro web service (`/api/wallet/apple/v1/...`) y descarga el pass nuevo.
 */

const APNS_HOST = 'https://api.push.apple.com';
const APNS_TIMEOUT_MS = 10_000;

// ─── Certificados ────────────────────────────────────────────────────────────

export interface PemCredentials {
  signerCert: string;
  signerKey: string;
}

/**
 * Extrae certificado y clave privada (PEM) de un .p12.
 * Se usa node-forge porque los .p12 exportados desde Keychain usan cifrados
 * legacy (RC2/3DES) que OpenSSL 3 rechaza sin el legacy provider.
 */
export function extractPemFromP12(p12Buffer: Buffer, passphrase?: string): PemCredentials {
  const p12 = forge.pkcs12.pkcs12FromAsn1(
    forge.asn1.fromDer(p12Buffer.toString('binary')),
    passphrase ?? '',
  );
  // Ojo: p12.getBags({}) devuelve {} — hay que pedir cada bagType explícitamente.
  const firstBag = (bagType: string) => (p12.getBags({ bagType })[bagType] ?? [])[0];
  const certBag = firstBag(forge.pki.oids.certBag!);
  const keyBag = firstBag(forge.pki.oids.pkcs8ShroudedKeyBag!) ?? firstBag(forge.pki.oids.keyBag!);

  if (!certBag?.cert) throw new Error('No valid certificate found in .p12 file');
  if (!keyBag?.key) throw new Error('No valid private key found in .p12 file');

  return {
    signerCert: forge.pki.certificateToPem(certBag.cert),
    signerKey: forge.pki.privateKeyToPem(keyBag.key),
  };
}

export interface ApplePushConfig {
  passTypeIdentifier: string;
  credentials: PemCredentials;
}

/** Devuelve la config de push, o null si Apple Wallet no está configurado. */
export function getApplePushConfig(env: NodeJS.ProcessEnv = process.env): ApplePushConfig | null {
  const passTypeIdentifier = env.APPLE_PASS_TYPE_IDENTIFIER;
  const p12Base64 = env.APPLE_PASS_CERTIFICATE;
  if (!passTypeIdentifier || !p12Base64) return null;

  return {
    passTypeIdentifier,
    credentials: extractPemFromP12(Buffer.from(p12Base64, 'base64'), env.APPLE_PASS_CERTIFICATE_PWD),
  };
}

// ─── Envío ───────────────────────────────────────────────────────────────────

/** Envía un push a un token y devuelve el status HTTP de APNs. */
export type ApnsSend = (pushToken: string) => Promise<number>;

export interface ApnsTransport {
  send: ApnsSend;
  close: () => void;
}

/**
 * Transporte real: una sesión HTTP/2 reutilizada para todos los tokens.
 * `options` solo existe para tests (servidor HTTP/2 local con CA propia).
 */
export function createApnsTransport(
  config: ApplePushConfig,
  options: { host?: string; ca?: string } = {},
): ApnsTransport {
  const session = http2.connect(options.host ?? APNS_HOST, {
    cert: config.credentials.signerCert,
    key: config.credentials.signerKey,
    ...(options.ca ? { ca: options.ca } : {}),
  });
  // Evita que un error de conexión sin listener tumbe el proceso.
  session.on('error', () => {});

  const send: ApnsSend = (pushToken) =>
    new Promise((resolve, reject) => {
      const req = session.request({
        ':method': 'POST',
        ':path': `/3/device/${encodeURIComponent(pushToken)}`,
        'apns-topic': config.passTypeIdentifier,
        'content-type': 'application/json',
      });

      let status = 0;
      req.setTimeout(APNS_TIMEOUT_MS, () => req.close(http2.constants.NGHTTP2_CANCEL));
      req.on('response', (headers) => {
        status = Number(headers[':status'] ?? 0);
      });
      req.on('error', reject);
      req.on('close', () => (status ? resolve(status) : reject(new Error('APNs request aborted'))));
      // Consumir el body para que el stream se cierre.
      req.on('data', () => {});
      req.end('{}');
    });

  return { send, close: () => session.close() };
}

export interface PushResult {
  delivered: number;
  failed: number;
  /** Tokens que APNs ya no reconoce (410 Unregistered / 400 BadDeviceToken). */
  invalidTokens: string[];
}

/** Envía el push a todos los tokens en paralelo. Nunca lanza. */
export async function sendApplePassPushes(tokens: string[], send: ApnsSend): Promise<PushResult> {
  const unique = [...new Set(tokens.filter(Boolean))];
  const results = await Promise.allSettled(unique.map((t) => send(t)));

  const result: PushResult = { delivered: 0, failed: 0, invalidTokens: [] };
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value === 200) result.delivered++;
    else if (r.status === 'fulfilled' && (r.value === 410 || r.value === 400)) {
      result.invalidTokens.push(unique[i]!);
    } else result.failed++;
  });
  return result;
}

/**
 * Avisa a todos los dispositivos que tienen el pass de esta membresía que
 * hay una versión nueva. No-op si Apple Wallet no está configurado o no hay
 * dispositivos registrados. Limpia los registros con tokens inválidos.
 */
export async function notifyAppleWalletPassUpdated(membershipSlug: string): Promise<PushResult | null> {
  return notifyAppleWalletPassesUpdated([membershipSlug]);
}

/** Igual que notifyAppleWalletPassUpdated, para muchas membresías a la vez. */
export async function notifyAppleWalletPassesUpdated(membershipSlugs: string[]): Promise<PushResult | null> {
  const config = getApplePushConfig();
  if (!config) return null;

  const empty: PushResult = { delivered: 0, failed: 0, invalidTokens: [] };
  if (membershipSlugs.length === 0) return empty;

  const db = createAdminClient();
  const tokens: string[] = [];
  // .in() viaja en la URL: troceamos para no exceder el límite de longitud.
  for (let i = 0; i < membershipSlugs.length; i += 200) {
    const { data, error } = await db
      .from('wallet_registrations')
      .select('push_token')
      .eq('platform', 'apple')
      .in('membership_slug', membershipSlugs.slice(i, i + 200))
      .not('push_token', 'is', null);
    if (error) throw new Error(error.message);
    for (const r of data ?? []) if (r.push_token) tokens.push(r.push_token);
  }
  if (tokens.length === 0) return empty;

  const transport = createApnsTransport(config);
  try {
    const result = await sendApplePassPushes(tokens, transport.send);

    if (result.invalidTokens.length > 0) {
      await db
        .from('wallet_registrations')
        .delete()
        .eq('platform', 'apple')
        .in('push_token', result.invalidTokens);
    }
    return result;
  } finally {
    transport.close();
  }
}
