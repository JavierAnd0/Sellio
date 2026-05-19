import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Printer, Download, Lock } from 'lucide-react';

import { createClient } from '@sellio/db/server';
import { SupabaseCardRepository, SupabaseMembershipRepository, SupabaseOrganizationRepository } from '@sellio/db/repositories';
import { Button } from '@sellio/ui';

import { CardListItem } from '@/components/cards/card-list-item';

export const metadata: Metadata = { title: 'Tarjetas de lealtad' };

const FREE_CARD_LIMIT = 1;

export default async function CardsPage() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) redirect('/app/dashboard');

  const cards = await new SupabaseCardRepository().findByOrg(org.id);

  const membershipRepo = new SupabaseMembershipRepository();
  const cardStats = await Promise.all(
    cards.map(async (card) => {
      const [memberCount, totalPoints, totalScans] = await Promise.all([
        membershipRepo.countByCard(card.id),
        membershipRepo.sumPointsByCard(card.id),
        membershipRepo.countScansByCard(card.id),
      ]);
      return { cardId: card.id, memberCount, totalPoints, totalScans };
    }),
  );

  const statsMap = Object.fromEntries(cardStats.map((s) => [s.cardId, s]));
  const atLimit = cards.length >= FREE_CARD_LIMIT;

  return (
    <div>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight text-fg">
            Mis Tarjetas
          </h1>
          <p className="mt-1 text-[15px] font-medium text-muted">
            {cards.length}/{FREE_CARD_LIMIT} tarjetas
          </p>
        </div>
        {!atLimit ? (
          <Link href="/app/cards/new">
            <Button size="md">
              <Plus size={16} />
              Nueva tarjeta
            </Button>
          </Link>
        ) : (
          <Link
            href="/app/settings/profile"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E9C38F]/50 bg-[#F4D9B2]/30 px-4 py-2 text-sm font-bold text-[#D08F27] transition-all hover:bg-[#F4D9B2]/50"
          >
            <Lock size={14} /> Upgradar para más
          </Link>
        )}
      </div>

      {/* Plan banner */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 rounded-[20px] border border-[#F3D7B0] bg-[#FCF6ED] p-6 shadow-sm sm:flex-row sm:items-center dark:border-[#524021] dark:bg-[#2C210C]">
        <div className="flex items-start gap-4">
          <Lock size={28} className="text-[#D08F27] shrink-0 mt-0.5" />
          <div>
            <p className="mb-1 text-[15px] font-bold text-[#E59D27]">
              Plan Free: 1 tarjeta
            </p>
            <p className="max-w-2xl text-[14px] font-medium leading-relaxed text-muted">
              Upgrada a Basic para crear hasta 5 tarjetas distintas para diferentes programas o negocios.
            </p>
          </div>
        </div>
        <Link
          href="/app/settings/profile"
          className="shrink-0 rounded-[12px] bg-[#F4A836] px-5 py-2.5 text-[14px] font-bold text-[#4B2F04] transition-all hover:bg-[#E59D27] hover:shadow-md"
        >
          Ver Basic →
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
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <CardListItem
              key={card.id}
              card={card}
              orgName={org.name}
              memberCount={statsMap[card.id]?.memberCount}
              totalPoints={statsMap[card.id]?.totalPoints}
              totalScans={statsMap[card.id]?.totalScans}
            />
          ))}
        </div>
      )}

      {/* Impresión física section */}
      {cards.length > 0 && (
        <div className="mt-10 rounded-[24px] border border-border/60 bg-[#EAE7DF]/40 p-8 shadow-sm dark:bg-surface-2">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h3 className="mb-2 flex items-center gap-2 font-display text-2xl font-black text-fg">
                <Printer size={22} /> Impresión física
              </h3>
              <p className="text-[15px] font-medium leading-relaxed text-muted">
                Descarga tu tarjeta en formato estándar ISO (85×54mm) para imprimir en casa o imprenta. Gratis en todos los planes.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 md:w-auto md:flex-row">
              <button className="flex items-center gap-2 rounded-xl border border-border/40 bg-[#E1DED5]/40 px-5 py-3 text-[14px] font-bold text-fg transition-colors hover:bg-[#E1DED5]/80 dark:bg-surface">
                <Download size={15} /> PDF anverso
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-border/40 bg-[#E1DED5]/40 px-5 py-3 text-[14px] font-bold text-fg transition-colors hover:bg-[#E1DED5]/80 dark:bg-surface">
                <Download size={15} /> PDF doble cara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
