import { CardPreview } from '@sellio/ui';

interface MembershipCardViewProps {
  businessName: string;
  cardName: string;
  points: number;
  pointsForReward: number;
  rewardDescription: string;
  customerName: string | null;
  primaryColor: string;
}

export function MembershipCardView({
  businessName,
  cardName,
  points,
  pointsForReward,
  rewardDescription,
  customerName,
  primaryColor,
}: MembershipCardViewProps) {
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

        {/* QR placeholder (M2.3 will implement real QR) */}
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-border/20 bg-surface p-6">
          <div
            className="flex h-36 w-36 items-center justify-center rounded-xl border-2 border-dashed border-border/30 bg-surface-2"
            aria-label="Código QR (próximamente)"
          >
            <div className="text-center">
              <div className="mx-auto mb-2 grid h-12 w-12 grid-cols-3 gap-1 opacity-30">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-sm bg-fg"
                    style={{ opacity: Math.random() > 0.4 ? 1 : 0 }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted">QR próximamente</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Muestra este código al momento del pago
          </p>
        </div>

        {/* Sellio branding */}
        <p className="mt-6 text-center text-xs text-muted">
          Powered by{' '}
          <span className="font-semibold text-fg">Sellio</span>
        </p>
      </div>
    </div>
  );
}
