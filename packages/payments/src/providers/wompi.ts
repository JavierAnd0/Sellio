import { createHash, timingSafeEqual } from 'node:crypto';

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
 * Unidad de precios: pesos colombianos enteros (sin decimales).
 * Ej: $35.000 COP = amount: 3500000 (en centavos, porque Wompi lo
 * espera así aunque COP no tenga subdivisión práctica).
 */
export interface WompiConfig {
  publicKey: string;
  privateKey: string;
  eventsSecret: string;
  integritySecret: string;
  /** true para usar el ambiente de sandbox */
  sandbox: boolean;
}

export class WompiProvider implements PaymentProvider {
  readonly name = 'wompi' as const;

  constructor(private readonly config: WompiConfig) {}

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession> {
    // Determinar precio según el plan.
    // Plan Basic: $35.000 COP -> 3_500_000 cents
    // Plan Elite: $95.000 COP -> 9_500_000 cents
    const amountInCents =
      input.planId === 'elite'
        ? 9500000
        : input.planId === 'basic'
          ? 3500000
          : 0;

    if (amountInCents === 0) {
      throw new Error(`Plan inválido para el checkout de Wompi: ${input.planId}`);
    }

    const currency = 'COP';
    const reference = `${input.orgId}_${Date.now()}`;

    // Calcular firma de integridad (obligatorio para Wompi Webcheckout)
    let integritySignature = '';
    if (this.config.integritySecret) {
      const concatenated = `${reference}${amountInCents}${currency}${this.config.integritySecret}`;
      integritySignature = createHash('sha256').update(concatenated).digest('hex');
    }

    // Construir la URL segura de Webcheckout con query params
    const url = new URL('https://checkout.wompi.co/p/');
    url.searchParams.set('public-key', this.config.publicKey);
    url.searchParams.set('currency', currency);
    url.searchParams.set('amount-in-cents', String(amountInCents));
    url.searchParams.set('reference', reference);
    
    if (integritySignature) {
      url.searchParams.set('signature:integrity', integritySignature);
    }
    
    url.searchParams.set('redirect-url', input.successUrl);

    return {
      id: reference,
      url: url.toString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Vence en 24 horas
    };
  }

  async getSubscription(providerSubscriptionId: string): Promise<SubscriptionInfo> {
    // Para Wompi (que se maneja localmente), retornamos una estructura simulada.
    // La suscripción real se lee y gestiona localmente en la base de datos de Sellio.
    return {
      providerSubscriptionId,
      providerCustomerId: 'wompi_customer_mock',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    };
  }

  async cancelSubscription(
    _providerSubscriptionId: string,
    _atPeriodEnd: boolean,
  ): Promise<void> {
    // La cancelación se maneja de forma local en la base de datos de Sellio
    return;
  }

  /**
   * Verifica la firma de un webhook de Wompi.
   * https://docs.wompi.co/docs/colombia/eventos
   *
   * Firma = SHA256(properties_concatenadas + timestamp + events_secret)
   * Se envía en el header `X-Event-Checksum`.
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

    // Calcular el checksum esperado usando SHA256 (Wompi no usa HMAC)
    const expected = createHash('sha256').update(concatenated).digest('hex');

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
