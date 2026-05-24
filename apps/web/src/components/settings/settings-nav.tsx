'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { User, Lock, Shield, CreditCard, Trash2, Users } from 'lucide-react';
import { cn } from '@sellio/ui';

export function SettingsNav() {
  const pathname = usePathname();
  const t = useTranslations('settings.nav');

  const NAV_ITEMS = [
    { label: t('general'),  href: '/app/settings/profile', icon: User      },
    { label: t('password'), href: '/app/settings/security', icon: Lock     },
    { label: t('privacy'),  href: '/app/settings/privacy',  icon: Shield   },
    { label: t('billing'),  href: '/app/settings/billing',  icon: CreditCard },
    { label: t('team'),     href: '/app/settings/team',     icon: Users    },
  ];

  return (
    <nav className="flex flex-col rounded-2xl bg-surface shadow-sm border border-border/10 overflow-hidden">
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
          className="flex w-full items-center gap-4 px-6 py-4 text-[15px] font-medium text-[#E8341A] hover:bg-coral/10 transition-colors text-left"
        >
          <Trash2 size={18} className="text-[#E8341A]" />
          {t('deleteAccount')}
        </button>
      </div>
    </nav>
  );
}
