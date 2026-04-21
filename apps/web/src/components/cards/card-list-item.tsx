import Link from 'next/link';

import type { Card } from '@sellio/domain';

interface CardListItemProps {
  card: Card;
  memberCount?: number;
}

export function CardListItem({ card, memberCount }: CardListItemProps) {
  const primaryColor =
    typeof card.design === 'object' &&
    card.design !== null &&
    'primaryColor' in card.design &&
    typeof card.design.primaryColor === 'string'
      ? card.design.primaryColor
      : '#E8341A';

  return (
    <Link
      href={`/app/cards/${card.id}`}
      className="group relative overflow-hidden rounded-2xl border border-border/20 bg-surface transition-all hover:border-border hover:shadow-md"
    >
      {/* Color strip */}
      <div
        className="h-2 w-full"
        style={{ background: primaryColor }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-bold text-fg">{card.name}</h3>
            <p className="mt-0.5 truncate text-sm text-muted">{card.rewardDescription}</p>
          </div>
          {card.active ? (
            <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
              Activa
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-muted/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
              Inactiva
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted">
          <span>
            <span className="font-semibold text-fg">{card.pointsForReward}</span> pts para recompensa
          </span>
          {memberCount !== undefined && (
            <span>
              <span className="font-semibold text-fg">{memberCount}</span> miembros
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
