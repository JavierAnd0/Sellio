import crypto from 'crypto';

function signJwt(payload: object, privateKey: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${header}.${body}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(data);
  return `${data}.${signer.sign(privateKey, 'base64url')}`;
}

async function getGoogleAccessToken(saEmail: string, saPrivateKey: string): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  const jwt = signJwt(
    {
      iss: saEmail,
      scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    },
    saPrivateKey,
  );
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  } catch {
    return null;
  }
}

export async function updateGoogleWalletPass(
  membershipSlug: string,
  newPoints: number,
  pointsForReward: number,
): Promise<void> {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const saPrivateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

  if (!issuerId || !saEmail || !saPrivateKey) return;

  const accessToken = await getGoogleAccessToken(saEmail, saPrivateKey);
  if (!accessToken) return;

  const objectId = `${issuerId}.${membershipSlug.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/genericObject/${encodeURIComponent(objectId)}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        header: {
          defaultValue: { language: 'es', value: `${newPoints} / ${pointsForReward} pts` },
        },
      }),
    },
  ).catch(() => {});
}
