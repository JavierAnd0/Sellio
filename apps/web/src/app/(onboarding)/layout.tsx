import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { createClient } from '@sellio/db/server';
import { SupabaseCardRepository, SupabaseOrganizationRepository } from '@sellio/db/repositories';

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);

  // If org has cards already, onboarding is complete
  if (org) {
    const cards = await new SupabaseCardRepository().findByOrg(org.id);
    if (cards.length > 0) {
      redirect('/app/dashboard');
    }
  }

  return <>{children}</>;
}
