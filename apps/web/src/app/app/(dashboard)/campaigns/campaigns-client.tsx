'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Clock, Megaphone, Plus, X } from 'lucide-react';

import { deleteCampaignAction, sendCampaignAction } from '@/actions/campaigns/campaign.actions';

import { CampaignComposer, type SentOutcome } from './campaign-composer';
import { CampaignRow } from './campaign-row';
import {
  btnGhost,
  btnPrimary,
  plural,
  reachFor,
  walletBreakdown,
  type Campaign,
  type CardOption,
  type ReachSummary,
} from './campaign-ui';

interface Props {
  campaigns: Campaign[];
  cards: CardOption[];
  orgName: string;
  reach: ReachSummary;
}

type Composer = { mode: 'new' } | { mode: 'edit'; draft: Campaign } | null;

const UNDO_MS = 5000;

export function CampaignsClient({ campaigns: initial, cards, orgName, reach }: Props) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initial);
  // Tras router.refresh() llegan props nuevas del servidor.
  useEffect(() => setCampaigns(initial), [initial]);

  const [composer, setComposer] = useState<Composer>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [outcome, setOutcome] = useState<SentOutcome | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Campaign | null>(null);
  const [, startTransition] = useTransition();
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const newButtonRef = useRef<HTMLButtonElement>(null);

  const showOutcome = (result: SentOutcome) => {
    setOutcome(result);
    // Esperar al render del banner antes de desplazarlo a la vista.
    requestAnimationFrame(() => bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  const closeComposer = () => {
    setComposer(null);
    requestAnimationFrame(() => newButtonRef.current?.focus());
  };

  const handleSendDraft = (c: Campaign) => {
    setSendingId(c.id);
    setRowError(null);
    startTransition(async () => {
      const result = await sendCampaignAction(c.id);
      setSendingId(null);
      if (!result.ok) {
        setRowError({ id: c.id, message: result.error });
        return;
      }
      setReviewingId(null);
      showOutcome({ ...result, title: c.title });
      router.refresh();
    });
  };

  // Eliminar con deshacer: la fila se oculta y el borrado real ocurre a los 5 s.
  const commitDelete = useCallback((c: Campaign) => {
    startTransition(async () => {
      const result = await deleteCampaignAction(c.id);
      setPendingDelete((current) => (current?.id === c.id ? null : current));
      if (!result.ok) {
        setRowError({ id: c.id, message: result.error });
        return;
      }
      setCampaigns((prev) => prev.filter((x) => x.id !== c.id));
    });
  }, []);

  const handleDelete = (c: Campaign) => {
    if (deleteTimer.current && pendingDelete) {
      clearTimeout(deleteTimer.current);
      commitDelete(pendingDelete); // confirmar el anterior antes de empezar otro
    }
    setReviewingId(null);
    setRowError(null);
    setPendingDelete(c);
    deleteTimer.current = setTimeout(() => {
      deleteTimer.current = null;
      commitDelete(c);
    }, UNDO_MS);
  };

  const undoDelete = () => {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    deleteTimer.current = null;
    setPendingDelete(null);
  };

  useEffect(
    () => () => {
      if (deleteTimer.current) clearTimeout(deleteTimer.current);
    },
    [],
  );

  const visible = campaigns.filter((c) => c.id !== pendingDelete?.id);
  const drafts = visible.filter((c) => c.status === 'draft');
  const sent = visible.filter((c) => c.status === 'sent');

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-fg">Campañas</h1>
          <p className="mt-1 max-w-md text-pretty text-sm text-muted">
            Tus clientes reciben el mensaje como notificación en el celular, desde la tarjeta de {orgName} en su
            Apple Wallet o Google Wallet.
          </p>
        </div>
        {!composer && (
          <button
            ref={newButtonRef}
            type="button"
            onClick={() => {
              setOutcome(null);
              setComposer({ mode: 'new' });
            }}
            className={`${btnPrimary} shrink-0 self-start`}
          >
            <Plus size={16} />
            Nueva campaña
          </button>
        )}
      </header>

      {/* Resultado del envío: región viva para lectores de pantalla. */}
      <div ref={bannerRef} aria-live="polite" role="status">
        {outcome && <OutcomeBanner outcome={outcome} onDismiss={() => setOutcome(null)} />}
      </div>

      {composer && (
        <CampaignComposer
          key={composer.mode === 'edit' ? composer.draft.id : 'new'}
          orgName={orgName}
          cards={cards}
          reach={reach}
          draft={composer.mode === 'edit' ? composer.draft : undefined}
          onClose={closeComposer}
          onSaved={() => {
            setComposer(null);
            router.refresh();
          }}
          onSent={(result) => {
            setComposer(null);
            showOutcome(result);
            router.refresh();
          }}
        />
      )}

      {pendingDelete && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-[20px] border border-border/10 bg-surface-2 px-5 py-2 text-sm text-fg">
          <span>
            Borrador <strong className="font-semibold">“{pendingDelete.title}”</strong> eliminado.
          </span>
          <button
            type="button"
            onClick={undoDelete}
            className={`${btnGhost} font-semibold text-fg underline underline-offset-4`}
          >
            Deshacer
          </button>
        </div>
      )}

      {drafts.length > 0 && (
        <section aria-labelledby="drafts-heading" className="mb-10">
          <h2
            id="drafts-heading"
            className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted"
          >
            <Clock size={12} aria-hidden />
            Borradores
          </h2>
          <div className="flex flex-col gap-3">
            {drafts.map((c) => (
              <CampaignRow
                key={c.id}
                orgName={orgName}
                campaign={c}
                reach={reachFor(c.card_id, reach)}
                reviewing={reviewingId === c.id}
                sending={sendingId === c.id}
                error={rowError?.id === c.id ? rowError.message : null}
                onReview={() => {
                  setRowError(null);
                  setOutcome(null);
                  setReviewingId(c.id);
                }}
                onCancelReview={() => setReviewingId(null)}
                onSend={() => handleSendDraft(c)}
                onEdit={() => {
                  setReviewingId(null);
                  setOutcome(null);
                  setComposer({ mode: 'edit', draft: c });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={() => handleDelete(c)}
              />
            ))}
          </div>
        </section>
      )}

      {sent.length > 0 && (
        <section aria-labelledby="sent-heading">
          <h2
            id="sent-heading"
            className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted"
          >
            <CheckCircle2 size={12} aria-hidden />
            Enviadas
          </h2>
          <div className="flex flex-col gap-3">
            {sent.map((c) => (
              <CampaignRow key={c.id} orgName={orgName} campaign={c} reach={reachFor(c.card_id, reach)} />
            ))}
          </div>
        </section>
      )}

      {visible.length === 0 && !composer && (
        <div className="rounded-[20px] border border-dashed border-border/15 p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2">
            <Megaphone size={22} className="text-muted" aria-hidden />
          </div>
          <h2 className="mb-2 font-display text-lg font-bold text-fg">Sin campañas aún</h2>
          <p className="mx-auto mb-6 max-w-xs text-sm text-muted">
            Avisa a tus clientes de promociones o novedades directo en su celular.
          </p>
          <button type="button" onClick={() => setComposer({ mode: 'new' })} className={btnPrimary}>
            Crear campaña
          </button>
        </div>
      )}
    </div>
  );
}

function OutcomeBanner({ outcome, onDismiss }: { outcome: SentOutcome; onDismiss: () => void }) {
  const phones = outcome.apple + outcome.google;
  const failed = outcome.status === 'failed';

  let body: string;
  if (failed) {
    body =
      'No pudimos notificar a los iPhone. El mensaje ya está en sus tarjetas y lo verán cuando su Wallet se actualice.';
  } else if (outcome.status === 'skipped' || phones === 0) {
    body = 'Nadie tenía la tarjeta en su Wallet, así que nadie recibió notificación.';
  } else {
    body = `Llegó a ${plural(phones, 'teléfono', 'teléfonos')} (${walletBreakdown(outcome.apple, outcome.google)}).`;
  }

  return (
    <div
      className={`mb-8 flex items-start gap-3 rounded-[20px] border p-4 ${
        failed ? 'border-red-400/30 bg-red-500/[0.06]' : 'border-green-400/25 bg-green-500/[0.06]'
      }`}
    >
      {failed ? (
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-400" aria-hidden />
      ) : (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-400" aria-hidden />
      )}
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold text-fg">
          {failed ? 'Enviada con problemas' : 'Enviada'}: “{outcome.title}”
        </p>
        <p className="mt-0.5 text-fg/80">{body}</p>
      </div>
      <button type="button" onClick={onDismiss} aria-label="Cerrar aviso" className={`${btnGhost} -my-2 -mr-2 px-2`}>
        <X size={16} />
      </button>
    </div>
  );
}
