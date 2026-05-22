import QRCode from 'qrcode';
import { FlippableCard } from './flippable-card';

interface MembershipCardViewProps {
  businessName: string;
  cardName: string;
  points: number;
  pointsForReward: number;
  rewardDescription: string;
  customerName: string | null;
  primaryColor: string;
  checkInUrl: string | null;
  membershipSlug: string;
}

export async function MembershipCardView({
  businessName,
  cardName,
  points,
  pointsForReward,
  rewardDescription,
  customerName,
  primaryColor,
  checkInUrl,
  membershipSlug,
}: MembershipCardViewProps) {
  let qrSvg: string | null = null;
  if (checkInUrl) {
    try {
      qrSvg = await QRCode.toString(checkInUrl, {
        type: 'svg',
        margin: 1,
        color: { dark: '#0A0A0A', light: '#F5F0EB' },
      });
    } catch {
      qrSvg = null;
    }
  }

  const progressPercent = Math.min(100, Math.round((points % pointsForReward) / pointsForReward * 100));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Flippable card — front: design, back: stamp grid */}
        <FlippableCard
          businessName={businessName}
          cardName={cardName}
          points={points}
          pointsForReward={pointsForReward}
          rewardDescription={rewardDescription}
          customerName={customerName}
          primaryColor={primaryColor}
        />

        {/* Points progress */}
        <div className="mt-4 rounded-2xl border border-border/30 bg-surface px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted">Progreso</span>
            <span className="text-sm font-bold tabular-nums text-fg">
              {points} / {pointsForReward} pts
            </span>
          </div>
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-border/30">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%`, background: primaryColor }}
            />
          </div>
          {points >= pointsForReward ? (
            <p className="mt-2 text-xs font-bold" style={{ color: primaryColor }}>
              🎉 ¡Puedes canjear: {rewardDescription}!
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted">
              Faltan{' '}
              <span className="font-bold text-fg">
                {pointsForReward - (points % pointsForReward)}
              </span>{' '}
              puntos para: <span className="text-fg">{rewardDescription}</span>
            </p>
          )}
        </div>

        {/* QR code */}
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-border/20 bg-surface p-6">
          {qrSvg ? (
            <>
              <div
                className="flex h-44 w-44 items-center justify-center rounded-2xl bg-[#F5F0EB] p-3"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <p className="mt-3 text-center text-xs font-semibold text-fg">
                Muestra este QR al cajero para sumar puntos
              </p>
              {checkInUrl && (
                <a
                  href={checkInUrl}
                  className="mt-2 text-[11px] font-medium text-muted underline-offset-2 hover:underline"
                >
                  o ingresa aquí manualmente
                </a>
              )}
            </>
          ) : (
            <div className="flex h-44 w-44 items-center justify-center rounded-2xl border-2 border-dashed border-border/30 bg-surface-2">
              <p className="text-center text-[10px] text-muted">QR no disponible</p>
            </div>
          )}
        </div>

        {/* Wallet buttons */}
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={`/api/wallet/google/${membershipSlug}`}
            className="flex items-center justify-center gap-2.5 rounded-[14px] border border-border/40 bg-surface px-4 py-3 text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
              <path d="M17.65 12.2c0-.38-.03-.74-.09-1.09H12v2.06h3.17c-.14.75-.55 1.38-1.17 1.81v1.5h1.89c1.11-1.02 1.76-2.53 1.76-4.28z" fill="#fff"/>
              <path d="M12 18c1.59 0 2.93-.53 3.9-1.43l-1.89-1.5c-.53.36-1.2.57-2.01.57-1.55 0-2.86-1.04-3.33-2.45H6.7v1.55C7.67 16.98 9.69 18 12 18z" fill="#fff"/>
              <path d="M8.67 13.19a3.55 3.55 0 010-2.38V9.26H6.7A6.01 6.01 0 006 12c0 .97.23 1.89.7 2.74l1.97-1.55z" fill="#fff"/>
              <path d="M12 8.57c.87 0 1.65.3 2.26.89l1.69-1.69C14.92 6.79 13.58 6.2 12 6.2c-2.31 0-4.33 1.02-5.3 2.57l1.97 1.55C9.14 9.61 10.45 8.57 12 8.57z" fill="#fff"/>
            </svg>
            Guardar en Google Wallet
          </a>
          <a
            href={`/api/wallet/apple/${membershipSlug}`}
            className="flex items-center justify-center gap-2.5 rounded-[14px] border border-border/40 bg-surface px-4 py-3 text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
            aria-label="Añadir a Apple Wallet (próximamente)"
          >
            <svg width="16" height="20" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-104.9C111.3 740.6 79 672.6 79 607.2c0-131.5 85.9-201.1 170.2-201.1 45.1 0 82.4 30.1 110.3 30.1 26.7 0 68.4-31.8 120.2-31.8 19.3 0 108.1 1.9 163.6 78.4zm-109-166.5c-33.3 40.1-73 68.4-117.2 68.4-4.8 0-9.7-.3-14.6-.9 1-51.1 25.1-101.7 56.6-135.1 33.3-35.7 88.2-63.9 137.4-65.7.9 5.4 1.3 10.8 1.3 16.6 0 47.4-20.4 97.1-63.5 116.7z"/>
            </svg>
            Añadir a Apple Wallet
          </a>
        </div>

        {/* Sellio branding */}
        <p className="mt-6 text-center text-xs text-muted">
          Powered by <span className="font-bold text-fg">Sellio</span>
        </p>
      </div>
    </div>
  );
}
