'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Send } from 'lucide-react';

import {
  createCampaignAction,
  sendCampaignAction,
  sendNewCampaignAction,
  updateCampaignAction,
  type SendCampaignResult,
} from '@/actions/campaigns/campaign.actions';

import { NotificationPreview } from './notification-preview';
import { SendReview } from './send-review';
import {
  MESSAGE_MAX,
  TITLE_MAX,
  btnGhost,
  btnPrimary,
  fieldInput,
  fieldLabel,
  n,
  phonesOf,
  reachFor,
  type Campaign,
  type CardOption,
  type ReachSummary,
} from './campaign-ui';

export type SentOutcome = Extract<SendCampaignResult, { ok: true }> & { title: string };

/**
 * Crear o editar una campaña. La acción principal es enviar ("Revisar y
 * enviar"); guardar como borrador es secundaria.
 */
export function CampaignComposer({
  orgName,
  cards,
  reach,
  draft,
  onClose,
  onSaved,
  onSent,
}: {
  orgName: string;
  cards: CardOption[];
  reach: ReachSummary;
  /** Si viene, se edita ese borrador. */
  draft?: Campaign;
  onClose: () => void;
  onSaved: () => void;
  onSent: (outcome: SentOutcome) => void;
}) {
  const [title, setTitle] = useState(draft?.title ?? '');
  const [message, setMessage] = useState(draft?.message ?? '');
  const [cardId, setCardId] = useState(draft?.card_id ?? '');
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);
  const editing = !!draft;

  useEffect(() => {
    if (!reviewing) titleRef.current?.focus();
  }, [reviewing]);

  // Esc cierra el formulario (en revisión, Esc lo maneja SendReview).
  useEffect(() => {
    if (reviewing || pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [reviewing, pending, onClose]);

  const formData = () => {
    const fd = new FormData();
    fd.set('title', title);
    fd.set('message', message);
    fd.set('card_id', cardId);
    return fd;
  };

  const validate = (): boolean => {
    if (!title.trim()) {
      setError({ message: 'Escribe un título.', field: 'title' });
      return false;
    }
    if (!message.trim()) {
      setError({ message: 'Escribe el mensaje que recibirán tus clientes.', field: 'message' });
      return false;
    }
    setError(null);
    return true;
  };

  const saveDraft = () => {
    if (!validate()) return;
    startTransition(async () => {
      const result = editing ? await updateCampaignAction(draft.id, formData()) : await createCampaignAction(formData());
      if (!result.ok) return setError({ message: result.error, field: result.field });
      onSaved();
    });
  };

  const send = () => {
    startTransition(async () => {
      let result: SendCampaignResult;
      if (editing) {
        const saved = await updateCampaignAction(draft.id, formData());
        if (!saved.ok) return setError({ message: saved.error, field: saved.field });
        result = await sendCampaignAction(draft.id);
      } else {
        result = await sendNewCampaignAction(formData());
      }
      if (!result.ok) return setError({ message: result.error, field: result.field });
      onSent({ ...result, title: title.trim() });
    });
  };

  const selectedCard = cards.find((c) => c.id === cardId);
  const audienceLabel = selectedCard ? `Clientes de “${selectedCard.name}”` : 'Todos los clientes';
  const audienceReach = reachFor(cardId || null, reach);

  return (
    <section
      aria-labelledby="composer-heading"
      className="mb-10 rounded-[20px] border border-border/10 bg-surface p-5 md:p-7"
    >
      <h2 id="composer-heading" className="sr-only">
        {editing ? 'Editar campaña' : 'Nueva campaña'}
      </h2>

      {reviewing ? (
        <SendReview
          orgName={orgName}
          title={title.trim()}
          message={message.trim()}
          audienceLabel={audienceLabel}
          reach={audienceReach}
          pending={pending}
          error={error?.message ?? null}
          onBack={() => {
            setError(null);
            setReviewing(false);
          }}
          onConfirm={send}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_260px]">
          <div className="flex flex-col gap-5">
            <p className="font-display text-xl font-extrabold tracking-tight text-fg" aria-hidden>
              {editing ? 'Editar borrador' : 'Nueva campaña'}
            </p>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor="campaign-title" className={fieldLabel}>
                  Título
                </label>
                <CharCount value={title} max={TITLE_MAX} />
              </div>
              <input
                ref={titleRef}
                id="campaign-title"
                maxLength={TITLE_MAX}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={error?.field === 'title'}
                aria-describedby="campaign-title-hint"
                placeholder="Ej: Promo del fin de semana"
                className={fieldInput}
              />
              <p id="campaign-title-hint" className="mt-1.5 text-xs text-muted">
                Se ve en el reverso de la tarjeta, encima del mensaje.
              </p>
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor="campaign-message" className={fieldLabel}>
                  Mensaje
                </label>
                <CharCount value={message} max={MESSAGE_MAX} />
              </div>
              <textarea
                id="campaign-message"
                rows={4}
                maxLength={MESSAGE_MAX}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={error?.field === 'message'}
                aria-describedby="campaign-message-hint"
                placeholder="Ej: Este sábado tu segundo café va por nuestra cuenta. Muestra tu tarjeta en caja."
                className={`${fieldInput} resize-none`}
              />
              <p id="campaign-message-hint" className="mt-1.5 text-xs text-muted">
                Es lo que llega como notificación. Corto y directo: en la pantalla de bloqueo se ven unas 4 líneas.
              </p>
            </div>

            {/* En móvil la vista previa va justo después del mensaje. */}
            <div className="md:hidden">
              <NotificationPreview orgName={orgName} title={title} message={message} />
            </div>

            {cards.length > 0 && (
              <div>
                <label htmlFor="campaign-card-id" className={`${fieldLabel} mb-1.5`}>
                  Destinatarios
                </label>
                <select
                  id="campaign-card-id"
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className={fieldInput}
                >
                  <option value="">Todos los clientes · {phonesLabel(phonesOf(reach.all))}</option>
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      Clientes de “{c.name}” · {phonesLabel(phonesOf(reachFor(c.id, reach)))}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm font-medium text-red-400">
                {error.message}
              </p>
            )}

            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
              {editing ? (
                <>
                  <button type="button" onClick={saveDraft} disabled={pending} className={btnPrimary}>
                    {pending ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={() => validate() && setReviewing(true)}
                    disabled={pending}
                    className={btnGhost}
                  >
                    <Send size={14} />
                    Revisar y enviar
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => validate() && setReviewing(true)}
                    disabled={pending}
                    className={btnPrimary}
                  >
                    <Send size={15} />
                    Revisar y enviar
                  </button>
                  <button type="button" onClick={saveDraft} disabled={pending} className={btnGhost}>
                    {pending ? 'Guardando…' : 'Guardar borrador'}
                  </button>
                </>
              )}
              <button type="button" onClick={onClose} disabled={pending} className={`${btnGhost} sm:ml-auto`}>
                Cancelar
              </button>
            </div>
          </div>

          <div className="hidden md:block">
            <p className={`${fieldLabel} mb-1.5`} aria-hidden>
              Así lo verán
            </p>
            <NotificationPreview orgName={orgName} title={title} message={message} />
          </div>
        </div>
      )}
    </section>
  );
}

function phonesLabel(phones: number) {
  return phones === 0 ? 'nadie en Wallet aún' : `${n(phones)} ${phones === 1 ? 'teléfono' : 'teléfonos'}`;
}

function CharCount({ value, max }: { value: string; max: number }) {
  const left = max - value.length;
  const tone = left <= 0 ? 'text-red-400 font-semibold' : left <= max * 0.15 ? 'text-fg font-semibold' : 'text-muted';
  return (
    <span className={`text-xs tabular-nums ${tone}`} aria-live={left <= max * 0.15 ? 'polite' : 'off'}>
      {value.length}/{max}
    </span>
  );
}
