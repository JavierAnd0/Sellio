import type { Metadata } from 'next';
import { Suspense } from 'react';

import { createClient } from '@sellio/db/server';
import { SupabaseOrganizationRepository } from '@sellio/db/repositories';
import { BillingContent } from '@/components/settings/billing-content';

export const metadata: Metadata = { title: 'Facturación | Configuración' };

export default async function BillingPage() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  let currentPlan = 'free';
  if (user) {
    const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
    if (org) {
      currentPlan = org.plan;
    }
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Cargando facturación...</div>}>
      <BillingContent currentPlan={currentPlan} />
    </Suspense>
  );
}
