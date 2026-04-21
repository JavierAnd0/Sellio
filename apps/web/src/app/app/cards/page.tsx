import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';

import { createClient } from '@sellio/db/server';
import { SupabaseCardRepository, SupabaseOrganizationRepository } from '@sellio/db/repositories';
import { Button } from '@sellio/ui';

import { CardListItem } from '@/components/cards/card-list-item';

export const metadata: Metadata = { title: 'Tarjetas de lealtad' };

export default async function CardsPage() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) redirect('/app/dashboard');

  const cards = await new SupabaseCardRepository().findByOrg(org.id);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-fg">
            Tarjetas de lealtad
          </h1>
          <p className="mt-1 text-sm text-muted">
            Crea y gestiona tus programas de puntos.
          </p>
        </div>
        <Link href="/app/cards/new">
          <Button size="md">
            <Plus size={16} />
            Nueva tarjeta
          </Button>
        </Link>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-20 text-center">
          <div className="mb-4 rounded-full bg-surface-2 p-4">
            <Plus size={24} className="text-muted" />
          </div>
          <h2 className="font-display text-lg font-bold text-fg">
            Aún no tienes tarjetas
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Crea tu primera tarjeta de lealtad para empezar a fidelizar a tus clientes.
          </p>
          <div className="mt-6">
            <Link href="/app/cards/new">
              <Button size="md">
                <Plus size={16} />
                Crear primera tarjeta
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <CardListItem key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
