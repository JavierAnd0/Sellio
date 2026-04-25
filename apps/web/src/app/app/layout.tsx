import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { createClient } from '@sellio/db/server';
import { SupabaseCardRepository, SupabaseCustomerRepository, SupabaseOrganizationRepository } from '@sellio/db/repositories';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import { getEffectiveTier, getTrialDaysLeft } from '@/lib/trial';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const orgRepo = new SupabaseOrganizationRepository();
  const org = await orgRepo.findByOwner(user.id);

  if (!org) {
    redirect('/onboarding');
  }

  const cards = await new SupabaseCardRepository().findByOrg(org.id);

  const customerRepo = new SupabaseCustomerRepository();
  const totalCustomers = await customerRepo.countByOrg(org.id);

  const userMeta = user.user_metadata as { full_name?: string } | undefined;
  const effectiveTier = getEffectiveTier(org);
  const trialDaysLeft = getTrialDaysLeft(org);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar
        plan={effectiveTier}
        trialDaysLeft={trialDaysLeft}
        totalCards={cards.length}
        totalCustomers={totalCustomers}
        firstCardId={cards[0]?.id}
        orgName={org.name}
        userEmail={user.email}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar
          userEmail={user.email}
          userFullName={userMeta?.full_name ?? null}
        />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
