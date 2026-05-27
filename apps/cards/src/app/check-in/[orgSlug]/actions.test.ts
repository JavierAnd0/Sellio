import { describe, expect, it, vi } from 'vitest';

const createAdminClient = vi.fn();

vi.mock('@sellio/db/admin', () => ({
  createAdminClient,
}));

vi.mock('@/lib/wallet-updates', () => ({
  updateGoogleWalletPass: vi.fn(),
}));

describe('checkInAction', () => {
  it('validates the customer name before using the database', async () => {
    const { checkInAction } = await import('./actions');
    const formData = new FormData();
    formData.set('phone', '+57 300 000 0000');

    const result = await checkInAction('demo', formData);

    expect(result).toEqual({ ok: false, error: 'Ingresa tu nombre completo.' });
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('validates the phone number before using the database', async () => {
    const { checkInAction } = await import('./actions');
    const formData = new FormData();
    formData.set('name', 'Ana García');
    formData.set('phone', 'abc');

    const result = await checkInAction('demo', formData);

    expect(result).toEqual({ ok: false, error: 'Ingresa un número de teléfono válido.' });
    expect(createAdminClient).not.toHaveBeenCalled();
  });
});
