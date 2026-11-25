// Tipos y helpers de UI de Campañas. Sin imports de servidor: esto llega al cliente.

export type WalletDelivery = 'pending' | 'ok' | 'failed' | 'skipped';

export interface Campaign {
  id: string;
  title: string;
  message: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  card_id: string | null;
  wallet_devices: number;
  wallet_google: number;
  wallet_delivery: WalletDelivery;
  cardName: string | null;
}

export interface CardOption {
  id: string;
  name: string;
}

/** Espejo de `Reach` en @sellio/db/wallet-campaigns. */
export interface Reach {
  customers: number;
  wallet: { apple: number; google: number };
}

export interface ReachSummary {
  byCard: Record<string, Reach>;
  all: Reach;
}

export const TITLE_MAX = 60;
export const MESSAGE_MAX = 200;

const EMPTY: Reach = { customers: 0, wallet: { apple: 0, google: 0 } };

export function reachFor(cardId: string | null, reach: ReachSummary): Reach {
  return cardId ? (reach.byCard[cardId] ?? EMPTY) : reach.all;
}

/** La unidad única de la página: teléfonos con la tarjeta en su Wallet. */
export const phonesOf = (r: Reach) => r.wallet.apple + r.wallet.google;

export const n = (value: number) => value.toLocaleString('es-CO');
export const plural = (value: number, one: string, many: string) => `${n(value)} ${value === 1 ? one : many}`;

export function walletBreakdown(apple: number, google: number): string {
  return `${n(apple)} iPhone · ${n(google)} Android`;
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Clases compartidas (paleta Sellio) ─────────────────────────────────────

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8341A]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg';

export const btnPrimary = `inline-flex shrink-0 items-center justify-center whitespace-nowrap gap-2 rounded-xl bg-[#E8341A] px-5 min-h-11 md:min-h-10 text-sm font-bold text-white transition-colors hover:bg-[#D02B13] disabled:opacity-50 disabled:pointer-events-none ${focusRing}`;

export const btnSecondary = `inline-flex shrink-0 items-center justify-center whitespace-nowrap gap-2 rounded-xl border border-border/15 px-4 min-h-11 md:min-h-10 text-sm font-semibold text-fg transition-colors hover:border-border/30 hover:bg-surface-2 disabled:opacity-50 ${focusRing}`;

export const btnGhost = `inline-flex shrink-0 items-center justify-center whitespace-nowrap gap-1.5 rounded-xl px-3 min-h-11 md:min-h-9 text-sm font-medium text-muted transition-colors hover:text-fg hover:bg-surface-2 disabled:opacity-50 ${focusRing}`;

export const fieldLabel = 'block text-xs font-bold uppercase tracking-widest text-muted';

export const fieldInput =
  'w-full rounded-[10px] border border-border/15 bg-surface-2 px-4 py-2.5 text-base md:text-sm text-fg placeholder:text-muted transition-colors focus:outline-none focus:border-[#E8341A]/60 focus:ring-2 focus:ring-[#E8341A]/30';
