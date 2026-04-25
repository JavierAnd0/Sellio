'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, LayoutDashboard, Settings } from 'lucide-react';

interface BuilderNavProps {
  orgName: string;
}

export function BuilderNav({ orgName }: BuilderNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-y-0 left-0 z-[110] pointer-events-none">
      {/* Hover trigger strip — always on screen */}
      <div
        className="absolute inset-y-0 left-0 w-5 pointer-events-auto"
        onMouseEnter={() => setOpen(true)}
      />

      {/* Sliding panel */}
      <div
        className="absolute inset-y-0 left-0 w-60 flex flex-col pointer-events-auto"
        style={{
          background: '#111009',
          borderRight: '1px solid rgba(245,240,235,0.08)',
          boxShadow: '8px 0 40px rgba(0,0,0,0.6)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1)',
        }}
        onMouseLeave={() => setOpen(false)}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 16px',
            borderBottom: '1px solid rgba(245,240,235,0.08)',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: '#E8341A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 13,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            S
          </div>
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 15,
              color: '#F5F0EB',
            }}
          >
            Sellio<span style={{ color: '#E8341A' }}>.</span>
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavLink href="/app/dashboard" icon={LayoutDashboard} label="Overview" />
          <NavLink href="/app/cards" icon={CreditCard} label="Tarjetas" />
        </nav>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid rgba(245,240,235,0.08)',
            padding: '10px 10px',
          }}
        >
          {orgName && (
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#3A3530',
                padding: '0 10px',
                marginBottom: 6,
              }}
            >
              {orgName}
            </p>
          )}
          <NavLink href="/app/settings/profile" icon={Settings} label="Configuración" />
        </div>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 8,
        fontSize: 13,
        color: '#6B6560',
        textDecoration: 'none',
        transition: 'background 0.15s, color 0.15s',
        fontFamily: 'Space Grotesk, sans-serif',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(245,240,235,0.05)';
        (e.currentTarget as HTMLAnchorElement).style.color = '#F5F0EB';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
        (e.currentTarget as HTMLAnchorElement).style.color = '#6B6560';
      }}
    >
      <Icon size={15} strokeWidth={1.8} />
      {label}
    </Link>
  );
}
