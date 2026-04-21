import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { createClient } from '@sellio/db/server';
import { SupabaseCardRepository, SupabaseOrganizationRepository } from '@sellio/db/repositories';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';

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

  // Redirect to onboarding if the user hasn't created their first card yet
  const cards = await new SupabaseCardRepository().findByOrg(org.id);
  if (cards.length === 0) {
    redirect('/onboarding');
  }

  const userMeta = user.user_metadata as { full_name?: string } | undefined;

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar orgName={org?.name} />

      <div className="flex min-w-0 flex-1 flex-col">
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
