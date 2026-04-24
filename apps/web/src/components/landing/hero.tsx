'use client';

import Link from 'next/link';
import MiniCard from './mini-card';

export default function LandingHero() {
  return (
    <section className="relative min-h-screen flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 px-4 sm:px-8 lg:px-[60px] pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-bg">
      {/* Background radial gradient */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(232,52,26,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Left — copy */}
      <div className="flex-1 max-w-xl relative z-10 w-full">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full border animate-fadeUp"
          style={{
            background: 'rgba(232,52,26,0.12)',
            borderColor: 'rgba(232,52,26,0.25)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
          <span className="text-[11px] font-semibold text-coral tracking-[0.1em] uppercase">
            Beta abierta · Gratis para empezar
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-display font-black text-fg leading-none tracking-tighter mb-6 animate-fadeUp animation-delay-100"
          style={{ fontSize: 'clamp(48px, 6vw, 76px)' }}
        >
          Fideliza a tus<br />clientes.
        </h1>

        {/* Subheadline */}
        <p className="text-base lg:text-[18px] leading-[1.7] text-muted max-w-[440px] mb-10 animate-fadeUp animation-delay-200">
          Crea tarjetas de lealtad digitales en minutos — sin código, sin
          complicaciones.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-12 animate-fadeUp animation-delay-300">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2.5 font-display font-black text-[15px] text-white bg-coral px-8 py-4 rounded-xl tracking-[0.01em] transition-all duration-200 hover:-translate-y-0.5"
            style={{ boxShadow: '0 8px 32px rgba(232,52,26,0.35)' }}
          >
            Crear mi tarjeta gratis <span className="text-lg">→</span>
          </Link>
          <a
            href="#como"
            className="inline-flex items-center justify-center font-display font-bold text-[15px] text-fg px-7 py-4 rounded-xl border border-border/20 hover:border-border/50 transition-colors duration-200"
          >
            Ver demo
          </a>
        </div>

        {/* Stats */}
        <div className="flex gap-8 animate-fadeUp animation-delay-500">
          {[
            ['500+', 'Negocios'],
            ['50k+', 'Clientes activos'],
            ['100%', 'Sin comisión'],
          ].map(([num, label]) => (
            <div key={label}>
              <div className="font-display font-black text-[20px] lg:text-[22px] text-fg">
                {num}
              </div>
              <div className="text-[11px] text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — floating cards (lg+) */}
      <div className="hidden lg:block flex-shrink-0 relative w-[460px] h-[460px] z-10">
        <div className="absolute top-14 left-20 animate-floatA">
          <MiniCard business="Café Central" name="Ana García" points={847} rotate={-4} />
        </div>
        <div className="absolute top-52 left-0 animate-floatB">
          <MiniCard business="Panadería Doña Rosa" name="Carlos López" points={1243} rotate={3} accent="#C17D3C" />
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden relative w-full flex justify-center pb-4 z-10">
        <div className="relative h-56 w-72">
          <div className="absolute top-0 left-4 animate-floatA scale-75 origin-top-left">
            <MiniCard business="Café Central" name="Ana García" points={847} rotate={-4} />
          </div>
          <div className="absolute top-16 left-20 animate-floatB scale-75 origin-top-left opacity-80">
            <MiniCard business="Panadería Doña Rosa" name="Carlos López" points={1243} rotate={3} accent="#C17D3C" />
          </div>
        </div>
      </div>
    </section>
  );
}
