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
