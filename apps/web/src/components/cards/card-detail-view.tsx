'use client';

import type { Card } from '@sellio/domain';
import { CardFromDesign, QR } from './card-renderer';

interface CardDetailViewProps {
  card: Card;
  primaryColor: string;
}

export function CardDetailView({
  card,
  primaryColor,
}: CardDetailViewProps) {
  const design = (card.design ?? {}) as Record<string, unknown>;

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left Column: Card visual ── */}
      <div className="space-y-8">
        <div className="rounded-[28px] border border-border/40 bg-[#EAE7DF]/40 p-6 shadow-sm dark:bg-surface-2">
          {/* Card preview */}
          <div className="relative mb-8 flex h-[260px] w-full items-center justify-center">
            <div
              style={{
                transform: 'scale(1.05)',
                transformOrigin: 'center center',
                filter: 'drop-shadow(0 24px 32px rgba(0,0,0,0.15))',
                position: 'absolute',
              }}
            >
              <CardFromDesign design={design} primaryColor={primaryColor} W={380} H={230} />
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-[#E8341A] px-4 py-3.5 text-[14px] font-bold text-white shadow-sm transition-all hover:bg-[#D02B13]">
              <span>↓</span> Descargar PNG
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] border border-border/40 bg-[#E1DED5]/40 px-4 py-3.5 text-[14px] font-bold text-fg transition-all hover:bg-[#E1DED5]/80 dark:bg-surface">
              <span>↓</span> Imprimir PDF
            </button>
          </div>
        </div>

      </div>

      {/* ── Right Column: QR ── */}
      <div className="space-y-8">
        {/* QR Box */}
        <div className="flex flex-col items-center rounded-[28px] border border-border/40 bg-[#EAE7DF]/40 p-8 text-center shadow-sm dark:bg-surface-2">
          <h3 className="mb-6 w-full text-left font-display text-2xl font-black uppercase tracking-wider text-fg">
            Código QR
          </h3>
          <div className="mb-6 flex items-center justify-center rounded-[32px] bg-[#E1DED5]/60 p-8 dark:bg-surface">
            <QR size={180} color="#0A0A0A" />
          </div>
          <p className="mb-8 px-4 text-[15px] font-medium leading-relaxed text-muted">
            Tus clientes escanean este QR para unirse y sumar puntos
          </p>
          <button className="w-full rounded-[14px] border border-border/40 bg-[#E1DED5]/40 px-4 py-3.5 text-[14px] font-bold text-fg transition-all hover:bg-[#E1DED5]/80 dark:bg-surface">
            ↓ Descargar QR
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
