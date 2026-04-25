import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Check } from 'lucide-react';

import { createClient } from '@sellio/db/server';
import {
  SupabaseCardRepository,
  SupabaseCustomerRepository,
  SupabaseOrganizationRepository,
} from '@sellio/db/repositories';
import { Button } from '@sellio/ui';

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
      <div>
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-muted mb-1.5">Bienvenido a Selio</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-fg flex items-center gap-2">
          Hola, <span className="text-[#E8341A]">{org.name}</span> <span className="inline-block origin-bottom-right hover:animate-floatB cursor-default transition-transform transform hover:scale-110">👋</span>
        </h1>
      </div>

      {/* Banner */}
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-[#FEF5F4] to-[#FDF0EE] dark:from-coral/10 dark:to-coral/5 border border-coral/10 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="relative z-10 max-w-xl">
          <h2 className="font-display text-2xl sm:text-[32px] leading-tight font-extrabold tracking-tight text-fg mb-4">
            ¡Tu tarjeta de lealtad está lista! <span className="inline-block animate-floatA origin-bottom">🎉</span>
          </h2>
          <p className="text-muted text-sm sm:text-base mb-8 max-w-md leading-relaxed">
            Comparte tu QR con tus primeros clientes y empieza a fidelizarlos hoy.
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {hasCards ? (
              <Link href={`/app/cards/${activeCard?.id}`}>
                <Button size="lg" className="bg-[#E8341A] hover:bg-[#D02B13] text-white rounded-xl shadow-lg shadow-coral/20 font-bold px-6 sm:px-8 border-0">
                  Ver mi tarjeta <span className="ml-2 font-black">→</span>
                </Button>
              </Link>
            ) : (
              <Link href="/app/cards/new">
                <Button size="lg" className="bg-[#E8341A] hover:bg-[#D02B13] text-white rounded-xl shadow-lg shadow-coral/20 font-bold px-6 sm:px-8 border-0">
                  Crear tarjeta <span className="ml-2 font-black">→</span>
                </Button>
              </Link>
            )}
            <Button size="lg" variant="secondary" className="bg-surface hover:bg-surface-2 rounded-xl border border-border shadow-sm font-bold px-6 sm:px-8 text-fg">
              Descargar QR
            </Button>
          </div>
        </div>
        
        {/* Card Preview Graphic */}
        <div className="relative z-10 hidden lg:block shrink-0 drop-shadow-2xl translate-x-4 hover:-translate-y-2 transition-transform duration-500 ease-out">
          <div className="w-[360px] h-[220px] rounded-[24px] bg-gradient-to-br from-[#1A0806] via-[#3A1006] to-[#E8341A] p-7 text-white overflow-hidden relative shadow-[0_40px_80px_rgba(232,52,26,0.3)] border border-white/10 flex flex-col justify-between">
            {/* Subtle decorative circles */}
            <div className="absolute right-[-60px] top-[-60px] w-[220px] h-[220px] rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute right-[-100px] top-[-100px] w-[320px] h-[320px] rounded-full border border-white/5 pointer-events-none" />
            
            <div className="flex justify-between items-start relative">
              <div>
                <div className="font-display font-black text-base tracking-wide mb-1 text-[#FFB347] drop-shadow-sm">{org.name}</div>
                <div className="text-[9px] text-white/50 tracking-[0.25em] uppercase font-bold">Member Card</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#E8341A] flex items-center justify-center font-bold text-sm shadow-inner shadow-white/20 border border-white/10">S</div>
            </div>
            
            <div className="relative mt-2">
              <div className="font-display font-extrabold text-[52px] leading-[0.9] mb-1 drop-shadow-md">847</div>
              <div className="text-[9px] text-white/50 tracking-[0.2em] uppercase font-bold">Puntos acumulados</div>
            </div>
            
            <div className="flex justify-between items-end relative">
              <div>
                <div className="text-[8px] text-white/40 tracking-[0.15em] uppercase mb-1.5 font-bold">Miembro</div>
                <div className="text-[13px] font-semibold tracking-wide">Ana García</div>
              </div>
              <div className="opacity-80 flex gap-1">
                 <div className="w-10 h-10 rounded-lg border-2 border-white/20 flex flex-col items-center justify-center gap-1 p-1.5 bg-white/5 backdrop-blur-sm">
                   <div className="flex gap-1">
                     <div className="w-[7px] h-[7px] bg-white/80 rounded-[2px]"></div>
                     <div className="w-[7px] h-[7px] bg-white/80 rounded-[2px]"></div>
                   </div>
                   <div className="flex gap-1">
                     <div className="w-[7px] h-[7px] bg-white/80 rounded-[2px]"></div>
                     <div className="w-[7px] h-[7px] bg-white/40 rounded-[2px]"></div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
         {/* Stat 1 */}
         <div className="rounded-[20px] border border-border/60 bg-surface p-7 sm:p-8 relative hover:border-border transition-colors group">
           <div className="absolute top-7 right-7 w-3.5 h-3.5 rounded-full border-[2.5px] border-border/50 group-hover:border-coral/50 transition-colors"></div>
           <p className="text-[13px] font-bold text-muted mb-3 tracking-wide">Clientes activos</p>
           <p className="font-display text-[44px] sm:text-5xl font-extrabold tracking-tighter text-fg mb-1 leading-none">{totalCustomers}</p>
           <p className="text-[13px] text-muted font-medium">de 50 disponibles</p>
         </div>
         {/* Stat 2 */}
         <div className="rounded-[20px] border border-border/60 bg-surface p-7 sm:p-8 relative hover:border-border transition-colors group">
           <div className="absolute top-7 right-7 text-border/60 text-lg group-hover:text-coral/50 transition-colors rotate-45">✦</div>
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
        <div className="rounded-[24px] border border-border/60 bg-surface p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
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
        <div className="rounded-[24px] border border-border/60 bg-surface p-8 sm:p-10 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-display text-2xl sm:text-[28px] font-extrabold tracking-tight text-fg mb-10 leading-none">Actividad reciente</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-2">
            <div className="text-[56px] mb-6 drop-shadow-xl animate-floatB">📬</div>
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
