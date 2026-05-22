'use client';

import { type FormEvent, useState, useTransition } from 'react';
import Link from 'next/link';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';

import { checkInAction, type CheckInResult } from './actions';

interface CheckInFormProps {
  orgSlug: string;
  orgName: string;
  cardName: string;
  pointsPerCheckin: number;
  pointsForReward: number;
  rewardDescription: string;
  primaryColor: string;
}

export function CheckInForm({
  orgSlug,
  orgName,
  cardName,
  pointsPerCheckin,
  pointsForReward,
  rewardDescription,
  primaryColor,
}: CheckInFormProps) {
  const [isPending, startTransition] = useTransition();
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<CheckInResult | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await checkInAction(orgSlug, fd);
      setResult(res);
    });
  };

  const progressPercent = result?.ok
    ? Math.min(100, Math.round((result.newPoints % pointsForReward) / pointsForReward * 100))
    : 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg"
            style={{ background: primaryColor, fontFamily: 'var(--font-display)' }}
          >
            S
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">{cardName}</p>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-fg">{orgName}</h1>
        </div>

        {result?.ok ? (
          /* ── Success state ── */
          <div className="animate-fade-slide-up rounded-[28px] border border-border/40 bg-surface p-8 text-center shadow-sm">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: `${primaryColor}20` }}
            >
              <CheckCircle size={32} style={{ color: primaryColor }} />
            </div>

            <p className="font-display text-3xl font-black text-fg">
              +{result.pointsAdded} punto{result.pointsAdded !== 1 ? 's' : ''}
            </p>
            {result.customerName && (
              <p className="mt-1 text-sm font-medium text-muted">¡Gracias, {result.customerName}!</p>
            )}

            <div className="mt-6 rounded-2xl border border-border/30 bg-surface-2/60 p-5">
              <p className="text-2xl font-black tabular-nums text-fg" style={{ fontFamily: 'var(--font-display)' }}>
                {result.newPoints}
                <span className="ml-1 text-base font-semibold text-muted">/ {pointsForReward} pts</span>
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border/30">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%`, background: primaryColor }}
                />
              </div>
              {result.newPoints >= pointsForReward ? (
                <p className="mt-3 text-sm font-bold" style={{ color: primaryColor }}>
                  🎉 ¡Puedes canjear: {rewardDescription}!
                </p>
              ) : (
                <p className="mt-3 text-xs font-medium text-muted">
                  Te faltan{' '}
                  <span className="font-bold text-fg">
                    {pointsForReward - (result.newPoints % pointsForReward)}
                  </span>{' '}
                  puntos para: <span className="text-fg">{rewardDescription}</span>
                </p>
              )}
            </div>

            <Link
              href={`/${result.membershipSlug}`}
              className="mt-6 flex items-center justify-center gap-2 rounded-[14px] px-5 py-3.5 text-sm font-bold text-white transition-colors"
              style={{ background: primaryColor }}
            >
              Ver mi tarjeta <ArrowRight size={15} />
            </Link>

            <div className="mt-3 flex flex-col gap-2">
              <a
                href={`/api/wallet/google/${result.membershipSlug}`}
                className="flex items-center justify-center gap-2.5 rounded-[14px] border border-border/40 bg-surface px-4 py-3 text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
                  <path d="M17.65 12.2c0-.38-.03-.74-.09-1.09H12v2.06h3.17c-.14.75-.55 1.38-1.17 1.81v1.5h1.89c1.11-1.02 1.76-2.53 1.76-4.28z" fill="#fff"/>
                  <path d="M12 18c1.59 0 2.93-.53 3.9-1.43l-1.89-1.5c-.53.36-1.2.57-2.01.57-1.55 0-2.86-1.04-3.33-2.45H6.7v1.55C7.67 16.98 9.69 18 12 18z" fill="#fff"/>
                  <path d="M8.67 13.19a3.55 3.55 0 010-2.38V9.26H6.7A6.01 6.01 0 006 12c0 .97.23 1.89.7 2.74l1.97-1.55z" fill="#fff"/>
                  <path d="M12 8.57c.87 0 1.65.3 2.26.89l1.69-1.69C14.92 6.79 13.58 6.2 12 6.2c-2.31 0-4.33 1.02-5.3 2.57l1.97 1.55C9.14 9.61 10.45 8.57 12 8.57z" fill="#fff"/>
                </svg>
                Guardar en Google Wallet
              </a>
              <a
                href={`/api/wallet/apple/${result.membershipSlug}`}
                className="flex items-center justify-center gap-2.5 rounded-[14px] border border-border/40 bg-surface px-4 py-3 text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
              >
                <svg width="14" height="17" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-104.9C111.3 740.6 79 672.6 79 607.2c0-131.5 85.9-201.1 170.2-201.1 45.1 0 82.4 30.1 110.3 30.1 26.7 0 68.4-31.8 120.2-31.8 19.3 0 108.1 1.9 163.6 78.4zm-109-166.5c-33.3 40.1-73 68.4-117.2 68.4-4.8 0-9.7-.3-14.6-.9 1-51.1 25.1-101.7 56.6-135.1 33.3-35.7 88.2-63.9 137.4-65.7.9 5.4 1.3 10.8 1.3 16.6 0 47.4-20.4 97.1-63.5 116.7z"/>
                </svg>
                Añadir a Apple Wallet
              </a>
            </div>
          </div>
        ) : (
          /* ── Form state ── */
          <div className="rounded-[28px] border border-border/40 bg-surface p-8 shadow-sm">
            <p className="mb-1 text-sm font-semibold text-muted">
              Suma <span className="font-bold text-fg">{pointsPerCheckin} punto{pointsPerCheckin !== 1 ? 's' : ''}</span> por tu visita
            </p>
            <p className="mb-6 text-xs text-muted">
              A los <span className="font-bold text-fg">{pointsForReward}</span> puntos ganas:{' '}
              <span className="font-medium text-fg">{rewardDescription}</span>
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
                  Tu número de teléfono
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 300 000 0000"
                  required
                  className="w-full rounded-xl border border-border/50 bg-surface-2/60 px-4 py-3 text-[15px] text-fg placeholder:text-muted/50 outline-none transition-all focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/10"
                  style={{ '--accent': primaryColor } as React.CSSProperties}
                />
              </div>

              {result && !result.ok && (
                <div className="flex items-start gap-3 rounded-xl border border-border/30 bg-surface-2/60 p-3">
                  <Clock size={15} className="mt-0.5 shrink-0 text-muted" />
                  <p className="text-sm font-medium text-muted">{result.error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || !phone.trim()}
                className="flex items-center justify-center gap-2 rounded-[14px] py-4 text-[15px] font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: isPending ? '#6B6560' : primaryColor }}
              >
                {isPending ? 'Sumando...' : 'Sumar mi punto'}
                {!isPending && <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted">
          Powered by <span className="font-bold text-fg">Sellio</span>
        </p>
      </div>
    </div>
  );
}
