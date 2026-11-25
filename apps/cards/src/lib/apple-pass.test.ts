import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@sellio/db/admin', () => ({ createAdminClient: vi.fn() }));

import { buildPassJson, getAppleWalletEnv, type PassData } from './apple-pass';

const base: PassData = {
  slug: 'm-1',
  points: 7,
  cardName: 'Café',
  pointsForReward: 10,
  rewardDescription: 'Café gratis',
  primaryColorHex: '#E8341A',
  orgName: 'Café Sellio',
  orgSlug: 'cafe-sellio',
  customerName: 'Ana',
  campaign: null,
};
const env = { passTypeIdentifier: 'pass.com.sellio.test', teamIdentifier: 'ABC1234DEF' };

beforeAll(() => {
  process.env.WALLET_AUTH_SECRET = 'test-secret';
});

describe('buildPassJson', () => {
  it('puts the latest campaign first on the back with a changeMessage so iOS notifies', () => {
    const json = buildPassJson(
      { ...base, campaign: { title: 'Promo sábado', message: '2x1 en cafés', sentAt: '2026-11-24T00:00:00Z' } },
      env,
    );
    expect(json.storeCard.backFields[0]).toEqual({
      key: 'campaign',
      label: 'Promo sábado',
      value: '2x1 en cafés',
      changeMessage: '%@',
    });
  });

  it('omits the campaign field when nothing was sent', () => {
    const json = buildPassJson(base, env);
    expect(json.storeCard.backFields.map((f) => f.key)).toEqual(['instructions', 'link']);
    expect(json.storeCard.primaryFields[0]?.value).toBe('7 / 10');
    expect(json.backgroundColor).toBe('rgb(232, 52, 26)');
  });
});

describe('getAppleWalletEnv', () => {
  it('requires WALLET_AUTH_SECRET alongside the certificates', () => {
    const certs = {
      APPLE_PASS_TYPE_IDENTIFIER: 'p',
      APPLE_TEAM_IDENTIFIER: 't',
      APPLE_WWDR_CERTIFICATE: 'w',
      APPLE_PASS_CERTIFICATE: 'c',
    };
    expect(getAppleWalletEnv(certs)).toBeNull();
    expect(getAppleWalletEnv({ ...certs, WALLET_AUTH_SECRET: 's' })?.passTypeIdentifier).toBe('p');
  });
});
