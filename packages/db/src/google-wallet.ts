import crypto from 'node:crypto';

/**
 * Google Wallet — utilidades de servidor compartidas por apps/web y apps/cards.
 * Los objects se identifican como `{issuerId}.{slug saneado}`.
 */

interface GoogleWalletConfig {
  issuerId: string;
  saEmail: string;
  saPrivateKey: string;
}

export function getGoogleWalletConfig(env: NodeJS.ProcessEnv = process.env): GoogleWalletConfig | null {
  const issuerId = env.GOOGLE_WALLET_ISSUER_ID;
  const saEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const saPrivateKey = (env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
  if (!issuerId || !saEmail || !saPrivateKey) return null;
  return { issuerId, saEmail, saPrivateKey };
}

export function googleObjectId(issuerId: string, membershipSlug: string): string {
  return `${issuerId}.${membershipSlug.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}

export function signGoogleJwt(payload: object, privateKey: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${header}.${body}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(data);
  return `${data}.${signer.sign(privateKey, 'base64url')}`;
}

async function getAccessToken(config: GoogleWalletConfig): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  const assertion = signGoogleJwt(
    {
      iss: config.saEmail,
      scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    },
    config.saPrivateKey,
  );

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  } catch {
    return null;
  }
}

const OBJECTS_API = 'https://walletobjects.googleapis.com/walletobjects/v1/genericObject';

/** Actualiza el contador de puntos de un pass guardado. No-op si no está configurado. */
export async function updateGoogleWalletPass(
  membershipSlug: string,
  newPoints: number,
  pointsForReward: number,
): Promise<void> {
  const config = getGoogleWalletConfig();
  if (!config) return;
  const accessToken = await getAccessToken(config);
  if (!accessToken) return;

  const objectId = googleObjectId(config.issuerId, membershipSlug);
  await fetch(`${OBJECTS_API}/${encodeURIComponent(objectId)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      header: { defaultValue: { language: 'es', value: `${newPoints} / ${pointsForReward} pts` } },
    }),
  }).catch(() => {});
}

/**
 * Añade un mensaje con notificación a cada pass guardado. Los slugs cuyo pass
 * nunca se guardó en Google Wallet devuelven 404 y se ignoran.
 * Google limita a 3 notificaciones por pass cada 24 h.
 * Devuelve cuántos passes recibieron el mensaje.
 */
export async function sendGoogleWalletMessage(
  membershipSlugs: string[],
  message: { id: string; header: string; body: string },
): Promise<number> {
  const config = getGoogleWalletConfig();
  if (!config || membershipSlugs.length === 0) return 0;
  const accessToken = await getAccessToken(config);
  if (!accessToken) return 0;

  let delivered = 0;
  const CONCURRENCY = 10;
  for (let i = 0; i < membershipSlugs.length; i += CONCURRENCY) {
    const batch = membershipSlugs.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((slug) =>
        fetch(`${OBJECTS_API}/${encodeURIComponent(googleObjectId(config.issuerId, slug))}/addMessage`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: {
              id: message.id,
              header: message.header,
              body: message.body,
              messageType: 'TEXT_AND_NOTIFY',
            },
          }),
        }),
      ),
    );
    delivered += results.filter((r) => r.status === 'fulfilled' && r.value.ok).length;
  }
  return delivered;
}
