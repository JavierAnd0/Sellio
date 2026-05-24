import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Check, Hand, CreditCard, Sparkle, MailOpen } from 'lucide-react';

import { createClient } from '@sellio/db/server';
import {
  SupabaseCardRepository,
  SupabaseCustomerRepository,
  SupabaseOrganizationRepository,
} from '@sellio/db/repositories';
import { Button } from '@sellio/ui';

import { CardFromDesign } from '@/components/cards/card-renderer';
import { HelpTourButton } from '@/components/dashboard/help-tour-button';

export const metadata: Metadata = { title: 'Dashboard' };

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

  // Total points issued across all cards
  let pointsRaw: { points: number }[] = [];
  if (cards.length > 0) {
    const { data } = await db
      .from('memberships')
      .select('points')
      .in('card_id', cards.map((c) => c.id));
    if (data) pointsRaw = data;
  }

  const totalPoints = pointsRaw.reduce((sum, r) => sum + r.points, 0);
  const activeCard = cards[0];
  const hasCards = cards.length > 0;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12 w-full max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-muted mb-1.5">Bienvenido a Sellio</p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-fg flex items-center gap-2">
            Hola, <span className="text-[#E8341A]">{org.name}</span> <Hand size={30} className="inline-block origin-bottom-right hover:animate-floatB cursor-default transition-transform transform hover:scale-110" />
          </h1>
        </div>
        <HelpTourButton />
      </div>

      {/* Banner */}
      <div id="tour-card-banner" className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-[#FEF5F4] to-[#FDF0EE] dark:from-coral/10 dark:to-coral/5 border border-coral/10 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="relative z-10 max-w-xl">
          {hasCards ? (
            <>
              <h2 className="font-display text-2xl sm:text-[32px] leading-tight font-extrabold tracking-tight text-fg mb-4">
                {cards.length === 1
                  ? <>¡Tu tarjeta de lealtad está lista!</>
                  : <>{cards.length} tarjetas activas</>
                }
              </h2>
              <p className="text-muted text-sm sm:text-base mb-8 max-w-md leading-relaxed">
                {cards.length === 1
                  ? 'Comparte tu QR con tus clientes y empieza a fidelizarlos hoy.'
                  : 'Gestiona todas tus tarjetas de lealtad desde un solo lugar.'
                }
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl sm:text-[32px] leading-tight font-extrabold tracking-tight text-fg mb-4">
                Crea tu primera tarjeta de lealtad
              </h2>
              <p className="text-muted text-sm sm:text-base mb-8 max-w-md leading-relaxed">
                Diseña una tarjeta personalizada y empieza a fidelizar a tus clientes hoy mismo.
              </p>
            </>
          )}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {hasCards ? (
              <Link href={cards.length === 1 ? `/app/cards/${activeCard?.id}` : '/app/cards'}>
                <Button size="lg" className="bg-[#E8341A] hover:bg-[#D02B13] text-white rounded-xl shadow-lg shadow-coral/20 font-bold px-6 sm:px-8 border-0">
                  {cards.length === 1 ? 'Ver tarjeta' : 'Ver tarjetas'} <span className="ml-2 font-black">→</span>
                </Button>
              </Link>
            ) : (
              <Link href="/app/cards/new">
                <Button size="lg" className="bg-[#E8341A] hover:bg-[#D02B13] text-white rounded-xl shadow-lg shadow-coral/20 font-bold px-6 sm:px-8 border-0">
                  Crear tarjeta <span className="ml-2 font-black">→</span>
                </Button>
              </Link>
            )}
            {hasCards && (
              <Button size="lg" variant="secondary" className="bg-surface hover:bg-surface-2 rounded-xl border border-border shadow-sm font-bold px-6 sm:px-8 text-fg">
                Descargar QR
              </Button>
            )}
          </div>
        </div>

        {/* Card Preview */}
        <div className="relative z-10 hidden lg:block shrink-0 translate-x-4 hover:-translate-y-2 transition-transform duration-500 ease-out">
          {hasCards ? (
            <div
              style={{ filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.18))' }}
            >
              {cards.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    background: '#E8341A',
                    color: 'white',
                    borderRadius: 20,
                    padding: '2px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {cards.length} tarjetas
                </div>
              )}
              <CardFromDesign
                design={(activeCard?.design ?? {}) as Record<string, unknown>}
                primaryColor={
                  typeof activeCard?.design === 'object' &&
                  activeCard.design !== null &&
                  'primaryColor' in activeCard.design &&
                  typeof (activeCard.design as Record<string, unknown>).primaryColor === 'string'
                    ? (activeCard.design as Record<string, unknown>).primaryColor as string
                    : org.primaryColor
                }
                W={360}
                H={218}
              />
            </div>
          ) : (
            <div className="w-[360px] h-[218px] rounded-[20px] border-2 border-dashed border-[#E8341A]/30 bg-[#FEF5F4] flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E8341A]/10 flex items-center justify-center">
                <CreditCard size={24} className="text-[#E8341A]/70" />
              </div>
              <p className="text-[13px] font-bold text-[#E8341A]/70">Tu tarjeta aparecerá aquí</p>
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div id="tour-stats" className="grid gap-4 sm:grid-cols-3">
         {/* Stat 1 */}
         <div className="rounded-[20px] border border-border/60 bg-surface p-7 sm:p-8 relative hover:border-border transition-colors group">
           <div className="absolute top-7 right-7 w-3.5 h-3.5 rounded-full border-[2.5px] border-border/50 group-hover:border-coral/50 transition-colors"></div>
           <p className="text-[13px] font-bold text-muted mb-3 tracking-wide">Clientes activos</p>
           <p className="font-display text-[44px] sm:text-5xl font-extrabold tracking-tighter text-fg mb-1 leading-none">{totalCustomers}</p>
           <p className="text-[13px] text-muted font-medium">de 50 disponibles</p>
         </div>
         {/* Stat 2 */}
         <div className="rounded-[20px] border border-border/60 bg-surface p-7 sm:p-8 relative hover:border-border transition-colors group">
           <Sparkle size={14} className="absolute top-7 right-7 text-border/60 group-hover:text-coral/50 transition-colors" />
           <p className="text-[13px] font-bold text-muted mb-3 tracking-wide">Puntos otorgados</p>
           <p className="font-display text-[44px] sm:text-5xl font-extrabold tracking-tighter text-fg mb-1 leading-none">{totalPoints.toLocaleString('es-CO')}</p>
           <p className="text-[13px] text-muted font-medium">esta semana</p>
         </div>
         {/* Stat 3 */}
         <div className="rounded-[20px] border border-border/60 bg-surface p-7 sm:p-8 relative hover:border-border transition-colors group">
           <div className="absolute top-7 right-7 w-3.5 h-3.5 rounded-full border-[2.5px] border-border/50 group-hover:border-coral/50 transition-colors"></div>
           <p className="text-[13px] font-bold text-muted mb-3 tracking-wide">Visitas hoy</p>
           <p className="font-display text-[44px] sm:text-5xl font-extrabold tracking-tighter text-fg mb-1 leading-none">0</p>
           <p className="text-[13px] text-muted font-medium">sin actividad aún</p>
         </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Primeros pasos */}
        <div id="tour-checklist" className="rounded-[24px] border border-border/60 bg-surface p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-display text-2xl sm:text-[28px] font-extrabold tracking-tight text-fg leading-none">Primeros pasos</h3>
            <span className="text-sm font-black text-[#E8341A] tracking-widest">{hasCards ? '1/4' : '0/4'}</span>
          </div>
          <div className="h-1.5 w-full bg-border/40 rounded-full mb-10 overflow-hidden shadow-inner">
            <div className={`h-full bg-[#E8341A] rounded-full transition-all duration-1000 ease-out ${hasCards ? 'w-1/4' : 'w-0'}`}></div>
          </div>
          <div className="flex flex-col gap-5">
            {/* Item 1 */}
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className={`w-[26px] h-[26px] rounded-[8px] flex items-center justify-center shrink-0 transition-colors ${hasCards ? 'bg-[#E8341A] text-white border-0' : 'border-2 border-border/60 bg-surface-2 group-hover:border-border'}`}>
                {hasCards && <Check size={16} strokeWidth={4} className="animate-fadeUp" />}
              </div>
              <span className={`text-[15px] font-semibold transition-colors ${hasCards ? 'text-muted/60 line-through' : 'text-fg'}`}>
                Crear tu primera tarjeta de lealtad
              </span>
            </div>
            {/* Item 2 */}
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-[26px] h-[26px] rounded-[8px] border-2 border-border/60 bg-surface-2 shrink-0 group-hover:border-border transition-colors"></div>
              <span className="text-[15px] font-semibold text-fg">Compartir el QR con tus clientes</span>
            </div>
            {/* Item 3 */}
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-[26px] h-[26px] rounded-[8px] border-2 border-border/60 bg-surface-2 shrink-0 group-hover:border-border transition-colors"></div>
              <span className="text-[15px] font-semibold text-fg">Hacer tu primer scan de validación</span>
            </div>
            {/* Item 4 */}
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-[26px] h-[26px] rounded-[8px] border-2 border-border/60 bg-surface-2 shrink-0 group-hover:border-border transition-colors"></div>
              <span className="text-[15px] font-semibold text-fg">Agregar un cliente manualmente</span>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div id="tour-activity" className="rounded-[24px] border border-border/60 bg-surface p-8 sm:p-10 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-display text-2xl sm:text-[28px] font-extrabold tracking-tight text-fg mb-10 leading-none">Actividad reciente</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-2">
            <div className="mb-6 drop-shadow-xl animate-floatB flex items-center justify-center">
              <MailOpen size={56} className="text-muted/40" />
            </div>
            <h4 className="font-display text-xl font-bold text-fg mb-3">Sin actividad aún</h4>
            <p className="text-[15px] text-muted max-w-[280px] mb-10 leading-relaxed font-medium">
              Cuando tus clientes empiecen a escanear, verás su actividad aquí.
            </p>
            <Button size="lg" className="bg-[#E8341A] hover:bg-[#D02B13] text-white rounded-xl shadow-lg shadow-coral/20 font-bold px-8 sm:px-10 border-0 transition-transform active:scale-95">
              Compartir QR <span className="ml-2 font-black">→</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
