'use client';

import { useEffect, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

import { NotificationPreview } from './notification-preview';
import { btnPrimary, btnSecondary, n, phonesOf, plural, walletBreakdown, type Reach } from './campaign-ui';

/**
 * Confirmación antes de un envío irreversible. Lo último que ve el comercio
 * es exactamente lo que verá su cliente, y a cuántos teléfonos llegará.
 */
export function SendReview({
  orgName,
  title,
  message,
  audienceLabel,
  reach,
  pending,
  error,
  onBack,
  onConfirm,
}: {
  orgName: string;
  title: string;
  message: string;
  audienceLabel: string;
  reach: Reach;
  pending: boolean;
  error: string | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const phones = phonesOf(reach);

  // Llevar el foco al panel al abrirlo (si no, cae a <body>).
  useEffect(() => headingRef.current?.focus(), []);

  // Esc vuelve a editar (salvo mientras se envía).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pending) onBack();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pending, onBack]);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_260px] md:items-start">
      <div className="order-2 md:order-1">
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-xl font-extrabold tracking-tight text-fg focus:outline-none"
        >
          Revisa antes de enviar
        </h3>

        {phones > 0 ? (
          <p className="mt-3 text-base text-fg">
            Llegará a <strong className="font-bold">{plural(phones, 'teléfono', 'teléfonos')}</strong> con la
            tarjeta en su Wallet.
          </p>
        ) : (
          <p className="mt-3 text-base text-fg">
            Nadie tiene aún esta tarjeta en su Wallet, así que <strong className="font-bold">nadie recibirá
            notificación</strong>. El mensaje quedará en las tarjetas que agreguen a Apple Wallet después.
          </p>
        )}
        <p className="mt-1 text-sm text-muted">
          {phones > 0 && <>{walletBreakdown(reach.wallet.apple, reach.wallet.google)} · </>}
          {audienceLabel}: {plural(reach.customers, 'cliente', 'clientes')}
          {phones > 0 && reach.customers > phones && <> (los demás no la han agregado a su Wallet)</>}
        </p>

        <p className="mt-4 text-sm font-semibold text-fg">No se puede deshacer.</p>

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-400">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <button type="button" onClick={onBack} disabled={pending} className={btnSecondary}>
            <ArrowLeft size={15} />
            Volver a editar
          </button>
          <button type="button" onClick={onConfirm} disabled={pending} className={phones > 0 ? btnPrimary : btnSecondary}>
            <Send size={15} />
            {pending
              ? 'Enviando…'
              : phones > 0
                ? `Sí, enviar a ${n(phones)} ${phones === 1 ? 'teléfono' : 'teléfonos'}`
                : 'Enviar de todas formas'}
          </button>
        </div>
      </div>

      <div className="order-1 mx-auto w-full max-w-[280px] md:order-2">
        <NotificationPreview orgName={orgName} title={title} message={message} size="full" />
      </div>
    </div>
  );
}
