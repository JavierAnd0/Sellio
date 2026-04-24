import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { createClient } from '@sellio/db/server';
import { SupabaseOrganizationRepository } from '@sellio/db/repositories';

import { CardForm } from '@/components/cards/card-form';
import { BuilderNav } from '@/components/cards/builder-nav';

export const metadata: Metadata = { title: 'Nueva tarjeta' };

export default async function NewCardPage() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) redirect('/app/dashboard');

  return (
    <>
      <BuilderNav orgName={org.name} />
      <div className="fixed inset-0 z-[99]">
        <CardForm primaryColor={org.primaryColor} exitHref="/app/cards" />
      </div>
    </>
  );
}
