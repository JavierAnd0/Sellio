import { z } from 'zod';

/**
 * Contrato común para proveedores de pago.
 * Implementado por Wompi (M2) y Stripe (post-M4, al expandir a US).
 *
 * Los precios SIEMPRE se manejan en la menor unidad de la moneda:
 *   - COP: pesos enteros (no centavos — el COP no tiene subdivisión de uso común)
 *   - USD: centavos
 *
 * Cada provider documenta su unidad en su implementación.
 */

export type Currency = 'COP' | 'USD';

export interface PlanPricing {
  planId: string;
  name: string;
  amount: number;
  currency: Currency;
  intervalMonths: number;
}

export interface CheckoutSession {
  id: string;
  url: string;
  expiresAt: Date;
}

export interface CreateCheckoutInput {
  orgId: string;
  planId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  /** Metadata arbitraria que el provider retorna en webhooks */
  metadata?: Record<string, string>;
}

export interface SubscriptionInfo {
  providerSubscriptionId: string;
  providerCustomerId: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export const webhookEventSchema = z.object({
  eventId: z.string(),
  eventType: z.string(),
  createdAt: z.date(),
  data: z.record(z.unknown()),
});

export type WebhookEvent = z.infer<typeof webhookEventSchema>;

export type WebhookVerification =
  | { ok: true; event: WebhookEvent }
  | { ok: false; reason: 'invalid_signature' | 'malformed' };

export interface PaymentProvider {
  readonly name: 'wompi' | 'stripe';

  createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession>;

  getSubscription(providerSubscriptionId: string): Promise<SubscriptionInfo>;

  cancelSubscription(providerSubscriptionId: string, atPeriodEnd: boolean): Promise<void>;

  verifyWebhook(rawBody: string, signatureHeader: string | null): WebhookVerification;
}
