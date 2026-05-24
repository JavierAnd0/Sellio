'use client';

import Link from 'next/link';
import { ArrowLeft, Printer, Download } from 'lucide-react';

interface PosterActionBarProps {
  cardId: string;
  qrCodeDataUrl: string;
  orgSlug: string;
}

export function PosterActionBar({ cardId, qrCodeDataUrl, orgSlug }: PosterActionBarProps) {
  return (
    <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-6 py-4 flex items-center justify-between no-print shadow-sm">
      <Link
        href={`/app/cards/${cardId}`}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
      >
        <ArrowLeft size={14} />
        Volver a Detalles
      </Link>
      <div className="flex items-center gap-3">
        <a
          href={qrCodeDataUrl}
          download={`qr-${orgSlug}.png`}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-all shadow-sm"
        >
          <Download size={14} />
          Descargar QR
        </a>
        <button
          onClick={() => window.print()}
          type="button"
          className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#E8341A] hover:bg-[#D02B13] rounded-xl transition-all shadow-md"
        >
          <Printer size={14} />
          Imprimir Flyer
        </button>
      </div>
    </div>
  );
}
