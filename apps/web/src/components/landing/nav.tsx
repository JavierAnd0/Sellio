'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300 px-8 lg:px-[60px] ${
        scrolled ? 'py-[14px]' : 'py-[24px]'
      }`}
      style={
        scrolled
          ? {
              background: 'rgb(var(--bg) / 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgb(var(--border) / 0.06)',
            }
          : { background: 'transparent' }
      }
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center font-display font-black text-sm text-white"
          style={{ width: 32, height: 32, borderRadius: 8, background: '#E8341A' }}
        >
          S
        </div>
        <span
          className="font-display font-black text-fg"
          style={{ fontSize: 18, letterSpacing: '-0.02em' }}
        >
          Sellio<span className="text-coral">.</span>
        </span>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-9">
        {[
          { label: 'Producto', href: '#funcionalidades' },
          { label: 'Precios', href: '#precios' },
          { label: 'Empresas', href: '#' },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-[13px] font-medium text-fg/60 hover:text-fg transition-colors duration-150"
          >
            {item.label}
          </Link>
        ))}

        {/* CTA */}
        <div className="flex items-center gap-5 border-l border-border/10 pl-5">
          <Link
            href="/login"
            className="text-[13px] font-medium text-fg/80 hover:text-fg transition-colors duration-150"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="font-display font-bold text-[13px] text-white bg-coral hover:opacity-85 transition-opacity duration-150"
            style={{ padding: '9px 20px', borderRadius: 8, letterSpacing: '0.01em' }}
          >
            Registrarse
          </Link>
        </div>
      </div>

      {/* Mobile — solo CTA */}
      <div className="md:hidden flex items-center gap-3">
        <Link
          href="/login"
          className="text-[13px] font-medium text-fg/80"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="font-display font-bold text-[13px] text-white bg-coral px-4 py-2 rounded-lg"
        >
          Registro
        </Link>
      </div>
    </nav>
  );
}
