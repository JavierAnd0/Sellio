import QRCode from 'qrcode';
import { CardPreview } from '@sellio/ui';

interface MembershipCardViewProps {
  businessName: string;
  cardName: string;
  points: number;
  pointsForReward: number;
  rewardDescription: string;
  customerName: string | null;
  primaryColor: string;
  checkInUrl: string | null;
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
        {/* Card */}
        <CardPreview
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

        {/* Sellio branding */}
        <p className="mt-6 text-center text-xs text-muted">
          Powered by <span className="font-bold text-fg">Sellio</span>
        </p>
      </div>
    </div>
  );
}
