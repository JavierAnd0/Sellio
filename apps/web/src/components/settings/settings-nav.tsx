'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Lock, Shield, CreditCard, Trash2 } from 'lucide-react';
import { cn } from '@sellio/ui';

const NAV_ITEMS = [
  { label: 'General', href: '/app/settings/profile', icon: User },
  { label: 'Contraseña', href: '/app/settings/security', icon: Lock },
  { label: 'Privacidad', href: '/app/settings/privacy', icon: Shield },
  { label: 'Facturación', href: '/app/settings/billing', icon: CreditCard },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col rounded-2xl bg-white shadow-sm border border-border/10 overflow-hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <div key={item.href} className={cn(
            "border-b border-border/10 last:border-0",
            isActive && "bg-[#E8341A]/10"
          )}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-6 py-4 text-[15px] font-medium transition-colors',
                isActive
                  ? 'text-[#E8341A] font-bold'
                  : 'text-fg hover:bg-surface-2'
              )}
            >
              <Icon 
                size={18} 
                className={cn(isActive ? "text-[#E8341A]" : "text-muted")} 
              />
              {item.label}
            </Link>
          </div>
        );
      })}
      
      <div className="border-t border-border/10">
        <button
          type="button"
          className="flex w-full items-center gap-4 px-6 py-4 text-[15px] font-medium text-[#E8341A] hover:bg-red-50 transition-colors text-left"
        >
          <Trash2 size={18} className="text-[#E8341A]" />
          Eliminar cuenta
        </button>
      </div>
    </nav>
  );
}
