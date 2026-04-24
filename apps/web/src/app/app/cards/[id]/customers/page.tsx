import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@sellio/db/server';
import {
  SupabaseCardRepository,
  SupabaseCustomerRepository,
  SupabaseOrganizationRepository,
} from '@sellio/db/repositories';

import { CustomerTable } from '@/components/cards/customer-table';

export const metadata: Metadata = { title: 'Clientes de tarjeta' };

interface CustomersPageProps {
  params: Promise<{ id: string }>;
}

export default async function CardCustomersPage({ params }: CustomersPageProps) {
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

  const [org, card] = await Promise.all([
    new SupabaseOrganizationRepository().findByOwner(user.id),
    new SupabaseCardRepository().findById(id),
  ]);

  if (!org) redirect('/app/dashboard');
  if (!card || card.orgId !== org.id) notFound();

  const customers = await new SupabaseCustomerRepository().findByCard(id);
  const maxCustomers = org.plan === 'basic' ? 500 : org.plan === 'elite' ? null : 50;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href={`/app/cards/${id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-muted transition-colors hover:text-fg"
        >
          <ChevronLeft size={14} strokeWidth={3} />
          {card.name}
        </Link>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-fg">
              Clientes
            </h1>
            <p className="mt-1 text-sm text-muted font-medium">
              {customers.length}{maxCustomers ? `/${maxCustomers}` : ''} clientes
            </p>
          </div>
        </div>
      </div>

      <CustomerTable customers={customers} maxCustomers={maxCustomers} plan={org.plan} />
    </div>
  );
}
