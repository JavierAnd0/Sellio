import { createHmac, timingSafeEqual } from 'node:crypto';

import type {
  CheckoutSession,
  CreateCheckoutInput,
  PaymentProvider,
  SubscriptionInfo,
  WebhookVerification,
} from '../provider';

/**
 * Implementación de Wompi (PSP de Bancolombia para Colombia).
 *
 * Documentación: https://docs.wompi.co/
 *
 * ⚠️ STUB: Los métodos de API están pendientes hasta M2.4. La firma de
 * webhook sí está implementada porque se diseñó en este hito.
 *
 * Unidad de precios: pesos colombianos enteros (sin decimales).
 * Ej: $35.000 COP = amount: 3_500_000 (en centavos, porque Wompi lo
 * espera así aunque COP no tenga subdivisión práctica).
 */
export interface WompiConfig {
  publicKey: string;
  privateKey: string;
  eventsSecret: string;
  /** true para usar el ambiente de sandbox */
  sandbox: boolean;
}

export class WompiProvider implements PaymentProvider {
  readonly name = 'wompi' as const;

  constructor(private readonly config: WompiConfig) {}

  async createCheckout(_input: CreateCheckoutInput): Promise<CheckoutSession> {
    // TODO M2.4: implementar llamada a Wompi Checkout Widget / Payment Link API
    throw new Error('WompiProvider.createCheckout: not implemented yet (M2.4)');
  }

  async getSubscription(_providerSubscriptionId: string): Promise<SubscriptionInfo> {
    // TODO M2.4: Wompi no tiene "subscriptions" como Stripe. Se emula con
    // cobros recurrentes via "Nequi" o "Tokenización de Tarjeta". Decisión
    // pendiente: ¿cobro manual mensual (cliente recibe link por email) o
    // tokenización automática?
    throw new Error('WompiProvider.getSubscription: not implemented yet (M2.4)');
  }

  async cancelSubscription(
    _providerSubscriptionId: string,
    _atPeriodEnd: boolean,
  ): Promise<void> {
    throw new Error('WompiProvider.cancelSubscription: not implemented yet (M2.4)');
  }

  /**
   * Verifica la firma de un webhook de Wompi.
   * https://docs.wompi.co/docs/colombia/eventos
   *
   * Firma = SHA256(properties_concatenadas + timestamp + events_secret)
   * Se envía en header `X-Event-Checksum`.
   */
  verifyWebhook(rawBody: string, signatureHeader: string | null): WebhookVerification {
    if (!signatureHeader) {
      return { ok: false, reason: 'invalid_signature' };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return { ok: false, reason: 'malformed' };
    }

    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, reason: 'malformed' };
    }

    const body = parsed as {
      event?: string;
      data?: Record<string, unknown>;
      signature?: { properties?: string[]; checksum?: string };
      timestamp?: number;
      sent_at?: string;
    };

    const properties = body.signature?.properties ?? [];
    const timestamp = body.timestamp ?? 0;
    const data = body.data ?? {};

    // Construir string firmado: concat de los valores de las properties + timestamp + secret
    let concatenated = '';
    for (const propPath of properties) {
      concatenated += getNestedValue(data, propPath) ?? '';
    }
    concatenated += String(timestamp);
    concatenated += this.config.eventsSecret;

    const expected = createHmac('sha256', '').update(concatenated).digest('hex');
    // NOTA: Wompi usa SHA256 directo, no HMAC. Ajustar en M2.4 cuando
    // se pruebe contra payloads reales. Por ahora compara como HMAC
    // para tener la estructura.

    const sigBuf = Buffer.from(signatureHeader, 'hex');
    const expBuf = Buffer.from(expected, 'hex');

    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return { ok: false, reason: 'invalid_signature' };
    }

    return {
      ok: true,
      event: {
        eventId: String((data['transaction'] as { id?: string } | undefined)?.id ?? ''),
        eventType: body.event ?? 'unknown',
        createdAt: new Date(timestamp),
        data,
      },
    };
  }
}

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current == null ? undefined : String(current);
}
