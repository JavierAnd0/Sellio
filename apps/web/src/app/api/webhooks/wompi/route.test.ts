import { beforeEach, describe, expect, it, vi } from 'vitest';

const verifyWebhook = vi.fn();
const from = vi.fn();

vi.mock('@sellio/payments', () => ({
  getPaymentProvider: vi.fn(() => ({ verifyWebhook })),
}));

vi.mock('@sellio/db/admin', () => ({
  createAdminClient: vi.fn(() => ({ from })),
}));

function chain(result: unknown = { data: null, error: null }) {
  const api: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'update', 'insert']) {
    api[method] = vi.fn(() => api);
  }
  api.maybeSingle = vi.fn(async () => result);
  api.single = vi.fn(async () => result);
  return api;
}

describe('Wompi webhook route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid signatures before touching the database', async () => {
    verifyWebhook.mockReturnValue({ ok: false, reason: 'invalid_signature' });

    const { POST } = await import('./route');
    const response = await POST(
      new Request('https://app.sellio.test/api/webhooks/wompi', {
        method: 'POST',
        body: '{}',
        headers: { 'x-event-checksum': 'bad' },
      }),
    );

    expect(response.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it('processes an approved transaction once and records the webhook', async () => {
    verifyWebhook.mockReturnValue({
      ok: true,
      event: {
        eventId: 'txn_123',
        eventType: 'transaction.updated',
        createdAt: new Date('2026-05-27T00:00:00Z'),
        data: {
          transaction: {
            id: 'txn_123',
            amount_in_cents: 9500000,
            reference: 'org_123_1710000000000',
            status: 'APPROVED',
            currency: 'COP',
          },
        },
      },
    });

    from.mockImplementation((table: string) => {
      if (table === 'webhook_events') return chain({ data: null, error: null });
      if (table === 'organizations') return chain({ data: null, error: null });
      if (table === 'subscriptions') {
        const sub = chain({ data: null, error: null });
        sub.single = vi.fn(async () => ({ data: { id: 'sub_123' }, error: null }));
        return sub;
      }
      if (table === 'invoices') return chain({ data: null, error: null });
      return chain();
    });

    const { POST } = await import('./route');
    const response = await POST(
      new Request('https://app.sellio.test/api/webhooks/wompi', {
        method: 'POST',
        body: JSON.stringify({ event: 'transaction.updated' }),
        headers: { 'x-event-checksum': 'ok' },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith('webhook_events');
    expect(from).toHaveBeenCalledWith('organizations');
    expect(from).toHaveBeenCalledWith('subscriptions');
    expect(from).toHaveBeenCalledWith('invoices');
  });
});
