'use client';

import type { Customer } from '@sellio/domain';

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
}

export function CustomerTable({ customers }: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="rounded-xl border border-border/20 bg-surface p-8 text-center">
        <p className="text-sm text-muted">No hay clientes en esta tarjeta todavía.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/20">
      <table className="w-full text-sm">
        <thead className="border-b border-border/20 bg-surface-2">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
              Cliente
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
              Teléfono
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
              Puntos
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
              Miembro desde
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/10 bg-surface">
          {customers.map((c) => (
            <tr key={c.id} className="transition-colors hover:bg-surface-2">
              <td className="px-4 py-3">
                <span className="font-medium text-fg">{c.name ?? '—'}</span>
              </td>
              <td className="px-4 py-3 text-muted">{c.phone}</td>
              <td className="px-4 py-3 text-right font-semibold text-fg">
                {c.membership.points}
              </td>
              <td className="px-4 py-3 text-right text-muted">
                {c.membership.joinedAt.toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
