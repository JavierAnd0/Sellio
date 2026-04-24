import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft, UserPlus } from 'lucide-react';

import { createClient } from '@sellio/db/server';
import {
  SupabaseCardRepository,
  SupabaseCustomerRepository,
  SupabaseOrganizationRepository,
} from '@sellio/db/repositories';
import { Button } from '@sellio/ui';

import { CustomerTable } from '@/components/cards/customer-table';
import { AddCustomerModal } from '@/components/cards/add-customer-modal';

export const metadata: Metadata = { title: 'Clientes de tarjeta' };

interface CustomersPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ modal?: string }>;
}

export default async function CardCustomersPage({ params, searchParams }: CustomersPageProps) {
  const { id } = await params;
  const { modal } = await searchParams;

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(id)) {
    notFound();
  }

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

  const customers = await new SupabaseCustomerRepository().findByCard(id);
  const closeHref = `/app/cards/${id}/customers`;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12 w-full max-w-6xl mx-auto">
      <div className="mb-2">
        <Link
          href={`/app/cards/${id}`}
          className="mb-6 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-muted transition-colors hover:text-fg"
        >
          <ChevronLeft size={14} strokeWidth={3} />
          {card.name}
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-fg">
              Clientes
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted max-w-lg leading-relaxed">
              Administra los {customers.length} {customers.length === 1 ? 'cliente' : 'clientes'} asociados a tu tarjeta de lealtad.
            </p>
          </div>
          <Link href={`/app/cards/${id}/customers?modal=add-customer`}>
            <Button size="lg" className="bg-[#E8341A] hover:bg-[#D02B13] text-white rounded-xl shadow-lg shadow-coral/20 font-bold px-6 sm:px-8 border-0 transition-transform active:scale-95 flex items-center gap-2">
              <UserPlus size={18} />
              Agregar cliente
            </Button>
          </Link>
        </div>
      </div>

      <CustomerTable customers={customers} />

      {modal === 'add-customer' && (
        <AddCustomerModal cardId={id} closeHref={closeHref} />
      )}
    </div>
  );
}
