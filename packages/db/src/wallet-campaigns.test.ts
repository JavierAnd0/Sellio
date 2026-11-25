import { describe, expect, it } from 'vitest';

import { aggregateReach, passUpdatedAt } from './wallet-campaigns';

const membership = { last_activity_at: '2026-11-20T10:00:00.000Z', card_id: 'card-a', org_id: 'org-1' };

describe('passUpdatedAt', () => {
  it('uses the points activity when there are no newer campaigns', () => {
    expect(passUpdatedAt(membership, [])).toBe('2026-11-20T10:00:00.000Z');
    expect(
      passUpdatedAt(membership, [{ org_id: 'org-1', card_id: null, sent_at: '2026-11-01T00:00:00.000Z' }]),
    ).toBe('2026-11-20T10:00:00.000Z');
  });

  it('picks a newer campaign for the same card or for the whole org', () => {
    expect(
      passUpdatedAt(membership, [{ org_id: 'org-1', card_id: 'card-a', sent_at: '2026-11-24T09:00:00.000Z' }]),
    ).toBe('2026-11-24T09:00:00.000Z');
    expect(
      passUpdatedAt(membership, [{ org_id: 'org-1', card_id: null, sent_at: '2026-11-24T09:00:00.000Z' }]),
    ).toBe('2026-11-24T09:00:00.000Z');
  });

  it('ignores campaigns for other cards or other organizations', () => {
    expect(
      passUpdatedAt(membership, [
        { org_id: 'org-1', card_id: 'card-b', sent_at: '2026-11-24T09:00:00.000Z' },
        { org_id: 'org-2', card_id: null, sent_at: '2026-11-24T09:00:00.000Z' },
      ]),
    ).toBe('2026-11-20T10:00:00.000Z');
  });

  it('handles memberships with no points activity yet', () => {
    expect(passUpdatedAt({ ...membership, last_activity_at: null }, [])).toBeNull();
    expect(
      passUpdatedAt({ ...membership, last_activity_at: null }, [
        { org_id: 'org-1', card_id: null, sent_at: '2026-11-24T09:00:00.000Z' },
      ]),
    ).toBe('2026-11-24T09:00:00.000Z');
  });
});

describe('aggregateReach', () => {
  const memberships = [
    { slug: 'ana-cafe', card_id: 'cafe', customer_id: 'ana' },
    { slug: 'ana-postre', card_id: 'postre', customer_id: 'ana' },
    { slug: 'luis-cafe', card_id: 'cafe', customer_id: 'luis' },
    { slug: 'eva-postre', card_id: 'postre', customer_id: 'eva' },
    { slug: 'otro-org', card_id: 'ajena', customer_id: 'zoe' },
  ];

  it('counts customers per card and dedupes them across cards for "all"', () => {
    const r = aggregateReach(['cafe', 'postre'], memberships, []);
    expect(r.byCard.cafe!.customers).toBe(2);
    expect(r.byCard.postre!.customers).toBe(2);
    expect(r.all.customers).toBe(3); // ana tiene dos tarjetas: cuenta una vez
  });

  it('counts Apple devices and Google passes per card, ignoring other orgs and duplicate Google rows', () => {
    const r = aggregateReach(['cafe', 'postre'], memberships, [
      { membership_slug: 'ana-cafe', platform: 'apple' },
      { membership_slug: 'ana-cafe', platform: 'apple' }, // iPhone + otro dispositivo
      { membership_slug: 'luis-cafe', platform: 'google' },
      { membership_slug: 'luis-cafe', platform: 'google' }, // guardó dos veces
      { membership_slug: 'eva-postre', platform: 'google' },
      { membership_slug: 'otro-org', platform: 'apple' },
    ]);
    expect(r.byCard.cafe!.wallet).toEqual({ apple: 2, google: 1 });
    expect(r.byCard.postre!.wallet).toEqual({ apple: 0, google: 1 });
    expect(r.all.wallet).toEqual({ apple: 2, google: 2 });
  });

  it('returns zeroed cards with no memberships', () => {
    expect(aggregateReach(['vacia'], [], []).byCard.vacia).toEqual({ customers: 0, wallet: { apple: 0, google: 0 } });
  });
});
