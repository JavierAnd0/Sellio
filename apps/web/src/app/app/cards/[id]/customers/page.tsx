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
    <div>
      <div className="mb-8">
        <Link
          href={`/app/cards/${id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg"
        >
          <ChevronLeft size={14} />
          {card.name}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-fg">
              Clientes
            </h1>
            <p className="mt-1 text-sm text-muted">
              {customers.length} {customers.length === 1 ? 'cliente' : 'clientes'} en esta tarjeta.
            </p>
          </div>
          <Link href={`/app/cards/${id}/customers?modal=add-customer`}>
            <Button size="md">
              <UserPlus size={16} />
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
