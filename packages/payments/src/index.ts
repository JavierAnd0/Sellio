import type { PaymentProvider } from './provider';
import { WompiProvider } from './providers/wompi';

export * from './provider';
export { WompiProvider };

/**
 * Factory: retorna el proveedor apropiado según el país.
 * CO → Wompi. US → Stripe (futuro).
 */
export function getPaymentProvider(country: 'CO' | 'US'): PaymentProvider {
  if (country === 'CO') {
    const publicKey = process.env.WOMPI_PUBLIC_KEY;
    const privateKey = process.env.WOMPI_PRIVATE_KEY;
    const eventsSecret = process.env.WOMPI_EVENTS_SECRET;

    if (!publicKey || !privateKey || !eventsSecret) {
      throw new Error('Missing Wompi environment variables');
    }

    return new WompiProvider({
      publicKey,
      privateKey,
      eventsSecret,
      sandbox: publicKey.startsWith('pub_test_'),
    });
  }

  throw new Error(`Payment provider for country ${country} not implemented yet`);
}
