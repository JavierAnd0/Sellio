'use client';

interface CardPreviewMiniProps {
  name: string;
  rewardDescription: string;
  pointsForReward: number;
  primaryColor?: string;
}

export function CardPreviewMini({
  name,
  rewardDescription,
  pointsForReward,
  primaryColor = '#E8341A',
}: CardPreviewMiniProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}cc 0%, ${primaryColor} 100%)`,
        minHeight: '140px',
      }}
    >
      {/* Decorative circles */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20"
        style={{ background: 'rgba(255,255,255,0.4)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full opacity-10"
        style={{ background: 'rgba(255,255,255,0.4)' }}
      />

      <div className="relative z-10">
        <p className="font-display text-base font-bold leading-tight">
          {name || 'Nombre de tarjeta'}
        </p>
        <p className="mt-1 text-xs opacity-80">{rewardDescription || 'Descripción de recompensa'}</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-70">Puntos para recompensa</p>
            <p className="font-display text-2xl font-bold">{pointsForReward || '—'}</p>
          </div>
          <div className="rounded-lg bg-white/20 px-3 py-1">
            <p className="text-xs font-semibold">Vista previa</p>
          </div>
        </div>
      </div>
    </div>
  );
}
