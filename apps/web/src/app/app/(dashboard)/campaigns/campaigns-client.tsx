'use client';

import { useState, useTransition } from 'react';
import { Send, Trash2, Plus, Megaphone, Clock, CheckCircle2 } from 'lucide-react';
import {
  createCampaignAction,
  sendCampaignAction,
  deleteCampaignAction,
} from '@/actions/campaigns/campaign.actions';

interface Campaign {
  id: string;
  title: string;
  message: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  card_id: string | null;
  cardName: string | null;
}

interface Card {
  id: string;
  name: string;
}

interface Props {
  campaigns: Campaign[];
  cards: Card[];
  orgName: string;
}

export function CampaignsClient({ campaigns: initial, cards, orgName }: Props) {
  const [campaigns, setCampaigns] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = (formData: FormData) => {
    setFormError(null);
    startTransition(async () => {
      const result = await createCampaignAction(formData);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setShowForm(false);
      // Refresh via server refetch would be ideal, but since we're client-side
      // we rely on revalidatePath + Next.js cache busting on next navigation
      window.location.reload();
    });
  };

  const handleSend = (id: string) => {
    setSendingId(id);
    startTransition(async () => {
      await sendCampaignAction(id);
      setSendingId(null);
      window.location.reload();
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteCampaignAction(id);
      setDeletingId(null);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    });
  };

  const drafts = campaigns.filter((c) => c.status === 'draft');
  const sent = campaigns.filter((c) => c.status === 'sent');

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-1">
            {orgName}
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-fg">
            Campañas
          </h1>
          <p className="text-sm text-muted mt-1">
            Envía mensajes a todos los clientes de una tarjeta
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E8341A] text-white text-sm font-bold hover:bg-[#D02B13] transition-colors shadow-lg shadow-coral/20"
        >
          <Plus size={16} />
          Nueva campaña
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-2xl border border-border bg-surface p-6 mb-8">
          <h2 className="font-display text-lg font-bold text-fg mb-5">Nueva campaña</h2>
          <form action={handleCreate} className="flex flex-col gap-4">
            <div>
              <label htmlFor="campaign-title" className="block text-[11px] font-bold uppercase tracking-widest text-muted mb-1.5">
                Título
              </label>
              <input
                id="campaign-title"
                name="title"
                required
                placeholder="Ej: Promo del fin de semana"
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-fg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-[#E8341A]/30"
              />
            </div>
            <div>
              <label htmlFor="campaign-message" className="block text-[11px] font-bold uppercase tracking-widest text-muted mb-1.5">
                Mensaje
              </label>
              <textarea
                id="campaign-message"
                name="message"
                required
                rows={3}
                placeholder="Escribe tu mensaje aquí..."
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-fg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-[#E8341A]/30 resize-none"
              />
            </div>
            {cards.length > 0 && (
              <div>
                <label htmlFor="campaign-card-id" className="block text-[11px] font-bold uppercase tracking-widest text-muted mb-1.5">
                  Tarjeta (opcional — deja en blanco para todas)
                </label>
                <select
                  id="campaign-card-id"
                  name="card_id"
                  className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-[#E8341A]/30"
                >
                  <option value="">Todos los clientes</option>
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            {formError && (
              <p className="text-sm text-red-400 font-medium">{formError}</p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-[#E8341A] text-white text-sm font-bold disabled:opacity-50 hover:bg-[#D02B13] transition-colors"
              >
                {isPending ? 'Guardando...' : 'Guardar borrador'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(null); }}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted hover:text-fg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drafts */}
      {drafts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3 flex items-center gap-2">
            <Clock size={11} />
            Borradores
          </h2>
          <div className="flex flex-col gap-3">
            {drafts.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onSend={() => handleSend(c.id)}
                onDelete={() => handleDelete(c.id)}
                isSending={sendingId === c.id}
                isDeleting={deletingId === c.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sent */}
      {sent.length > 0 && (
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3 flex items-center gap-2">
            <CheckCircle2 size={11} />
            Enviadas
          </h2>
          <div className="flex flex-col gap-3">
            {sent.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {campaigns.length === 0 && !showForm && (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
            <Megaphone size={22} className="text-muted/50" />
          </div>
          <h3 className="font-display text-lg font-bold text-fg mb-2">
            Sin campañas aún
          </h3>
          <p className="text-sm text-muted mb-6 max-w-xs mx-auto">
            Crea tu primera campaña para notificar a tus clientes sobre promociones o novedades.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 rounded-xl bg-[#E8341A] text-white text-sm font-bold hover:bg-[#D02B13] transition-colors"
          >
            Crear campaña
          </button>
        </div>
      )}
    </div>
  );
}

function CampaignCard({
  campaign,
  onSend,
  onDelete,
  isSending,
  isDeleting,
}: {
  campaign: Campaign;
  onSend?: () => void;
  onDelete?: () => void;
  isSending?: boolean;
  isDeleting?: boolean;
}) {
  const isDraft = campaign.status === 'draft';
  const date = new Date(campaign.sent_at ?? campaign.created_at).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-5 flex items-start gap-4">
      <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDraft ? 'bg-surface-2' : 'bg-green-950/40'}`}>
        {isDraft
          ? <Clock size={16} className="text-muted" />
          : <CheckCircle2 size={16} className="text-green-400" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-sm text-fg truncate">{campaign.title}</p>
          {campaign.cardName && (
            <span className="text-[10px] font-semibold text-muted/70 bg-surface-2 border border-border/40 rounded-md px-1.5 py-0.5 shrink-0">
              {campaign.cardName}
            </span>
          )}
        </div>
        <p className="text-sm text-muted line-clamp-2 mb-2">{campaign.message}</p>
        <p className="text-[11px] text-muted/60">
          {isDraft ? `Creada el ${date}` : `Enviada el ${date}`}
        </p>
      </div>

      {isDraft && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSend}
            disabled={isSending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8341A] text-white text-xs font-bold disabled:opacity-50 hover:bg-[#D02B13] transition-colors"
          >
            <Send size={12} />
            {isSending ? '...' : 'Enviar'}
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-muted hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
