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
      <div className="rounded-[24px] border border-dashed border-border/60 bg-surface p-12 text-center flex flex-col items-center justify-center shadow-sm">
        <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center mb-5 border border-border/40 shadow-inner">
           <span className="text-3xl drop-shadow-sm">👥</span>
        </div>
        <h3 className="font-display text-2xl font-extrabold text-fg mb-3 tracking-tight">No hay clientes aún</h3>
        <p className="text-muted max-w-sm font-medium leading-relaxed">
          Comparte el código QR de tu tarjeta para que tus clientes comiencen a registrarse, o agrega uno manualmente.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-border/60 bg-surface shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-border/40 bg-surface-2/50 backdrop-blur-sm">
          <tr>
            <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
              Cliente
            </th>
            <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
              Teléfono
            </th>
            <th className="px-6 py-5 text-right text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
              Puntos
            </th>
            <th className="px-6 py-5 text-right text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
              Miembro desde
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20 bg-surface">
          {customers.map((c) => {
            const initial = c.name ? c.name.charAt(0).toUpperCase() : '?';
            return (
              <tr key={c.id} className="transition-colors hover:bg-surface-2 group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-2 border border-border/40 flex items-center justify-center text-xs font-bold text-fg group-hover:border-coral/40 group-hover:text-[#E8341A] transition-colors shadow-sm">
                      {initial}
                    </div>
                    <span className="font-semibold text-fg tracking-wide text-[15px]">{c.name ?? 'Sin nombre'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted font-medium font-mono text-xs">{c.phone}</td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-1.5 bg-coral/10 text-[#E8341A] px-2.5 py-1 rounded-md font-bold text-xs border border-coral/20">
                    {c.membership.points} <span className="text-[10px] uppercase opacity-70">pts</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-muted font-medium text-[13px]">
                  {c.membership.joinedAt.toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
