export interface CardPreviewProps {
  businessName?: string;
  cardName: string;
  points: number;
  pointsForReward: number;
  rewardDescription: string;
  customerName?: string | null;
  primaryColor?: string;
}

export function CardPreview({
  businessName,
  cardName,
  points,
  pointsForReward,
  rewardDescription,
  customerName,
  primaryColor = '#E8341A',
}: CardPreviewProps) {
  const progress = Math.min((points / pointsForReward) * 100, 100);
  const hasReward = points >= pointsForReward;

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}bb 0%, ${primaryColor} 60%, #0A0A0A 100%)`,
        minHeight: '220px',
      }}
    >
      {/* Decorative circles */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      />
      <div
        className="pointer-events-none absolute bottom-8 right-16 h-20 w-20 rounded-full"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            {businessName && (
              <p className="text-xs font-medium uppercase tracking-widest opacity-70">
                {businessName}
              </p>
            )}
            <p className="mt-0.5 text-lg font-bold leading-tight">{cardName}</p>
          </div>
          {customerName && (
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              {customerName}
            </div>
          )}
        </div>

        {/* Points */}
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-widest opacity-70">Tus puntos</p>
          <p className="font-display text-5xl font-extrabold leading-none tracking-tight">
            {points}
            <span className="ml-1 text-xl font-semibold opacity-60">/ {pointsForReward}</span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Reward */}
        <div className="mt-4">
          {hasReward ? (
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold">
              <span>🎉</span>
              <span>{rewardDescription} — ¡disponible!</span>
            </div>
          ) : (
            <p className="text-sm opacity-70">
              {pointsForReward - points} pts más para: <span className="font-semibold opacity-90">{rewardDescription}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
