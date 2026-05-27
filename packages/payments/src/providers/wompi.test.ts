import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { WompiProvider } from './wompi';

const provider = new WompiProvider({
  publicKey: 'pub_test_123',
  privateKey: 'prv_test_123',
  eventsSecret: 'events_secret',
  integritySecret: 'integrity_secret',
  sandbox: true,
});

describe('WompiProvider', () => {
  it('builds a signed checkout URL for paid plans', async () => {
    const session = await provider.createCheckout({
      orgId: 'org_123',
      planId: 'basic',
      customerEmail: 'owner@sellio.co',
      successUrl: 'https://app.sellio.co/app/settings/billing',
      cancelUrl: 'https://app.sellio.co/app/settings/billing',
    });

    const url = new URL(session.url);
    const reference = url.searchParams.get('reference');
    const expectedSignature = createHash('sha256')
      .update(`${reference}3500000COPintegrity_secret`)
      .digest('hex');

    expect(session.id).toBe(reference);
    expect(url.origin).toBe('https://checkout.wompi.co');
    expect(url.searchParams.get('public-key')).toBe('pub_test_123');
    expect(url.searchParams.get('amount-in-cents')).toBe('3500000');
    expect(url.searchParams.get('signature:integrity')).toBe(expectedSignature);
  });

  it('rejects unknown plans before creating a checkout', async () => {
    await expect(
      provider.createCheckout({
        orgId: 'org_123',
        planId: 'enterprise',
        customerEmail: 'owner@sellio.co',
        successUrl: 'https://app.sellio.co/success',
        cancelUrl: 'https://app.sellio.co/cancel',
      }),
    ).rejects.toThrow('Plan inválido');
  });

  it('refuses to build a checkout URL without an integrity secret', async () => {
    const unsignedProvider = new WompiProvider({
      publicKey: 'pub_test_123',
      privateKey: 'prv_test_123',
      eventsSecret: 'events_secret',
      integritySecret: '',
      sandbox: true,
    });

    await expect(
      unsignedProvider.createCheckout({
        orgId: 'org_123',
        planId: 'basic',
        customerEmail: 'owner@sellio.co',
        successUrl: 'https://app.sellio.co/success',
        cancelUrl: 'https://app.sellio.co/cancel',
      }),
    ).rejects.toThrow('WOMPI_INTEGRITY_SECRET');
  });

  it('verifies valid transaction.updated webhooks', () => {
    const payload = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'txn_123',
          reference: 'org_123_1710000000000',
          amount_in_cents: 9500000,
          status: 'APPROVED',
          currency: 'COP',
        },
      },
      signature: {
        properties: ['transaction.id', 'transaction.status', 'transaction.reference'],
      },
      timestamp: 1710000000000,
    };
    const checksum = createHash('sha256')
      .update('txn_123APPROVEDorg_123_17100000000001710000000000events_secret')
      .digest('hex');

    const verification = provider.verifyWebhook(JSON.stringify(payload), checksum);

    expect(verification.ok).toBe(true);
    if (verification.ok) {
      expect(verification.event.eventId).toBe('txn_123');
      expect(verification.event.eventType).toBe('transaction.updated');
      expect(verification.event.data.transaction).toMatchObject({ status: 'APPROVED' });
    }
  });

  it('rejects malformed payloads and invalid signatures', () => {
    expect(provider.verifyWebhook('{bad json', 'abc')).toEqual({ ok: false, reason: 'malformed' });
    expect(provider.verifyWebhook(JSON.stringify({ data: {}, signature: { properties: [] } }), 'abc')).toEqual({
      ok: false,
      reason: 'invalid_signature',
    });
  });
});
