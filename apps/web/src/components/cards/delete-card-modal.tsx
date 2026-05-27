'use client';

import { useRef, useState, useTransition } from 'react';
import { AlertTriangle, X } from 'lucide-react';

import { deleteCardAction } from '@/actions/cards/card.actions';

const CONFIRM_PHRASE = 'eliminar tarjeta';

interface DeleteCardModalProps {
  cardId: string;
  cardName: string;
  memberCount: number;
  onClose: () => void;
}

export function DeleteCardModal({ cardId, cardName, memberCount, onClose }: DeleteCardModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const confirmed = inputValue.trim().toLowerCase() === CONFIRM_PHRASE;

  const handleDelete = () => {
    if (!confirmed) return;
    startTransition(async () => {
      await deleteCardAction(cardId);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-card-title"
        className="relative w-full max-w-[520px] overflow-hidden rounded-[24px] bg-white shadow-2xl dark:bg-surface-2"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#E8341A] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-white" />
            <span id="delete-card-title" className="font-display text-[17px] font-black text-white">Advertencia</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-white/70 transition-colors hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          <p className="mb-4 text-[15px] font-medium text-fg">
            Al eliminar tu tarjeta:
          </p>
          <ul className="mb-6 space-y-2.5 text-[14px] text-fg">
            <li className="flex gap-2">
              <span className="mt-0.5 text-[#E8341A]">•</span>
              <span>
                <strong>{memberCount} {memberCount === 1 ? 'cliente' : 'clientes'}</strong>{' '}
                no podrán acumular puntos ni canjear recompensas
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-[#E8341A]">•</span>
              <span>
                Las tarjetas de tus <strong>{memberCount} {memberCount === 1 ? 'cliente' : 'clientes'}</strong>{' '}
                quedarán invalidadas
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-[#E8341A]">•</span>
              <span>
                Todos los datos asociados a la tarjeta serán eliminados (lista de clientes, puntos, historial)
              </span>
            </li>
          </ul>

          <p className="mb-1 text-[14px] text-fg">
            ¿Seguro que quieres eliminar la tarjeta{' '}
            <strong>&apos;{cardName}&apos;</strong>?
          </p>
          <p className="mb-6 text-[14px] font-bold text-fg">
            Advertencia final: esta acción no se puede deshacer.
          </p>

          <label htmlFor="delete-card-confirmation" className="mb-2 block text-[13px] font-bold text-muted">
            Para confirmar, escribe{' '}
            <span className="font-mono text-fg">{CONFIRM_PHRASE}</span>
          </label>
          <input
            id="delete-card-confirmation"
            aria-label={`Escribe ${CONFIRM_PHRASE} para confirmar`}
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && confirmed) handleDelete(); }}
            placeholder={CONFIRM_PHRASE}
            autoComplete="off"
            className="w-full rounded-xl border border-border/40 bg-surface-2 px-4 py-2.5 text-[14px] font-medium text-fg placeholder:text-muted/40 focus:border-[#E8341A] focus:outline-none focus:ring-2 focus:ring-[#E8341A]/20"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border/20 px-7 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-border/40 px-5 py-2.5 text-[14px] font-bold text-fg transition-colors hover:bg-[#E1DED5]/60 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!confirmed || isPending}
            className="rounded-xl bg-[#E8341A] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm transition-all hover:bg-[#D02B13] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending ? 'Eliminando...' : 'Sí, eliminar tarjeta'}
          </button>
        </div>
      </div>
    </div>
  );
}
