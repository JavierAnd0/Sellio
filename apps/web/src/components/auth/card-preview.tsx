export function CardPreview() {
  return (
    <div className="text-center">
      <div
        className="relative mx-auto w-80 overflow-hidden rounded-2xl p-7 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
        style={{ background: 'linear-gradient(135deg, #0F0C08 0%, #2A1A0E 60%, #E8341A 100%)' }}
      >
        {/* Círculo decorativo */}
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border border-coral/20"
        />

        {/* Header */}
        <div className="relative mb-7 flex items-start justify-between">
          <div>
            <div className="font-display text-sm font-extrabold text-coral">Tu Negocio</div>
            <div className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/30">
              Member Card
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-coral font-display text-sm font-extrabold text-white">
            S
          </div>
        </div>

        {/* Puntos */}
        <div className="font-display text-5xl font-extrabold leading-none text-white">847</div>
        <div className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/35">
          puntos acumulados
        </div>

        {/* Footer */}
        <div className="relative mt-7 flex items-end justify-between">
          <div>
            <div className="text-[8px] uppercase tracking-[0.1em] text-white/30">Miembro</div>
            <div className="mt-0.5 text-sm font-medium text-white">Cliente Ejemplo</div>
          </div>
          {/* QR estático */}
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="16" height="16" rx="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <rect x="6" y="6" width="8" height="8" rx="1" fill="rgba(255,255,255,0.4)" />
            <rect x="28" y="2" width="16" height="16" rx="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <rect x="32" y="6" width="8" height="8" rx="1" fill="rgba(255,255,255,0.4)" />
            <rect x="2" y="28" width="16" height="16" rx="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <rect x="6" y="32" width="8" height="8" rx="1" fill="rgba(255,255,255,0.4)" />
            <rect x="28" y="28" width="4" height="4" fill="rgba(255,255,255,0.4)" />
            <rect x="34" y="28" width="4" height="4" fill="rgba(255,255,255,0.4)" />
            <rect x="40" y="28" width="4" height="4" fill="rgba(255,255,255,0.4)" />
            <rect x="28" y="34" width="4" height="10" fill="rgba(255,255,255,0.4)" />
            <rect x="34" y="34" width="10" height="4" fill="rgba(255,255,255,0.4)" />
            <rect x="40" y="40" width="4" height="4" fill="rgba(255,255,255,0.4)" />
          </svg>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-[280px] text-xs leading-relaxed text-muted">
        Crea tu tarjeta de lealtad en minutos.
        <br />
        Sin código. Sin complicaciones.
      </p>
    </div>
  );
}
