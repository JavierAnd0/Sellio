'use client';

import { useState, useMemo, useTransition } from 'react';
import { ArrowRight, Plus, Users } from 'lucide-react';
import type { Customer } from '@sellio/domain';
import type { OrgPlan } from '@sellio/db';

import { addPointsAction } from '@/actions/cards/customer.actions';

interface CustomerWithMembership extends Customer {
  membership: {
    id: string;
    slug: string;
    points: number;
    joinedAt: Date;
    lastActivityAt: Date | null;
  };
}

interface CustomerTableProps {
  customers: CustomerWithMembership[];
  maxCustomers?: number | null;
  plan?: OrgPlan;
  pointsPerCheckin?: number;
}

/** Returns a human-readable relative date string in Spanish */
function relativeDate(date: Date | null): string {
  if (!date) return '—';
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes} min`;

  // Same day: show hour
  const today = new Date();
  const d = new Date(date);
  if (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  ) {
    return `Hoy, ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return `Ayer, ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  }

  if (days < 7) return `Hace ${days} día${days !== 1 ? 's' : ''}`;
  if (days < 14) return 'Hace 1 semana';
  if (days < 21) return 'Hace 2 semanas';
  if (days < 30) return 'Hace 3 semanas';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Customer is considered "active" if they had activity in the last 30 days */
function isActive(lastActivity: Date | null, joinedAt: Date): boolean {
  const ref = lastActivity ?? joinedAt;
  const days = (Date.now() - ref.getTime()) / 86_400_000;
  return days <= 30;
}

function AddPointsButton({ membershipId, pointsPerCheckin, onSuccess }: { membershipId: string; pointsPerCheckin: number; onSuccess: (newPoints: number) => void }) {
  const [isPending, startTransition] = useTransition();
  const [flash, setFlash] = useState(false);

  const handleClick = () => {
    startTransition(async () => {
      const result = await addPointsAction(membershipId, pointsPerCheckin);
      if (result.ok) {
        onSuccess(result.newPoints);
        setFlash(true);
        setTimeout(() => setFlash(false), 800);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title={`Sumar ${pointsPerCheckin} punto${pointsPerCheckin !== 1 ? 's' : ''}`}
      className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${
        flash
          ? 'border-[#E8341A]/60 bg-[#E8341A]/15 text-[#E8341A]'
          : 'border-border/40 bg-surface-2/60 text-muted hover:border-[#E8341A]/40 hover:bg-[#E8341A]/8 hover:text-[#E8341A]'
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <Plus size={13} strokeWidth={2.5} />
    </button>
  );
}

export function CustomerTable({ customers, maxCustomers, plan = 'free', pointsPerCheckin = 1 }: CustomerTableProps) {
  const [search, setSearch] = useState('');
  const [pointsOverride, setPointsOverride] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email?.toLowerCase().includes(q),
    );
  }, [customers, search]);

  const total = customers.length;
  const progressPercent = maxCustomers ? Math.min(100, (total / maxCustomers) * 100) : 0;
  const isElite = plan === 'elite';

  if (customers.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-border/60 bg-surface p-12 text-center flex flex-col items-center justify-center shadow-sm">
        <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center mb-5 border border-border/40 shadow-inner">
          <Users size={28} className="text-muted/60" />
        </div>
        <h3 className="font-display text-2xl font-extrabold text-fg mb-3 tracking-tight">
          No hay clientes aún
        </h3>
        <p className="text-muted max-w-sm font-medium leading-relaxed">
          Comparte el código QR de tu tarjeta para que tus clientes comiencen a registrarse.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Plan usage bar */}
      {!isElite && maxCustomers && (
        <div className="rounded-[18px] border border-border/40 bg-surface px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[13px] font-semibold text-muted">Clientes en tu plan</span>
            <span className="text-[13px] font-bold text-fg tabular-nums">
              {total} / {maxCustomers}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-border/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#E8341A] transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {progressPercent >= 80 && (
            <p className="mt-2 text-[12px] text-muted font-medium">
              Al llegar a {maxCustomers}, upgrada a{' '}
              {plan === 'free' ? 'Basic' : 'Elite'} para continuar creciendo.
            </p>
          )}
        </div>
      )}

      {/* Table card */}
      <div className="overflow-hidden rounded-[24px] border border-border/60 bg-surface shadow-sm">
        {/* Search */}
        <div className="px-5 py-4 border-b border-border/30">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full rounded-xl border border-border/50 bg-surface-2/60 px-4 py-2.5 text-sm text-fg placeholder:text-muted/60 outline-none focus:border-[#E8341A]/50 focus:ring-2 focus:ring-[#E8341A]/10 transition-all"
          />
        </div>

        <table className="w-full text-sm">
          <thead className="border-b border-border/40 bg-surface-2/50">
            <tr>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
                Cliente
              </th>
              <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
                Puntos
              </th>
              <th className="hidden sm:table-cell px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
                Visitas
              </th>
              <th className="hidden md:table-cell px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
                Última visita
              </th>
              <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
                Estado
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20 bg-surface">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted text-sm font-medium">
                  Sin resultados para &quot;{search}&quot;
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const initial = c.name ? c.name.charAt(0).toUpperCase() : '?';
                const active = isActive(c.membership.lastActivityAt, c.membership.joinedAt);
                const lastVisit = relativeDate(c.membership.lastActivityAt ?? c.membership.joinedAt);

                return (
                  <tr key={c.id} className="group transition-colors hover:bg-surface-2/60 cursor-pointer">
                    {/* Avatar + name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-2 border border-border/40 flex items-center justify-center text-xs font-bold text-fg group-hover:border-[#E8341A]/30 group-hover:text-[#E8341A] transition-colors shadow-sm shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-fg text-[14px] leading-tight truncate">
                            {c.name ?? 'Sin nombre'}
                          </p>
                          {c.email && (
                            <p className="text-[12px] text-muted truncate">{c.email}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Points */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-[#E8341A] text-[15px] tabular-nums">
                          {(pointsOverride[c.membership.id] ?? c.membership.points).toLocaleString('es-CO')}
                        </span>
                        <AddPointsButton
                          membershipId={c.membership.id}
                          pointsPerCheckin={pointsPerCheckin}
                          onSuccess={(newPoints) => setPointsOverride((prev) => ({ ...prev, [c.membership.id]: newPoints }))}
                        />
                      </div>
                    </td>

                    {/* Visits (points used as proxy — real visit count would need a separate field) */}
                    <td className="hidden sm:table-cell px-6 py-4 text-right text-muted font-semibold text-[14px] tabular-nums">
                      —
                    </td>

                    {/* Last visit */}
                    <td className="hidden md:table-cell px-6 py-4 text-right text-muted font-medium text-[13px]">
                      {lastVisit}
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={
                          active
                            ? 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                            : 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-border/30 text-muted border border-border/40'
                        }
                      >
                        {active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Arrow */}
                    <td className="pr-4 py-4">
                      <ArrowRight
                        size={15}
                        className="text-muted/40 group-hover:text-[#E8341A] transition-colors"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
