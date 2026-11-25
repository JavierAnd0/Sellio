import crypto from 'crypto';

// ─── Apple auth token ─────────────────────────────────────────────────────────
// Token determinístico por membership slug, verificado en el web service de Apple

function getWalletSecret(): string {
  const secret = process.env.WALLET_AUTH_SECRET;
  if (!secret) {
    throw new Error('WALLET_AUTH_SECRET is required');
  }
  return secret;
}

export function generateAppleAuthToken(slug: string): string {
  return crypto.createHmac('sha256', getWalletSecret()).update(slug).digest('hex').slice(0, 32);
}

export function verifyAppleAuthToken(slug: string, token: string): boolean {
  const expected = generateAppleAuthToken(slug);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(token, 'hex'));
  } catch {
    return false;
  }
}

// ─── Google Wallet ───────────────────────────────────────────────────────────

export { updateGoogleWalletPass } from '@sellio/db/google-wallet';
