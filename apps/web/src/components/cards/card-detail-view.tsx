'use client';

import { useState, useEffect } from 'react';
import { Download, Trash2, Printer } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';

import type { Card } from '@sellio/domain';
import { CardFromDesign } from './card-renderer';
import { DeleteCardModal } from './delete-card-modal';

interface CardDetailViewProps {
  card: Card;
  primaryColor: string;
  memberCount: number;
  orgSlug: string;
}

export function CardDetailView({ card, primaryColor, memberCount, orgSlug }: CardDetailViewProps) {
  const design = (card.design ?? {}) as Record<string, unknown>;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const cardsBaseUrl = process.env.NEXT_PUBLIC_CARDS_URL || 'http://localhost:3001';
  const checkInUrl = `${cardsBaseUrl}/check-in/${orgSlug}`;

  useEffect(() => {
    QRCode.toDataURL(checkInUrl, {
      width: 600,
      margin: 1,
      color: {
        dark: '#0A0A0A',
        light: '#FFFFFF',
      },
    })
      .then(setQrCodeUrl)
      .catch((err) => console.error('Error generating QR code in detail view:', err));
  }, [checkInUrl]);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── Left Column: Card visual ── */}
        <div className="space-y-8">
          <div className="rounded-[28px] border border-border/40 bg-[#EAE7DF]/40 p-6 shadow-sm dark:bg-surface-2">
            {/* Card preview */}
            <div className="relative mb-8 flex h-[200px] sm:h-[260px] w-full items-center justify-center overflow-hidden rounded-[20px]">
              <div
                className="transform scale-[0.78] sm:scale-100 md:scale-[1.05] transition-transform origin-center flex shrink-0"
                style={{
                  filter: 'drop-shadow(0 24px 32px rgba(0,0,0,0.15))',
                  width: 380,
                }}
              >
                <CardFromDesign design={design} primaryColor={primaryColor} W={380} H={230} />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-[#E8341A] px-4 py-3.5 text-[14px] font-bold text-white shadow-sm transition-all hover:bg-[#D02B13]"
              >
                <Download size={15} /> Descargar PNG
              </button>
              <Link 
                href={`/app/cards/${card.id}/qr-poster`}
                target="_blank"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] border border-border/40 bg-[#E1DED5]/40 px-4 py-3.5 text-[14px] font-bold text-fg transition-all hover:bg-[#E1DED5]/80 dark:bg-surface"
              >
                <Printer size={15} /> Imprimir Flyer
              </Link>
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-[28px] border border-red-200/60 bg-red-50/40 p-6 dark:border-red-900/30 dark:bg-red-950/10">
            <h3 className="mb-1 text-[15px] font-bold text-red-700 dark:text-red-400">
              Zona de peligro
            </h3>
            <p className="mb-4 text-[13px] font-medium text-red-600/80 dark:text-red-400/70">
              Esta acción es permanente y no se puede deshacer.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 rounded-xl border border-red-300/60 bg-white px-4 py-2.5 text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50 dark:bg-transparent dark:hover:bg-red-950/20"
            >
              <Trash2 size={14} /> Eliminar tarjeta
            </button>
          </div>
        </div>

        {/* ── Right Column: QR ── */}
        <div className="space-y-8">
          <div className="flex flex-col items-center rounded-[28px] border border-border/40 bg-[#EAE7DF]/40 p-8 text-center shadow-sm dark:bg-surface-2">
            <h3 className="mb-6 w-full text-left font-display text-2xl font-black uppercase tracking-wider text-fg">
              Código QR
            </h3>
            <div className="mb-6 flex items-center justify-center rounded-[32px] bg-[#E1DED5]/60 p-8 dark:bg-surface">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="Código QR de Check-in" 
                  className="w-[180px] h-[180px] object-contain"
                />
              ) : (
                <div className="w-[180px] h-[180px] bg-gray-100 dark:bg-surface-2 animate-pulse rounded-2xl" />
              )}
            </div>
            <p className="mb-8 px-4 text-[15px] font-medium leading-relaxed text-muted">
              Tus clientes escanean este QR para unirse y sumar puntos
            </p>
            {qrCodeUrl ? (
              <a 
                href={qrCodeUrl}
                download={`qr-${orgSlug}.png`}
                className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-border/40 bg-[#E1DED5]/40 px-4 py-3.5 text-[14px] font-bold text-fg transition-all hover:bg-[#E1DED5]/80 dark:bg-surface"
              >
                <Download size={15} /> Descargar QR
              </a>
            ) : (
              <button 
                disabled 
                className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-border/40 bg-[#E1DED5]/40 px-4 py-3.5 text-[14px] font-bold text-fg opacity-50 cursor-not-allowed dark:bg-surface"
              >
                Generando QR...
              </button>
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteCardModal
          cardId={card.id}
          cardName={card.name}
          memberCount={memberCount}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}
