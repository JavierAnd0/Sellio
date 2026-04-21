'use client';

import { CreditCard, LayoutDashboard, Settings, X } from 'lucide-react';

import { Logo, cn } from '@sellio/ui';

import { useUiStore } from '@/lib/stores/ui.store';
import { NavItem } from './nav-item';

interface SidebarProps {
  orgName?: string;
}

export function Sidebar({ orgName }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useUiStore();

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
          'fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col border-r border-border/20 bg-surface transition-transform duration-200',
          'md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/20 p-4">
          <Logo />
          <button
            type="button"
            className="text-muted hover:text-fg transition-colors md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          <NavItem href="/app/dashboard" icon={LayoutDashboard}>
            Overview
          </NavItem>
          <NavItem href="/app/cards" icon={CreditCard}>
            Tarjetas
          </NavItem>
        </nav>

        {/* Footer nav */}
        <div className="space-y-1 border-t border-border/20 p-3">
          {orgName && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
              {orgName}
            </p>
          )}
          <NavItem href="/app/settings/profile" icon={Settings}>
            Configuración
          </NavItem>
        </div>
      </aside>
    </>
  );
}
