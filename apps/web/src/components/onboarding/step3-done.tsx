'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { updateBusinessAction } from '@/actions/onboarding/onboarding.actions';
import type { Palette } from './palettes';

interface Step3DoneProps {
  businessName: string;
  category: string;
  cardName: string;
  palette: Palette;
}

export function Step3Done({ businessName, category: _category, cardName, palette }: Step3DoneProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const result = await updateBusinessAction(businessName);

      if (cancelled) return;

      if (!result.ok) {
        setError(result.error);
        setStatus('error');
        return;
      }

      setStatus('done');
    }

    void finish();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f3ef] text-[#161514]">
      <div className="grid min-h-screen grid-cols-[250px_1fr]">
        <aside className="border-r border-[#ddd2c8] bg-[#f1ebe5] p-6">
          <div className="mb-8 flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-coral font-display text-sm font-extrabold text-white">S</div>
            <p className="font-display text-xl font-extrabold">Sellio.</p>
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a817a]">Menu</p>
          <nav className="space-y-2">
            <NavItem active label="Dashboard" />
            <NavItem label="Tarjetas" />
            <NavItem label="Clientes" />
            <NavItem label="Analytics" disabled />
            <NavItem label="Configuracion" />
          </nav>
        </aside>

        <main className="p-10">
          <h1 className="font-display text-[56px] font-extrabold tracking-tight leading-none">
            Hola, <span className="text-coral">{businessName || 'cafe mountain'}👋</span>
          </h1>

          <div className="mt-8 rounded-[22px] border border-coral/20 bg-[#fff6f2] p-9 shadow-[0_20px_60px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-[1fr_250px] items-center gap-8">
              <div>
                <p className="font-display text-[54px] font-extrabold leading-[0.9] tracking-tight">
                  ¡Tu tarjeta de
                  <br />
                  lealtad está lista!🎉
                </p>
                <p className="mt-4 max-w-[540px] text-[38px] leading-[1.15] text-[#6f6660]">
                  Comparte tu QR con tus primeros clientes y empieza a fidelizarlos hoy.
                </p>
                <div className="mt-7 flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.push('/app/cards')}
                    className="rounded-2xl bg-coral px-8 py-4 font-display text-[34px] font-extrabold text-white transition hover:bg-coral/90"
                  >
                    Ver mi tarjeta →
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl border border-[#d9cec4] bg-white px-8 py-4 text-[34px] font-semibold text-[#1b1918]"
                  >
                    Descargar QR
                  </button>
                </div>
                {status === 'loading' ? (
                  <p className="mt-3 text-sm text-[#7d736c]">Guardando configuracion...</p>
                ) : null}
                {status === 'error' ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
              </div>
              <div className="justify-self-end">
                <MiniCard businessName={businessName} cardName={cardName} palette={palette} />
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-5">
            <MetricCard label="Clientes activos" value="0" subtitle="de 50 disponibles" />
            <MetricCard label="Puntos otorgados" value="0" subtitle="esta semana" />
            <MetricCard label="Visitas hoy" value="0" subtitle="sin actividad aun" />
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ label, active = false, disabled = false }: { label: string; active?: boolean; disabled?: boolean }) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-[30px] ${active ? 'bg-coral/15 text-coral' : disabled ? 'text-[#b9b0aa]' : 'text-[#252321]'}`}
    >
      {label}
    </div>
  );
}

function MetricCard({ label, value, subtitle }: { label: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-3xl border border-[#ddd2c8] bg-[#f5f0ea] p-7">
      <p className="text-[30px] text-[#6f6660]">{label}</p>
      <p className="mt-2 font-display text-[84px] font-extrabold leading-none">{value}</p>
      <p className="text-[30px] text-[#7f766f]">{subtitle}</p>
    </div>
  );
}

function MiniCard({
  businessName,
  cardName,
  palette,
}: {
  businessName: string;
  cardName: string;
  palette: Palette;
}) {
  return (
    <div
      className="relative h-[250px] w-[320px] overflow-hidden rounded-[22px] p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
      style={{ background: palette.bg }}
    >
      <div className="absolute -right-8 -top-8 size-36 rounded-full border border-white/20" />
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-[18px] font-extrabold" style={{ color: palette.primary }}>
              {businessName}
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{cardName}</p>
          </div>
          <div className="grid size-8 place-items-center rounded-lg text-sm font-bold text-white" style={{ background: palette.primary }}>
            S
          </div>
        </div>
        <div>
          <p className="font-display text-[62px] font-extrabold leading-none">847</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Puntos acumulados</p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">Miembro</p>
            <p className="text-[24px]">Ana Garcia</p>
          </div>
          <div className="grid grid-cols-4 gap-1 opacity-70">
            {Array.from({ length: 16 }).map((_, idx) => (
              <span key={idx} className="size-2 rounded-[2px] bg-white/80" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
