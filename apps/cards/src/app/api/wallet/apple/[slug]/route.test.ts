import { describe, expect, it, vi } from 'vitest';

vi.mock('@sellio/db/admin', () => ({
  createAdminClient: vi.fn(() => {
    throw new Error('Database should not be reached when Apple Wallet is not configured');
  }),
}));

describe('Apple Wallet pass route', () => {
  it('returns 503 (not 500) when certs are set but WALLET_AUTH_SECRET is missing', async () => {
    vi.resetModules();
    process.env.APPLE_PASS_TYPE_IDENTIFIER = 'pass.com.sellio.test';
    process.env.APPLE_TEAM_IDENTIFIER = 'ABC1234DEF';
    process.env.APPLE_PASS_CERTIFICATE = 'ZmFrZQ==';
    process.env.APPLE_WWDR_CERTIFICATE = 'ZmFrZQ==';
    delete process.env.WALLET_AUTH_SECRET;

    const { GET } = await import('./route');
    const response = await GET(new Request('https://cards.sellio.test/api/wallet/apple/member-1'), {
      params: Promise.resolve({ slug: 'member-1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.message).toContain('WALLET_AUTH_SECRET');
  });

  it('returns 503 when Apple certificates are missing', async () => {
    vi.resetModules();
    delete process.env.APPLE_PASS_CERTIFICATE;
    process.env.WALLET_AUTH_SECRET = 'test-secret';

    const { GET } = await import('./route');
    const response = await GET(new Request('https://cards.sellio.test/api/wallet/apple/member-1'), {
      params: Promise.resolve({ slug: 'member-1' }),
    });

    expect(response.status).toBe(503);
  });
});
