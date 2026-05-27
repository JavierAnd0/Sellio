import type { ReactNode } from 'react';

import { Logo } from '@sellio/ui';

import { CardPreview } from '@/components/auth/card-preview';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Panel izquierdo — formulario */}
      <div className="flex w-full flex-col border-r border-border/20 px-14 py-10 md:w-[480px] md:shrink-0">
        <div className="mb-12">
          <Logo />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          {children}
        </div>

        <footer className="mt-10 text-center text-xs text-muted">
          © 2026 Sellio ·{' '}
          <a href="/terms" className="hover:text-fg transition-colors">
            Términos
          </a>{' '}
          ·{' '}
          <a href="/privacy" className="hover:text-fg transition-colors">
            Privacidad
          </a>
        </footer>
      </div>

      {/* Panel derecho — preview decorativo */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-surface md:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(232,52,26,0.06) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10">
          <CardPreview />
        </div>
      </div>
    </div>
  );
}
