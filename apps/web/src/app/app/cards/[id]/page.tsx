import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft, Users } from 'lucide-react';

import { createClient } from '@sellio/db/server';
import { SupabaseCardRepository, SupabaseMembershipRepository, SupabaseOrganizationRepository } from '@sellio/db/repositories';
import { Button } from '@sellio/ui';

import { CardDetailEdit } from '@/components/cards/card-detail-edit';

export const metadata: Metadata = { title: 'Editar tarjeta' };

interface CardDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const { id } = await params;

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) redirect('/login');

  const [org, card, memberCount] = await Promise.all([
    new SupabaseOrganizationRepository().findByOwner(user.id),
    new SupabaseCardRepository().findById(id),
    new SupabaseMembershipRepository().countByCard(id),
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
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link
          href="/app/cards"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg"
        >
          <ChevronLeft size={14} />
          Tarjetas
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-fg">
              {card.name}
            </h1>
            <p className="mt-1 text-sm text-muted">Ajustes de la tarjeta.</p>
          </div>
          <Link href={`/app/cards/${id}/customers`}>
            <Button variant="secondary" size="sm">
              <Users size={14} />
              Ver clientes
            </Button>
          </Link>
        </div>
      </div>

      <CardDetailEdit card={card} primaryColor={primaryColor} canDelete={memberCount === 0} />
    </div>
  );
}
