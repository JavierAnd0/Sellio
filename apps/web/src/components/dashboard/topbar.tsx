'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, User } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@sellio/ui';

import { signoutAction } from '@/actions/auth/signout.action';
import { useUiStore } from '@/lib/stores/ui.store';

const ROUTE_TITLES: Record<string, string> = {
  '/app/dashboard': 'Overview',
  '/app/settings/profile': 'Perfil',
  '/app/settings': 'Configuración',
  '/app': 'Dashboard',
};

function getPageTitle(pathname: string): string {
  for (const [route, title] of Object.entries(ROUTE_TITLES)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) return title;
  }
  return 'Sellio';
}

interface TopbarProps {
  userEmail?: string;
  userFullName?: string | null;
}

export function Topbar({ userEmail, userFullName }: TopbarProps) {
  const { setSidebarOpen } = useUiStore();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = userFullName
    ? userFullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : userEmail?.[0]?.toUpperCase() ?? 'U';

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border/20 bg-surface px-4">
      <button
        type="button"
        className="text-muted hover:text-fg transition-colors md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      <h1 className="flex-1 font-display text-base font-bold text-fg">
        {getPageTitle(pathname)}
      </h1>

      {/* User menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-coral font-display text-sm font-bold text-white hover:bg-coral-dim transition-colors"
          aria-label="Menú de usuario"
          aria-expanded={menuOpen}
        >
          {initials}
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-10 z-20 min-w-[200px] overflow-hidden rounded-xl border border-border/20 bg-surface shadow-xl">
              <div className="px-4 py-3">
                {userFullName && (
                  <p className="text-sm font-medium text-fg">{userFullName}</p>
                )}
                {userEmail && (
                  <p className={cn('text-xs text-muted', !userFullName && 'text-sm')}>{userEmail}</p>
                )}
              </div>
              <div className="border-t border-border/20">
                <Link
                  href="/app/settings/profile"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-fg transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={14} />
                  Ver perfil
                </Link>
                <form action={signoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-fg transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Cerrar sesión
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
