import Link from 'next/link';
import { Eye, Pencil, Download } from 'lucide-react';

import type { Card } from '@sellio/domain';

import { CardFromDesign } from './card-renderer';

interface CardListItemProps {
  card: Card;
  orgName?: string;
  memberCount?: number;
  totalPoints?: number;
  totalScans?: number;
}

export function CardListItem({ card, orgName, memberCount = 0, totalPoints = 0, totalScans = 0 }: CardListItemProps) {
  const design = (card.design ?? {}) as Record<string, unknown>;
  const primaryColor = typeof design.primaryColor === 'string' ? design.primaryColor : '#E8341A';
  const businessName = typeof design.businessName === 'string' ? design.businessName : orgName;

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-border/40 bg-surface-2/60 p-6 shadow-sm transition-all hover:border-border/60 hover:shadow-md dark:bg-surface-2">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="pr-4">
          <h3 className="line-clamp-2 font-display text-[18px] xl:text-[20px] font-black leading-[1.1] tracking-tight text-fg">
            {card.name}
          </h3>
          {businessName && <p className="mt-1 text-[13px] font-medium text-muted">{businessName}</p>}
        </div>
        {card.active ? (
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#E0F2E9] px-3 py-1 text-[11px] font-bold text-[#10B981] dark:bg-emerald-900/30">
            <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            Activa
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center justify-center rounded-full bg-[#E5E1D8] px-3 py-1 text-[11px] font-bold text-[#8C8983] dark:bg-surface dark:text-muted">
            Inactiva
          </span>
        )}
      </div>

      {/* Card visual */}
      <div className="relative mb-6 flex h-[180px] w-full items-center justify-center">
        <div
          style={{
            transform: 'scale(0.72)',
            transformOrigin: 'center center',
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.12))',
            position: 'absolute',
          }}
          className="transition-transform duration-500 group-hover:scale-[0.74]"
        >
          <CardFromDesign design={design} primaryColor={primaryColor} W={380} H={230} noShadow />
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 flex gap-2">
        <div className="flex flex-1 flex-col items-center justify-center rounded-[16px] bg-[#E1DED5]/60 px-2 py-3 text-center dark:bg-surface">
          <span className="mb-1 text-[12px] text-muted">Clientes</span>
          <span className="font-display text-[28px] font-black tracking-tight text-fg">
            {memberCount}
          </span>
        </div>
        <div className="flex flex-[1.2] flex-col items-center justify-center rounded-[16px] bg-[#E1DED5]/60 px-2 py-3 text-center dark:bg-surface">
          <span className="mb-1 text-[12px] text-muted">Puntos</span>
          <span className="font-display text-[28px] font-black tracking-tight text-fg">
            {totalPoints.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center rounded-[16px] bg-[#E1DED5]/60 px-2 py-3 text-center dark:bg-surface">
          <span className="mb-1 text-[12px] text-muted">Scans</span>
          <span className="font-display text-[28px] font-black tracking-tight text-fg">
            {totalScans}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Link
          href={`/app/cards/${card.id}`}
          className="flex flex-col items-center justify-center gap-0.5 rounded-[12px] bg-[#E8341A] py-2 text-[12px] xl:text-[13px] font-bold leading-none text-white shadow-sm transition-all hover:bg-[#D02B13] hover:shadow-md"
        >
          <div className="flex items-center gap-1">
            <Eye size={13} /> <span>Ver</span>
          </div>
          <span className="mt-0.5">tarjeta</span>
        </Link>
        <Link
          href={`/app/cards/${card.id}/builder`}
          className="flex items-center justify-center gap-1.5 rounded-[12px] border border-border/40 bg-[#E1DED5]/40 py-2 text-[12px] xl:text-[13px] font-bold text-fg transition-all hover:bg-[#E1DED5]/80 dark:bg-surface"
        >
          <Pencil size={13} />
          <span>Editar</span>
        </Link>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-[12px] border border-border/40 bg-[#E1DED5]/40 py-2 text-[11px] xl:text-[12px] font-bold text-fg transition-all hover:bg-[#E1DED5]/80 dark:bg-surface"
        >
          <Download size={13} />
          <span>Descargar QR</span>
        </button>
      </div>
    </div>
  );
}
