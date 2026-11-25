import crypto from 'node:crypto';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const createAdminClient = vi.fn(() => {
  throw new Error('Database should not be reached when Google Wallet is not configured');
});

vi.mock('@sellio/db/admin', () => ({ createAdminClient }));

function configureGoogle() {
  const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  process.env.GOOGLE_WALLET_ISSUER_ID = '3388000000000000000';
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'wallet@test.iam.gserviceaccount.com';
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = privateKey.export({ type: 'pkcs1', format: 'pem' }).toString();
}

/** Admin client falso: memberships devuelve una membresía; wallet_registrations según `existing`. */
function fakeDb(existing: boolean) {
  const insert = vi.fn(async () => ({ error: null }));
  const membership = {
    id: 'm1',
    slug: 'member-1',
    points: 3,
    cards: { name: 'Café', points_for_reward: 10, reward_description: 'Café gratis', design: null, organizations: { name: 'Café', slug: 'cafe', primary_color: '#E8341A' } },
    customers: { name: 'Ana' },
  };
  const chain = (result: unknown) => {
    const q: Record<string, unknown> = {};
    q.select = () => q;
    q.eq = () => q;
    q.maybeSingle = async () => ({ data: result, error: null });
    return q;
  };
  const from = vi.fn((table: string) =>
    table === 'memberships' ? chain(membership) : { ...chain(existing ? { id: 'r1' } : null), insert },
  );
  return { db: { from }, insert };
}

describe('Google Wallet route', () => {
  beforeEach(() => {
    vi.resetModules();
    createAdminClient.mockReset();
  });

  it('returns a clear 503 when required Google Wallet env vars are missing', async () => {
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

  it('records the Google save once and redirects to Google', async () => {
    configureGoogle();
    const { db, insert } = fakeDb(false);
    createAdminClient.mockReturnValue(db as never);

    const { GET } = await import('./route');
    const response = await GET(new Request('https://cards.sellio.test/api/wallet/google/member-1'), {
      params: Promise.resolve({ slug: 'member-1' }),
    });

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toMatch(/^https:\/\/pay\.google\.com\/gp\/v\/save\//);
    expect(insert).toHaveBeenCalledWith({ membership_slug: 'member-1', platform: 'google' });
  });

  it('does not duplicate the registration when the pass was already saved', async () => {
    configureGoogle();
    const { db, insert } = fakeDb(true);
    createAdminClient.mockReturnValue(db as never);

    const { GET } = await import('./route');
    await GET(new Request('https://cards.sellio.test/api/wallet/google/member-1'), {
      params: Promise.resolve({ slug: 'member-1' }),
    });

    expect(insert).not.toHaveBeenCalled();
  });
});
