'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo, cn } from '@sellio/ui';
import { useUiStore } from '@/lib/stores/ui.store';

import type { OrgPlan } from '@sellio/db';

const PLAN_CONFIG: Record<OrgPlan, { label: string; maxCards: number | null; maxCustomers: number | null }> = {
  free:  { label: 'Plan Free',  maxCards: 1,    maxCustomers: 50   },
  basic: { label: 'Plan Basic', maxCards: 5,    maxCustomers: 500  },
  elite: { label: 'Plan Elite', maxCards: null, maxCustomers: null },
};

interface SidebarProps {
  orgName?: string;
  plan?: OrgPlan;
  totalCards?: number;
  totalCustomers?: number;
  firstCardId?: string;
}

// Custom icons based on the screenshots
const HexIcon = ({ active }: { active?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);

const DiamondIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 12l10 10 10-10Z" />
  </svg>
);

const DotCircleIcon = ({ active }: { active?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    {active && <circle cx="12" cy="12" r="4" fill="currentColor" />}
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.6L12 17.6l-6.3 4 2.3-7.6-6-4.6h7.6Z" />
  </svg>
);


function SidebarItem({ href, icon: Icon, children, badge, activeIcon: ActiveIcon }: any) {
  const pathname = usePathname();
  // match exact or subpaths
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  const RenderIcon = isActive && ActiveIcon ? ActiveIcon : Icon;

  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center justify-between rounded-xl px-4 py-3 text-[15px] transition-all',
        isActive
          ? 'bg-[#E8341A]/10 text-[#E8341A] font-bold shadow-sm'
          : 'text-muted hover:bg-surface-2 hover:text-fg font-medium'
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex items-center justify-center transition-transform group-hover:scale-110",
          isActive ? "text-[#E8341A]" : "text-muted/70 group-hover:text-fg"
        )}>
          <RenderIcon active={isActive} filled={isActive} />
        </div>
        <span>{children}</span>
      </div>
      {badge && (
        <span className="rounded-full bg-border/40 px-2 py-0.5 text-[9px] font-black tracking-wider text-muted/80">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({ orgName, plan = 'free', totalCards = 0, totalCustomers = 0, firstCardId }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const config = PLAN_CONFIG[plan];
  const isElite = plan === 'elite';

  // Use customers as the main progress metric (more meaningful for the user)
  // For elite, progress is always 0 (unlimited)
  const progressPercent = isElite || !config.maxCustomers
    ? 0
    : Math.min(100, Math.max(0, (totalCustomers / config.maxCustomers) * 100));

  const clientesHref = firstCardId ? `/app/cards/${firstCardId}/customers` : '/app/cards';

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] flex-col border-r border-border/20 bg-[#F9F7F4] dark:bg-surface transition-transform duration-300',
          'md:sticky md:top-0 md:inset-auto md:z-auto md:shrink-0 md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <Logo />
          <button
            type="button"
            className="text-muted hover:text-fg transition-colors md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          <div>
            <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted/60">
              Menú
            </p>
            <nav className="flex flex-col gap-1">
              <SidebarItem href="/app/dashboard" icon={HexIcon}>
                Dashboard
              </SidebarItem>
              <SidebarItem href="/app/cards" icon={DiamondIcon} activeIcon={DiamondIcon}>
                Tarjetas
              </SidebarItem>
              <SidebarItem href={clientesHref} icon={DotCircleIcon} activeIcon={DotCircleIcon}>
                Clientes
              </SidebarItem>
              
              <div className="mt-2 pointer-events-none opacity-50 grayscale">
                <SidebarItem href="/app/analytics" icon={StarIcon} badge="PRO">
                  Analytics
                </SidebarItem>
              </div>
              <SidebarItem href="/app/settings" icon={DiamondIcon}>
                Configuración
              </SidebarItem>
            </nav>
          </div>
        </div>

        {/* Footer Widget */}
        <div className="p-4">
          <div className="rounded-[20px] bg-[#E8341A]/5 border border-[#E8341A]/10 p-5 shadow-sm">
            <div className="mb-2">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#E8341A] mb-1">
                {config.label}
              </p>
              <p className="text-xs font-semibold text-muted">
                {isElite ? (
                  <>
                    {totalCards} tarjeta{totalCards !== 1 ? 's' : ''} · {totalCustomers} clientes
                  </>
                ) : (
                  <>
                    {totalCards}/{config.maxCards} tarjeta{config.maxCards !== 1 ? 's' : ''}
                    {' · '}
                    {totalCustomers}/{config.maxCustomers} clientes
                  </>
                )}
              </p>
            </div>

            {!isElite && (
              <>
                <div className="h-1.5 w-full bg-border/30 rounded-full mb-3 overflow-hidden relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#E8341A] rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#E8341A]"
                    style={{ left: `calc(${progressPercent}% - 4px)` }}
                  />
                </div>

                <Link
                  href="/app/settings/billing"
                  className="inline-flex items-center text-[13px] font-bold text-[#E8341A] hover:text-[#D02B13] transition-colors"
                >
                  Upgradar <span className="ml-1">→</span>
                </Link>
              </>
            )}

            {isElite && (
              <p className="text-[11px] font-semibold text-[#E8341A]/70">
                ✦ Sin límites activos
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
