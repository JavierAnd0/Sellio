import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@sellio/db/server';
import { SupabaseOrganizationRepository } from '@sellio/db/repositories';

import { CardForm } from '@/components/cards/card-form';

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
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link
          href="/app/cards"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg"
        >
          <ChevronLeft size={14} />
          Tarjetas
        </Link>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-fg">
          Nueva tarjeta
        </h1>
        <p className="mt-1 text-sm text-muted">
          Configura tu programa de lealtad.
        </p>
      </div>

      <CardForm primaryColor={org.primaryColor} />
    </div>
  );
}
