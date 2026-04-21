'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@sellio/ui';

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function NavItem({ href, icon: Icon, children }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-surface-2 font-medium text-fg'
          : 'text-muted hover:bg-surface-2 hover:text-fg',
      )}
    >
      <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
      {children}
    </Link>
  );
}
