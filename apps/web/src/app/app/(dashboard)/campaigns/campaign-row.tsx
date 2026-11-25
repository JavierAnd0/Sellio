'use client';

import { AlertTriangle, CheckCircle2, Clock, Pencil, Send, Trash2 } from 'lucide-react';

import { SendReview } from './send-review';
import {
  btnGhost,
  plural,
  shortDate,
  walletBreakdown,
  type Campaign,
  type Reach,
} from './campaign-ui';

export function CampaignRow({
  orgName,
  campaign,
  reach,
  reviewing = false,
  sending = false,
  error = null,
  onReview,
  onCancelReview,
  onSend,
  onEdit,
  onDelete,
}: {
  orgName: string;
  campaign: Campaign;
  reach: Reach;
  reviewing?: boolean;
  sending?: boolean;
  error?: string | null;
  onReview?: () => void;
  onCancelReview?: () => void;
  onSend?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const isDraft = campaign.status === 'draft';
  const audienceLabel = campaign.cardName ? `Clientes de “${campaign.cardName}”` : 'Todos los clientes';

  return (
    <article className="rounded-[20px] border border-border/10 bg-surface p-5">
      {reviewing && isDraft ? (
        <SendReview
          orgName={orgName}
          title={campaign.title}
          message={campaign.message}
          audienceLabel={audienceLabel}
          reach={reach}
          pending={sending}
          error={error}
          onBack={() => onCancelReview?.()}
          onConfirm={() => onSend?.()}
        />
      ) : (
        <>
          <div className="flex items-start gap-4">
            <div
              aria-hidden
              className={`mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:flex ${isDraft ? 'bg-surface-2' : 'bg-green-950/40'}`}
            >
              {isDraft ? <Clock size={16} className="text-muted" /> : <CheckCircle2 size={16} className="text-green-400" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="max-w-full truncate text-sm font-bold text-fg">{campaign.title}</h3>
                <span className="shrink-0 rounded-md border border-border/10 bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-muted">
                  {campaign.cardName ?? 'Todos los clientes'}
                </span>
              </div>
              <p className="mb-2 line-clamp-2 text-sm text-fg/80">{campaign.message}</p>
              <p className="text-pretty text-xs text-muted">{metaLine(campaign, reach)}</p>
              {!isDraft && campaign.wallet_delivery === 'failed' && (
                <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-red-400">
                  <AlertTriangle size={13} className="mt-px shrink-0" />
                  No pudimos notificar a los iPhone. El mensaje ya está en sus tarjetas y lo verán cuando su Wallet
                  se actualice.
                </p>
              )}
            </div>
          </div>

          {isDraft && (
            <div className="mt-4 flex flex-wrap items-center justify-end gap-1 border-t border-border/10 pt-3">
              <button type="button" onClick={onDelete} aria-label={`Eliminar borrador “${campaign.title}”`} className={`${btnGhost} mr-auto hover:text-red-400`}>
                <Trash2 size={15} />
                <span className="sm:sr-only">Eliminar</span>
              </button>
              <button type="button" onClick={onEdit} className={btnGhost}>
                <Pencil size={14} />
                Editar
              </button>
              <button
                type="button"
                onClick={onReview}
                className={`${btnGhost} border border-[#E8341A]/40 text-fg hover:border-[#E8341A] hover:bg-[#E8341A]/10`}
              >
                <Send size={14} className="text-[#E8341A]" />
                Revisar y enviar
              </button>
            </div>
          )}

          {error && !reviewing && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-400">
              {error}
            </p>
          )}
        </>
      )}
    </article>
  );
}

function metaLine(c: Campaign, reach: Reach): string {
  if (c.status === 'draft') {
    const phones = reach.wallet.apple + reach.wallet.google;
    return `Borrador del ${shortDate(c.created_at)} · llegaría a ${plural(phones, 'teléfono', 'teléfonos')}`;
  }
  const sent = `Enviada el ${shortDate(c.sent_at ?? c.created_at)}`;
  const phones = c.wallet_devices + c.wallet_google;
  if (c.wallet_delivery === 'skipped' || phones === 0) return `${sent} · nadie tenía la tarjeta en su Wallet`;
  return `${sent} · llegó a ${plural(phones, 'teléfono', 'teléfonos')} (${walletBreakdown(c.wallet_devices, c.wallet_google)})`;
}
