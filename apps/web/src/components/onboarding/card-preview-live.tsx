'use client';

import { useEffect, useRef, useState } from 'react';

import type { Palette } from './palettes';

interface CardPreviewLiveProps {
  businessName: string;
  cardName: string;
  palette: Palette;
}

export function CardPreviewLive({ businessName, cardName, palette }: CardPreviewLiveProps) {
  const [displayPalette, setDisplayPalette] = useState(palette);
  const [cardTransform, setCardTransform] = useState('rotateY(0deg)');
  const [cardTransition, setCardTransition] = useState('transform 0.22s ease-in');
  const prevNameRef = useRef(palette.name);

  useEffect(() => {
    if (prevNameRef.current === palette.name) return;
    prevNameRef.current = palette.name;

    // Phase 1 — flip card to edge (disappear)
    setCardTransition('transform 0.22s ease-in');
    setCardTransform('rotateY(90deg)');

    const swap = setTimeout(() => {
      // Snap to opposite edge and swap colors instantly
      setCardTransition('none');
      setCardTransform('rotateY(-90deg)');
      setDisplayPalette(palette);

      // Phase 2 — flip back into view (appear)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCardTransition('transform 0.22s ease-out');
          setCardTransform('rotateY(0deg)');
        });
      });
    }, 230);

    return () => clearTimeout(swap);
  }, [palette]);

  return (
    <div style={{ perspective: '900px' }}>
      <div
        style={{
          transform: cardTransform,
          transition: cardTransition,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        <CardFace
          businessName={businessName}
          cardName={cardName}
          palette={displayPalette}
        />
      </div>
    </div>
  );
}

function CardFace({
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
      className="relative overflow-hidden rounded-3xl"
      style={{
        width: 360,
        height: 220,
        background: palette.bg,
        flexShrink: 0,
        boxShadow: `0 30px 60px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)`,
      }}
    >
      {/* Gloss shine */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%)',
        }}
      />

      {/* Large decorative circle — top right */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          top: -70,
          right: -60,
          background: 'rgba(255,255,255,0.06)',
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 120,
          height: 120,
          top: -40,
          right: -20,
          background: 'rgba(255,255,255,0.04)',
        }}
      />

      {/* Bottom arc */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 280,
          height: 280,
          bottom: -180,
          left: -60,
          background: 'rgba(255,255,255,0.03)',
        }}
      />

      {/* S badge */}
      <div
        className="absolute right-5 top-5 flex items-center justify-center rounded-xl font-display font-extrabold text-white"
        style={{
          width: 32,
          height: 32,
          fontSize: 15,
          background: palette.primary,
          boxShadow: `0 4px 12px rgba(0,0,0,0.35)`,
        }}
      >
        S
      </div>

      {/* NFC icon — top left subtle */}
      <div className="absolute left-5 top-5 opacity-20">
        <NfcIcon />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between px-5 py-5">
        {/* Top: business + card name */}
        <div className="mt-2">
          <p
            className="font-display font-extrabold leading-tight tracking-tight"
            style={{ color: palette.primary, fontSize: 14 }}
          >
            {businessName || 'Tu Negocio'}
          </p>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-white/50">
            {cardName || 'Mi Tarjeta de Lealtad'}
          </p>
        </div>

        {/* Middle: points */}
        <div>
          <p className="text-[8px] uppercase tracking-[0.16em] text-white/40">
            Puntos acumulados
          </p>
          <p
            className="font-display font-extrabold leading-none text-white"
            style={{ fontSize: 44, letterSpacing: '-0.02em' }}
          >
            847
          </p>
        </div>

        {/* Bottom: member */}
        <div className="flex items-end justify-between">
          <p className="text-[11px] font-medium text-white/50">Cliente Ejemplo</p>
          <p
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: palette.primary, opacity: 0.8 }}
          >
            Lealtad
          </p>
        </div>
      </div>
    </div>
  );
}

function NfcIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
      <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" strokeOpacity="0.6" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" strokeOpacity="0.9" />
      <path d="M17.5 12a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z" strokeOpacity="0.4" />
    </svg>
  );
}
