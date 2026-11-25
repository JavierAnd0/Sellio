import { createAdminClient } from './admin';
import { notifyAppleWalletPassesUpdated } from './apple-wallet';
import { sendGoogleWalletMessage } from './google-wallet';

/**
 * Campañas → Wallet.
 *
 * El mensaje de la última campaña enviada vive en el pass (campo con
 * `changeMessage`). Al enviar una campaña:
 *   1. Apple: push APNs → el iPhone descarga el pass nuevo → el cambio del
 *      campo dispara la notificación en pantalla.
 *   2. Google: addMessage con TEXT_AND_NOTIFY en cada pass guardado.
 *
 * Todo corre con service role: quien llame debe haber validado que el usuario
 * pertenece a la organización.
 */

export interface CampaignTarget {
  id: string;
  orgId: string;
  /** null = todas las tarjetas de la organización */
  cardId: string | null;
  title: string;
  message: string;
}

/** Slugs de las membresías que reciben una campaña. */
export async function getCampaignAudienceSlugs(orgId: string, cardId: string | null): Promise<string[]> {
  const db = createAdminClient();
  // Siempre filtrar por org: una tarjeta de otra organización nunca entra.
  let cardsQuery = db.from('cards').select('id').eq('org_id', orgId);
  if (cardId) cardsQuery = cardsQuery.eq('id', cardId);
  const { data: cards, error: cardsError } = await cardsQuery;
  if (cardsError) throw new Error(cardsError.message);
  const cardIds = (cards ?? []).map((c) => c.id);
  if (cardIds.length === 0) return [];

  const { data, error } = await db.from('memberships').select('slug, card_id').in('card_id', cardIds);
  if (error) throw new Error(error.message);
  return (data ?? []).map((m) => m.slug).filter((s): s is string => !!s);
}

export interface Reach {
  /** clientes distintos que reciben la campaña */
  customers: number;
  /** tarjetas en Wallet = teléfonos que reciben la notificación */
  wallet: { apple: number; google: number };
}

export interface ReachSummary {
  byCard: Record<string, Reach>;
  /** "Todos los clientes" — clientes deduplicados entre tarjetas */
  all: Reach;
}

const emptyReach = (): Reach => ({ customers: 0, wallet: { apple: 0, google: 0 } });

/**
 * Agrega el alcance. Apple cuenta dispositivos con push token (cada uno recibe
 * la notificación); Google cuenta passes guardados (uno por membresía).
 */
export function aggregateReach(
  cardIds: string[],
  memberships: Array<{ slug: string; card_id: string; customer_id: string }>,
  registrations: Array<{ membership_slug: string; platform: 'apple' | 'google' }>,
): ReachSummary {
  const byCard: Record<string, Reach> = Object.fromEntries(cardIds.map((id) => [id, emptyReach()]));
  const all = emptyReach();
  const customersByCard = new Map<string, Set<string>>();
  const allCustomers = new Set<string>();
  const cardBySlug = new Map<string, string>();

  for (const m of memberships) {
    if (!byCard[m.card_id]) continue;
    cardBySlug.set(m.slug, m.card_id);
    const set = customersByCard.get(m.card_id) ?? new Set<string>();
    set.add(m.customer_id);
    customersByCard.set(m.card_id, set);
    allCustomers.add(m.customer_id);
  }
  for (const [cardId, set] of customersByCard) byCard[cardId]!.customers = set.size;
  all.customers = allCustomers.size;

  const googleSeen = new Set<string>();
  for (const r of registrations) {
    const cardId = cardBySlug.get(r.membership_slug);
    if (!cardId) continue;
    if (r.platform === 'google') {
      if (googleSeen.has(r.membership_slug)) continue;
      googleSeen.add(r.membership_slug);
    }
    byCard[cardId]!.wallet[r.platform]++;
    all.wallet[r.platform]++;
  }
  return { byCard, all };
}

async function fetchRegistrations(slugs: string[]) {
  const db = createAdminClient();
  const out: Array<{ membership_slug: string; platform: 'apple' | 'google'; push_token: string | null }> = [];
  for (let i = 0; i < slugs.length; i += 200) {
    const { data, error } = await db
      .from('wallet_registrations')
      .select('membership_slug, platform, push_token')
      .in('membership_slug', slugs.slice(i, i + 200));
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
  }
  // Apple solo cuenta si puede recibir push.
  return out.filter((r) => r.platform === 'google' || !!r.push_token);
}

/** Alcance por tarjeta y total, para mostrar antes de enviar. */
export async function getWalletReach(orgId: string): Promise<ReachSummary> {
  const db = createAdminClient();
  const { data: cards } = await db.from('cards').select('id').eq('org_id', orgId);
  const cardIds = (cards ?? []).map((c) => c.id);
  if (cardIds.length === 0) return aggregateReach([], [], []);

  const { data: memberships } = await db
    .from('memberships')
    .select('slug, card_id, customer_id')
    .in('card_id', cardIds);
  const rows = memberships ?? [];
  const registrations = await fetchRegistrations(rows.map((m) => m.slug));
  return aggregateReach(cardIds, rows, registrations);
}

export type WalletDeliveryStatus = 'ok' | 'failed' | 'skipped';

/**
 * Entrega la campaña. El push de Apple se espera (una sola conexión HTTP/2)
 * para devolver el número real; Google se puede dejar en segundo plano con
 * `googleDelivery`. Google solo se intenta en passes que se guardaron.
 */
export async function deliverCampaignToWallets(campaign: CampaignTarget): Promise<{
  apple: number;
  google: number;
  status: WalletDeliveryStatus;
  googleDelivery: Promise<number>;
}> {
  const slugs = await getCampaignAudienceSlugs(campaign.orgId, campaign.cardId);
  const registrations = await fetchRegistrations(slugs);
  const googleSlugs = [...new Set(registrations.filter((r) => r.platform === 'google').map((r) => r.membership_slug))];
  const hasApple = registrations.some((r) => r.platform === 'apple');

  let apple = 0;
  let appleFailed = false;
  if (hasApple) {
    const result = await notifyAppleWalletPassesUpdated(slugs);
    apple = result?.delivered ?? 0;
    // Configurado pero nadie recibió: lo tratamos como fallo para avisar.
    appleFailed = result === null || (result.delivered === 0 && result.failed > 0);
  }

  const googleDelivery = sendGoogleWalletMessage(googleSlugs, {
    id: `campaign_${campaign.id}`,
    header: campaign.title,
    body: campaign.message,
  });

  const status: WalletDeliveryStatus =
    !hasApple && googleSlugs.length === 0 ? 'skipped' : appleFailed ? 'failed' : 'ok';

  return { apple, google: googleSlugs.length, status, googleDelivery };
}

export interface CampaignMessage {
  title: string;
  message: string;
  sentAt: string;
}

/** Última campaña enviada que aplica a una tarjeta (propia o de toda la org). */
export async function getLatestCampaignForCard(orgId: string, cardId: string): Promise<CampaignMessage | null> {
  const db = createAdminClient();
  const { data } = await db
    .from('campaigns')
    .select('title, message, sent_at')
    .eq('org_id', orgId)
    .eq('status', 'sent')
    .or(`card_id.is.null,card_id.eq.${cardId}`)
    .order('sent_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.sent_at) return null;
  return { title: data.title, message: data.message, sentAt: data.sent_at };
}

/**
 * Momento en que el pass cambió por última vez: actividad de puntos o la
 * última campaña que le aplica. Apple lo usa para decidir qué descargar.
 */
export function passUpdatedAt(
  membership: { last_activity_at: string | null; card_id: string; org_id: string },
  campaigns: Array<{ org_id: string; card_id: string | null; sent_at: string }>,
): string | null {
  let latest = membership.last_activity_at;
  for (const c of campaigns) {
    if (c.org_id !== membership.org_id) continue;
    if (c.card_id !== null && c.card_id !== membership.card_id) continue;
    if (!latest || new Date(c.sent_at) > new Date(latest)) latest = c.sent_at;
  }
  return latest;
}
