import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { z } from 'zod';

/**
 * QR dinámico para validaciones en mostrador (cajero escanea QR del cliente).
 *
 * Estructura del payload firmado:
 *   base64url(JSON(payload)) . base64url(HMAC-SHA256(payload, secret))
 *
 * Propiedades de seguridad:
 *   - Firma HMAC previene forjar QRs sin el secret
 *   - `iat` + TTL corto (60s default) previene usar QRs viejos
 *   - `nonce` único + tabla `qr_nonces` previene replay attacks
 *   - Comparación de firma en constant-time (timingSafeEqual)
 */

const TTL_SECONDS_DEFAULT = 60;

export const qrPayloadSchema = z.object({
  /** Membership ID */
  mid: z.string().uuid(),
  /** Issued at (Unix timestamp, seconds) */
  iat: z.number().int().positive(),
  /** Nonce único (previene replay) */
  n: z.string().min(8),
});

export type QrPayload = z.infer<typeof qrPayloadSchema>;

export interface GenerateQrOptions {
  membershipId: string;
  secret: string;
  /** TTL en segundos. Default: 60 */
  ttlSeconds?: number;
}

export interface GenerateQrResult {
  token: string;
  nonce: string;
  expiresAt: Date;
}

/**
 * Genera un QR token firmado para un membership.
 * El resultado se codifica en el QR que el cliente ve en su tarjeta.
 */
export function generateQrToken(opts: GenerateQrOptions): GenerateQrResult {
  const ttl = opts.ttlSeconds ?? TTL_SECONDS_DEFAULT;
  const iat = Math.floor(Date.now() / 1000);
  const nonce = randomBytes(9).toString('base64url'); // 12 chars

  const payload: QrPayload = {
    mid: opts.membershipId,
    iat,
    n: nonce,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadJson, 'utf8').toString('base64url');

  const signature = createHmac('sha256', opts.secret).update(payloadB64).digest('base64url');

  return {
    token: `${payloadB64}.${signature}`,
    nonce,
    expiresAt: new Date((iat + ttl) * 1000),
  };
}

export type VerifyQrResult =
  | { ok: true; payload: QrPayload }
  | { ok: false; reason: 'malformed' | 'invalid_signature' | 'expired' | 'invalid_payload' };

export interface VerifyQrOptions {
  token: string;
  secret: string;
  ttlSeconds?: number;
  /** Para testear con tiempo determinístico */
  now?: Date;
}

/**
 * Verifica un QR token. Retorna el payload si es válido.
 *
 * IMPORTANTE: esto NO verifica el replay attack (que el nonce no haya sido usado).
 * Esa verificación se hace en la base de datos (tabla `qr_nonces`) después de
 * pasar esta función.
 */
export function verifyQrToken(opts: VerifyQrOptions): VerifyQrResult {
  const ttl = opts.ttlSeconds ?? TTL_SECONDS_DEFAULT;
  const now = opts.now ?? new Date();

  const parts = opts.token.split('.');
  if (parts.length !== 2) {
    return { ok: false, reason: 'malformed' };
  }
  const [payloadB64, signature] = parts as [string, string];

  // Validar firma
  const expected = createHmac('sha256', opts.secret).update(payloadB64).digest('base64url');
  const sigBuf = Buffer.from(signature, 'base64url');
  const expBuf = Buffer.from(expected, 'base64url');

  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return { ok: false, reason: 'invalid_signature' };
  }

  // Decodificar payload
  let raw: unknown;
  try {
    const json = Buffer.from(payloadB64, 'base64url').toString('utf8');
    raw = JSON.parse(json);
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  const parsed = qrPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: 'invalid_payload' };
  }

  // Validar expiración
  const nowSec = Math.floor(now.getTime() / 1000);
  if (nowSec > parsed.data.iat + ttl) {
    return { ok: false, reason: 'expired' };
  }

  // No aceptar tokens del futuro (reloj desfasado o malicioso)
  if (parsed.data.iat > nowSec + 30) {
    return { ok: false, reason: 'invalid_payload' };
  }

  return { ok: true, payload: parsed.data };
}
