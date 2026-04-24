interface MiniCardProps {
  business: string;
  name: string;
  points: number;
  rotate?: number;
  accent?: string;
}

export default function MiniCard({
  business,
  name,
  points,
  rotate = 0,
  accent = '#E8341A',
}: MiniCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[18px] select-none"
      style={{
        width: 290,
        padding: '22px 24px',
        background: `linear-gradient(135deg, #0F0C08 0%, #2A1A0E 60%, ${accent} 100%)`,
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {/* Decorative rings */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          right: -30, top: -30, width: 140, height: 140,
          border: `1px solid ${accent}30`,
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          right: -60, top: -60, width: 200, height: 200,
          border: `1px solid ${accent}15`,
        }}
      />

      {/* Top row — business + logo mark */}
      <div className="relative flex items-start justify-between mb-6">
        <div>
          <div
            className="font-display font-black text-[14px] tracking-[0.04em]"
            style={{ color: accent }}
          >
            {business}
          </div>
          <div className="text-[9px] text-white/35 tracking-[0.15em] uppercase mt-0.5">
            Member Card
          </div>
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-xs text-white"
          style={{ background: accent }}
        >
          S
        </div>
      </div>

      {/* Points */}
      <div className="relative">
        <div className="font-display font-black text-[38px] text-white leading-none">
          {points.toLocaleString()}
        </div>
        <div className="text-[9px] text-white/40 tracking-[0.15em] uppercase mt-1">
          puntos acumulados
        </div>
      </div>

      {/* Bottom row — name + QR icon */}
      <div className="relative flex items-end justify-between mt-6">
        <div>
          <div className="text-[8px] text-white/30 tracking-[0.1em] uppercase">
            Miembro
          </div>
          <div className="text-[12px] font-medium text-white mt-0.5">{name}</div>
        </div>
        {/* Minimal QR placeholder */}
        <svg width={44} height={44} viewBox="0 0 44 44" fill="none">
          <rect x="2" y="2" width="16" height="16" rx="3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <rect x="6" y="6" width="8" height="8" rx="1" fill="rgba(255,255,255,0.5)" />
          <rect x="26" y="2" width="16" height="16" rx="3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <rect x="30" y="6" width="8" height="8" rx="1" fill="rgba(255,255,255,0.5)" />
          <rect x="2" y="26" width="16" height="16" rx="3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <rect x="6" y="30" width="8" height="8" rx="1" fill="rgba(255,255,255,0.5)" />
          <rect x="26" y="26" width="4" height="4" fill="rgba(255,255,255,0.5)" />
          <rect x="32" y="26" width="4" height="4" fill="rgba(255,255,255,0.5)" />
          <rect x="38" y="26" width="4" height="4" fill="rgba(255,255,255,0.5)" />
          <rect x="26" y="32" width="4" height="10" fill="rgba(255,255,255,0.5)" />
          <rect x="32" y="32" width="10" height="4" fill="rgba(255,255,255,0.5)" />
          <rect x="38" y="38" width="4" height="4" fill="rgba(255,255,255,0.5)" />
        </svg>
      </div>
    </div>
  );
}
