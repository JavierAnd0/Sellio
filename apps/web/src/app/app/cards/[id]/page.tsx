import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { ChevronLeft, Pencil } from 'lucide-react';

import { createClient } from '@sellio/db/server';
import { SupabaseCardRepository, SupabaseMembershipRepository, SupabaseOrganizationRepository } from '@sellio/db/repositories';

import { CardDetailView } from '@/components/cards/card-detail-view';

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

  const membershipRepo = new SupabaseMembershipRepository();

  const [org, card, memberCount] = await Promise.all([
    new SupabaseOrganizationRepository().findByOwner(user.id),
    new SupabaseCardRepository().findById(id),
    membershipRepo.countByCard(id),
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
    <div>
      <div className="mb-10 flex items-center justify-between border-b border-border/30 pb-6">
        <Link
          href="/app/cards"
          className="flex w-[150px] items-center gap-2 text-[14px] font-bold text-muted transition-colors hover:text-fg"
        >
          <ChevronLeft size={16} /> Mis tarjetas
        </Link>
        
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="font-display text-4xl font-black uppercase tracking-wider text-fg">
            {card.name}
          </h1>
          <p className="mt-1 text-[16px] font-medium text-muted">
            Café Central · {memberCount} clientes
          </p>
        </div>

        <div className="flex w-[150px] justify-end">
          <Link href={`/app/cards/${id}/builder`}>
            <button className="flex items-center gap-2 rounded-xl border border-border/40 bg-[#E1DED5]/40 px-4 py-2.5 text-[14px] font-bold text-fg transition-colors hover:bg-[#E1DED5]/80 dark:bg-surface">
              <Pencil size={15} /> Editar diseño
            </button>
          </Link>
        </div>
      </div>

      <CardDetailView
        card={card}
        primaryColor={primaryColor}
        memberCount={memberCount}
      />
    </div>
  );
}
