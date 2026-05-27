'use client';

import { CardPreview } from '@sellio/ui';
import { useEffect, useState } from 'react';

interface FlippableCardProps {
  businessName: string;
  cardName: string;
  points: number;
  pointsForReward: number;
  rewardDescription: string;
  customerName: string | null;
  primaryColor: string;
}

function StampGrid({
  points,
  pointsForReward,
  primaryColor,
  businessName,
  rewardDescription,
}: {
  points: number;
  pointsForReward: number;
  primaryColor: string;
  businessName: string;
  rewardDescription: string;
}) {
  const displayTotal = Math.min(pointsForReward, 20);
  const filledCount = Math.min(points % pointsForReward || (points > 0 && points >= pointsForReward ? displayTotal : 0), displayTotal);
  const cols = displayTotal <= 5 ? displayTotal : displayTotal <= 10 ? 5 : displayTotal <= 16 ? 4 : 5;

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl p-5 text-white shadow-2xl"
      style={{ background: 'linear-gradient(135deg, #1A1712 0%, #111009 100%)', border: '1px solid rgba(245,240,235,0.12)' }}
    >
      {/* Decorative circle */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />

      {/* Header */}
      <div className="relative z-10 mb-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(245,240,235,0.5)' }}>
          {businessName}
        </p>
        <p className="mt-0.5 text-sm font-bold" style={{ color: 'rgba(245,240,235,0.8)' }}>
          {rewardDescription}
        </p>
      </div>

      {/* Stamp grid */}
      <div
        className="relative z-10 my-3 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: displayTotal }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-full transition-all"
            style={{
              background: i < filledCount ? primaryColor : 'rgba(245,240,235,0.06)',
              border: i < filledCount ? 'none' : '1.5px solid rgba(245,240,235,0.15)',
              transitionDelay: `${i * 40}ms`,
            }}
          >
            {i < filledCount && (
              <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-end justify-between">
        <span className="text-[10px]" style={{ color: 'rgba(245,240,235,0.35)' }}>
          {pointsForReward > 20 ? `${points} / ${pointsForReward} pts` : `${filledCount} / ${displayTotal} sellos`}
        </span>
        <span className="font-display text-xs font-black" style={{ color: 'rgba(245,240,235,0.25)' }}>
          Sellio
        </span>
      </div>
    </div>
  );
}

export function FlippableCard({
  businessName,
  cardName,
  points,
  pointsForReward,
  rewardDescription,
  customerName,
  primaryColor,
}: FlippableCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsFlipped(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <button
      type="button"
      className="block w-full border-0 bg-transparent p-0 text-left"
      style={{ perspective: '1200px', cursor: 'pointer', userSelect: 'none' }}
      onClick={() => setIsFlipped((f) => !f)}
      title={isFlipped ? 'Toca para ver el diseño' : 'Toca para ver tus sellos'}
      aria-label={isFlipped ? 'Ver el frente de la tarjeta' : 'Ver los sellos de la tarjeta'}
    >
      {/* Flip instruction hint */}
      <p className="mb-2 text-center text-[11px] text-muted opacity-70">
        {isFlipped ? 'Toca para ver el frente' : 'Toca para ver tus sellos'}
      </p>

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 220,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front — card design */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <CardPreview
            businessName={businessName}
            cardName={cardName}
            points={points}
            pointsForReward={pointsForReward}
            rewardDescription={rewardDescription}
            customerName={customerName}
            primaryColor={primaryColor}
          />
        </div>

        {/* Back — stamp grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <StampGrid
            points={points}
            pointsForReward={pointsForReward}
            primaryColor={primaryColor}
            businessName={businessName}
            rewardDescription={rewardDescription}
          />
        </div>
      </div>
    </button>
  );
}
