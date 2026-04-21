import { Resend } from 'resend';

let cachedClient: Resend | null = null;

export function getResendClient(): Resend {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');

  cachedClient = new Resend(apiKey);
  return cachedClient;
}

export function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? 'Sellio <noreply@sellio.co>';
}
