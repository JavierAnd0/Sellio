import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { createClient } from '@sellio/db/server';
import { SupabaseCardRepository, SupabaseOrganizationRepository } from '@sellio/db/repositories';

import { CardForm } from '@/components/cards/card-form';
import { BuilderNav } from '@/components/cards/builder-nav';

export const metadata: Metadata = { title: 'Card Builder' };

interface CardBuilderPageProps {
  params: Promise<{ id: string }>;
}

export default async function CardBuilderPage({ params }: CardBuilderPageProps) {
  const { id } = await params;

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) redirect('/login');

  const [org, card] = await Promise.all([
    new SupabaseOrganizationRepository().findByOwner(user.id),
    new SupabaseCardRepository().findById(id),
  ]);

  if (!org) redirect('/app/dashboard');
  if (!card || card.orgId !== org.id) notFound();

  const primaryColor =
    typeof card.design === 'object' &&
    card.design !== null &&
    'primaryColor' in card.design &&
    typeof card.design.primaryColor === 'string'
      ? card.design.primaryColor
      : org.primaryColor;

  return (
    <>
      <BuilderNav orgName={org.name} />
      <div className="fixed inset-0 z-[99]">
        <CardForm
          card={card}
          primaryColor={primaryColor}
          autoSave
          exitHref={`/app/cards/${id}`}
        />
      </div>
    </>
  );
}
