'use server';

import { createClient } from '@sellio/db/server';
import { SupabaseOrganizationRepository } from '@sellio/db/repositories';
import { getPaymentProvider } from '@sellio/payments';

export type CheckoutActionResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function createCheckoutSessionAction(
  planId: 'basic' | 'elite',
): Promise<CheckoutActionResult> {
  try {
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();

    if (!user) {
      return { ok: false, error: 'Sesión expirada. Vuelve a iniciar sesión.' };
    }

    const orgRepo = new SupabaseOrganizationRepository();
    const org = await orgRepo.findByOwner(user.id);

    if (!org) {
      return { ok: false, error: 'Organización no encontrada.' };
    }

    // Initialize Wompi payment provider (CO -> Wompi)
    const provider = getPaymentProvider((org.country as 'CO' | 'US') || 'CO');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const successUrl = `${appUrl}/app/settings/billing?session=success`;
    const cancelUrl = `${appUrl}/app/settings/billing?session=cancel`;

    const session = await provider.createCheckout({
      orgId: org.id,
      planId,
      customerEmail: user.email ?? '',
      successUrl,
      cancelUrl,
    });

    return { ok: true, url: session.url };
  } catch (err: any) {
    console.error('[createCheckoutSessionAction] Error:', err);
    return {
      ok: false,
      error: err?.message || 'Error al iniciar el proceso de pago. Intenta de nuevo.',
    };
  }
}
