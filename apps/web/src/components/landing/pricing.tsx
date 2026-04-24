'use client';

import { useState } from 'react';
import Link from 'next/link';

const TIERS = [
  {
    name: 'Free',
    price: 0,
    priceY: 0,
    label: 'Para empezar',
    features: [
      '1 tarjeta de lealtad',
      'Hasta 50 clientes',
      'QR simple',
      'Impresión física incluida',
      'Soporte por email',
    ],
    cta: 'Empezar gratis',
    href: '/register',
    badge: null,
  },
  {
    name: 'Basic',
    price: 9.99,
    priceY: 7.99,
    label: 'Para negocios pequeños',
    features: [
      'Hasta 5 tarjetas',
      'Hasta 500 clientes',
      'QR + código numérico',
      'Analytics básico',
      'Exportar CSV',
      'Personalización avanzada',
      'Soporte prioritario',
    ],
    cta: 'Empezar Basic',
    href: '/register',
    badge: null,
  },
  {
    name: 'Pro',
    price: 24.99,
    priceY: 19.99,
    label: 'El más popular',
    features: [
      'Tarjetas ilimitadas',
      'Hasta 5,000 clientes',
      'Analytics avanzado',
      'Marca blanca (sin logo Sellio)',
      'Webhooks + API',
      'Múltiples admins',
      'NFC (próximamente)',
      'Soporte chat 24/7',
    ],
    cta: 'Empezar Pro',
    href: '/register',
    badge: 'Popular',
  },
  {
    name: 'Enterprise',
    price: null,
    priceY: null,
    label: 'Para cadenas',
    features: [
      'Clientes ilimitados',
      'Multi-sucursal',
      'SSO + SAML',
      'SLA garantizado',
      'Onboarding dedicado',
      'API ilimitada',
      'Reportes custom',
    ],
    cta: 'Contactar ventas',
    href: 'mailto:hola@sellio.co',
    badge: null,
  },
];

const CARD_RADIUS = [
  'rounded-2xl lg:rounded-r-none lg:rounded-l-2xl',
  'rounded-2xl lg:rounded-none',
  'rounded-2xl lg:rounded-none',
  'rounded-2xl lg:rounded-l-none lg:rounded-r-2xl',
];

export default function LandingPricing() {
  const [annual, setAnnual] = useState(false);
  const [selected, setSelected] = useState(2); // Pro seleccionado por defecto

  return (
    <section
      id="precios"
      className="py-24 lg:py-[120px] px-4 sm:px-8 lg:px-[60px] bg-surface border-t border-border/8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="text-[10px] tracking-[0.2em] text-coral uppercase font-semibold mb-3">
            Precios
          </div>
          <h2
            className="font-display font-black text-fg tracking-tighter mb-8"
            style={{ fontSize: 'clamp(36px, 4.5vw, 52px)' }}
          >
            Sin sorpresas.
          </h2>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center gap-1 bg-surface-2 rounded-full p-1.5">
            {(['Mensual', 'Anual'] as const).map((label, i) => (
              <button
                key={label}
                onClick={() => setAnnual(i === 1)}
                className={`px-5 py-2 rounded-full font-display font-bold text-[12px] tracking-[0.02em] transition-all duration-200 cursor-pointer ${
                  annual === (i === 1)
                    ? 'bg-coral text-white'
                    : 'bg-transparent text-muted'
                }`}
              >
                {label}
              </button>
            ))}
            {annual && (
              <span className="text-[11px] text-coral font-semibold pr-2">−20%</span>
            )}
          </div>
        </div>

        {/* Tiers grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-0.5 items-stretch">
          {TIERS.map((tier, i) => {
            const isSelected = selected === i;

            return (
              <div
                key={tier.name}
                onClick={() => setSelected(i)}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onKeyDown={(e) => e.key === 'Enter' && setSelected(i)}
                className={`
                  relative overflow-hidden flex flex-col p-6 sm:p-7 cursor-pointer
                  ${CARD_RADIUS[i]}
                  outline-none
                `}
                style={{
                  background: isSelected ? '#E8341A' : 'rgb(var(--bg))',
                  boxShadow: isSelected
                    ? '0 20px 60px rgba(232,52,26,0.35), 0 0 0 0px rgba(232,52,26,0)'
                    : 'none',
                  transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
                  transition:
                    'background 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                  // Ring on hover for non-selected
                  outline: !isSelected ? undefined : undefined,
                  borderWidth: !isSelected ? 1 : 0,
                  borderStyle: 'solid',
                  borderColor: !isSelected
                    ? 'rgb(var(--border) / 0.0)'
                    : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      'rgba(232,52,26,0.3)';
                    (e.currentTarget as HTMLDivElement).style.transform =
                      'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      'rgb(var(--border) / 0.0)';
                    (e.currentTarget as HTMLDivElement).style.transform =
                      'translateY(0)';
                  }
                }}
              >
                {/* Selected indicator + badge */}
                <div className="flex items-center justify-between mb-1 h-6">
                  {/* Animated check when selected */}
                  <div
                    className="flex items-center gap-1.5 transition-all duration-300"
                    style={{
                      opacity: isSelected ? 1 : 0,
                      transform: isSelected ? 'translateX(0)' : 'translateX(-8px)',
                    }}
                  >
                    <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center">
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path
                          d="M1 3L3 5L7 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-[9px] font-bold text-white/70 tracking-[0.1em] uppercase">
                      Seleccionado
                    </span>
                  </div>

                  {/* Badge (Popular, etc.) */}
                  {tier.badge && (
                    <div
                      className="text-[9px] font-bold tracking-[0.1em] uppercase rounded-full px-2.5 py-1 transition-all duration-300"
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(232,52,26,0.15)',
                        color: isSelected ? '#fff' : '#E8341A',
                      }}
                    >
                      {tier.badge}
                    </div>
                  )}
                </div>

                {/* Label + name */}
                <div className="mb-5 mt-3">
                  <div
                    className="font-display font-black text-[11px] tracking-[0.15em] uppercase mb-2 transition-colors duration-300"
                    style={{ color: isSelected ? 'rgba(255,255,255,0.6)' : 'rgb(var(--muted))' }}
                  >
                    {tier.label}
                  </div>
                  <div
                    className="font-display font-black text-[22px] mb-4 transition-colors duration-300"
                    style={{ color: isSelected ? '#fff' : 'rgb(var(--fg))' }}
                  >
                    {tier.name}
                  </div>

                  {/* Price */}
                  {tier.price === null ? (
                    <div
                      className="font-display font-black text-[36px] transition-colors duration-300"
                      style={{ color: isSelected ? '#fff' : 'rgb(var(--fg))' }}
                    >
                      Custom
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span
                        className="font-display font-black leading-none transition-colors duration-300"
                        style={{
                          fontSize: tier.price === 0 ? '2.25rem' : '2.5rem',
                          color: isSelected ? '#fff' : 'rgb(var(--fg))',
                        }}
                      >
                        {tier.price === 0
                          ? 'Gratis'
                          : `$${annual ? tier.priceY : tier.price}`}
                      </span>
                      {tier.price > 0 && (
                        <span
                          className="text-[12px] shrink-0 transition-colors duration-300"
                          style={{
                            color: isSelected
                              ? 'rgba(255,255,255,0.6)'
                              : 'rgb(var(--muted))',
                          }}
                        >
                          /mes
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Thin divider */}
                <div
                  className="mb-5 h-px transition-colors duration-300"
                  style={{
                    background: isSelected
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgb(var(--border) / 0.08)',
                  }}
                />

                {/* Feature list */}
                <ul className="flex-1 mb-7 space-y-2.5">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <span
                        className="text-[14px] mt-0.5 shrink-0 transition-colors duration-300"
                        style={{
                          color: isSelected ? 'rgba(255,255,255,0.8)' : '#E8341A',
                        }}
                      >
                        ✓
                      </span>
                      <span
                        className="text-[13px] leading-snug transition-colors duration-300"
                        style={{
                          color: isSelected
                            ? 'rgba(255,255,255,0.85)'
                            : 'rgb(var(--muted))',
                        }}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={tier.href}
                  onClick={(e) => e.stopPropagation()}
                  className="block text-center py-3.5 rounded-xl font-display font-black text-[13px] tracking-[0.02em] text-white transition-all duration-300 hover:opacity-85"
                  style={{
                    background: isSelected
                      ? 'rgba(255,255,255,0.2)'
                      : '#E8341A',
                    border: isSelected
                      ? '1.5px solid rgba(255,255,255,0.3)'
                      : 'none',
                  }}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center mt-6 text-[12px] text-muted px-4">
          Sin tarjeta de crédito requerida · Cancela cuando quieras ·
          Impresión de tarjetas física incluida en todos los planes
        </p>
      </div>
    </section>
  );
}
