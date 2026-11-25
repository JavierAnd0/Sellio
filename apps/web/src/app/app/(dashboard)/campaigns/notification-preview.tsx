import { Wallet } from 'lucide-react';

/**
 * Pantalla de bloqueo con la notificación tal como la verá el cliente.
 * Paleta fija (no sigue el tema): es una foto del teléfono, no de la app.
 */
const LOCK_SCREEN_BG =
  'radial-gradient(120% 70% at 50% 0%, rgba(232, 52, 26, 0.24), transparent 62%), #0D0B09';

export function NotificationPreview({
  orgName,
  title,
  message,
  size = 'compact',
}: {
  orgName: string;
  title: string;
  message: string;
  size?: 'compact' | 'full';
}) {
  const full = size === 'full';
  const label = message
    ? `Vista previa de la notificación de ${orgName}: ${message}`
    : 'Vista previa de la notificación: aún no hay mensaje';

  return (
    <figure
      role="img"
      aria-label={label}
      className={`relative overflow-hidden rounded-[28px] border border-[rgba(245,240,235,0.10)] ${full ? 'px-4 pt-7 pb-5' : 'px-3 pt-5 pb-4'}`}
      style={{ background: LOCK_SCREEN_BG }}
    >
      <p
        aria-hidden
        className={`text-center font-display font-extrabold tabular-nums text-[#F5F0EB] ${full ? 'text-5xl mb-7' : 'text-3xl mb-5'}`}
      >
        9:41
      </p>

      <div
        aria-hidden
        className="rounded-2xl border border-[rgba(245,240,235,0.10)] bg-[rgba(245,240,235,0.12)] p-3 backdrop-blur"
      >
        <div className="mb-1.5 flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#E8341A]">
            <Wallet size={11} className="text-white" strokeWidth={2.5} />
          </span>
          <span className="flex-1 truncate text-[11px] font-semibold uppercase tracking-wide text-[rgba(245,240,235,0.75)]">
            Wallet · {orgName}
          </span>
          <span className="text-[11px] text-[rgba(245,240,235,0.6)]">ahora</span>
        </div>
        <p className="line-clamp-4 break-words text-[13px] leading-snug text-[#F5F0EB]">
          {message || <span className="text-[rgba(245,240,235,0.55)]">Tu mensaje aparecerá aquí</span>}
        </p>
      </div>

      <p aria-hidden className="mt-3 px-1 text-[11px] leading-snug text-[rgba(245,240,235,0.65)]">
        {title ? (
          <>
            Al abrir la tarjeta, en el reverso: <span className="font-semibold text-[#F5F0EB]">{title}</span>
          </>
        ) : (
          'El título se ve en el reverso de la tarjeta.'
        )}
      </p>
    </figure>
  );
}
