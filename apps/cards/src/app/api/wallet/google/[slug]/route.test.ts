import { describe, expect, it, vi } from 'vitest';

vi.mock('@sellio/db/admin', () => ({
  createAdminClient: vi.fn(() => {
    throw new Error('Database should not be reached when Google Wallet is not configured');
  }),
}));

describe('Google Wallet route', () => {
  it('returns a clear 503 when required Google Wallet env vars are missing', async () => {
    vi.resetModules();
    delete process.env.GOOGLE_WALLET_ISSUER_ID;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    const { GET } = await import('./route');
    const response = await GET(new Request('https://cards.sellio.test/api/wallet/google/member-1'), {
      params: Promise.resolve({ slug: 'member-1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toContain('Google Wallet not configured');
  });
});
