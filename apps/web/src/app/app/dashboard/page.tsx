import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CreditCard, Plus, Users } from 'lucide-react';

import { createClient } from '@sellio/db/server';
import {
  SupabaseCardRepository,
  SupabaseCustomerRepository,
  SupabaseOrganizationRepository,
} from '@sellio/db/repositories';
import { Button } from '@sellio/ui';

import { CardListItem } from '@/components/cards/card-list-item';

export const metadata: Metadata = { title: 'Overview' };

export default async function DashboardPage() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) redirect('/onboarding');

  const cardRepo = new SupabaseCardRepository();
  const customerRepo = new SupabaseCustomerRepository();

  const [cards, totalCustomers] = await Promise.all([
    cardRepo.findByOrg(org.id),
    customerRepo.countByOrg(org.id),
  ]);

  // Member counts per card (memberships grouped by card)
  const { data: memberCountsRaw } = await db
    .from('memberships')
    .select('card_id')
    .in('card_id', cards.map((c) => c.id));

  const memberCountMap: Record<string, number> = {};
  for (const row of memberCountsRaw ?? []) {
    memberCountMap[row.card_id] = (memberCountMap[row.card_id] ?? 0) + 1;
  }

  // Total points issued across all cards
  const { data: pointsRaw } = await db
    .from('memberships')
    .select('points')
    .in('card_id', cards.map((c) => c.id));

  const totalPoints = (pointsRaw ?? []).reduce((sum, r) => sum + r.points, 0);

  const activeCards = cards.filter((c) => c.active).length;

  const stats = [
    {
      label: 'Tarjetas activas',
      value: activeCards,
      icon: CreditCard,
      href: '/app/cards',
    },
    {
      label: 'Clientes registrados',
      value: totalCustomers,
      icon: Users,
      href: '/app/cards',
    },
    {
      label: 'Puntos acumulados',
      value: totalPoints.toLocaleString('es-CO'),
      icon: StarIcon,
      href: null,
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-fg">
          Bienvenido, {org.name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Resumen de tu programa de lealtad.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const inner = (
            <div className="flex items-center gap-4 rounded-2xl border border-border/20 bg-surface p-5 transition-all hover:border-border hover:shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral">
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {stat.label}
                </p>
                <p className="mt-0.5 font-display text-2xl font-extrabold tracking-tight text-fg">
                  {stat.value}
                </p>
              </div>
            </div>
          );

          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {inner}
            </Link>
          ) : (
            <div key={stat.label}>{inner}</div>
          );
        })}
      </div>

      {/* Cards section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-fg">
          Tus tarjetas
        </h2>
        <Link href="/app/cards">
          <Button variant="secondary" size="sm">
            Ver todas
          </Button>
        </Link>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
          <div className="mb-4 rounded-full bg-surface-2 p-4">
            <CreditCard size={24} className="text-muted" />
          </div>
          <h3 className="font-display text-base font-bold text-fg">
            Aún no tienes tarjetas
          </h3>
          <p className="mt-1.5 max-w-xs text-sm text-muted">
            Crea tu primera tarjeta de lealtad para empezar a fidelizar clientes.
          </p>
          <div className="mt-5">
            <Link href="/app/cards/new">
              <Button size="md">
                <Plus size={16} />
                Nueva tarjeta
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.slice(0, 6).map((card) => (
            <CardListItem
              key={card.id}
              card={card}
              memberCount={memberCountMap[card.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StarIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
