'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { z } from 'zod';

import { createClient } from '@sellio/db/server';
import { SupabaseOrganizationRepository } from '@sellio/db/repositories';
import { deliverCampaignToWallets, type WalletDeliveryStatus } from '@sellio/db/wallet-campaigns';

const TITLE_MAX = 60;
const MESSAGE_MAX = 200;

const campaignSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Escribe un título.')
    .max(TITLE_MAX, `El título debe tener máximo ${TITLE_MAX} caracteres.`),
  message: z
    .string()
    .trim()
    .min(1, 'Escribe el mensaje que recibirán tus clientes.')
    .max(MESSAGE_MAX, `El mensaje debe tener máximo ${MESSAGE_MAX} caracteres.`),
  card_id: z.string().uuid().optional().or(z.literal('')),
});

export type CampaignActionResult =
  | { ok: true }
  | { ok: false; error: string; field?: string };

export type SendCampaignResult =
  | { ok: true; campaignId: string; apple: number; google: number; status: WalletDeliveryStatus }
  | { ok: false; error: string; field?: string };

const CAMPAIGN_PLANS = new Set(['elite', 'enterprise']);

type Db = Awaited<ReturnType<typeof createClient>>;

/** Auth + organización + plan. Común a todas las acciones de campañas. */
async function resolveOrgForCampaigns(): Promise<
  { ok: true; db: Db; orgId: string } | { ok: false; error: string }
> {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) return { ok: false, error: 'Organización no encontrada.' };
  if (!CAMPAIGN_PLANS.has(org.plan)) {
    return { ok: false, error: 'Las campañas están disponibles en los planes Elite y Enterprise.' };
  }
  return { ok: true, db, orgId: org.id };
}

function parseCampaign(formData: FormData) {
  const parsed = campaignSchema.safeParse({
    title: formData.get('title'),
    message: formData.get('message'),
    card_id: formData.get('card_id') || '',
  });
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return {
      ok: false as const,
      error: first?.message ?? 'Datos inválidos',
      field: String(first?.path[0] ?? ''),
    };
  }
  return { ok: true as const, data: { ...parsed.data, card_id: parsed.data.card_id || null } };
}

/** La tarjeta elegida debe ser de la organización (nunca de otra). */
async function cardBelongsToOrg(db: Db, cardId: string | null, orgId: string): Promise<boolean> {
  if (!cardId) return true;
  const { data } = await db.from('cards').select('id').eq('id', cardId).eq('org_id', orgId).maybeSingle();
  return !!data;
}

/**
 * Entrega a los wallets y guarda el resultado en la campaña. Nunca lanza: la
 * campaña ya está enviada (el mensaje vive en los passes) aunque falle el push.
 */
async function deliverAndRecord(
  db: Db,
  campaign: { id: string; org_id: string; card_id: string | null; title: string; message: string },
): Promise<{ apple: number; google: number; status: WalletDeliveryStatus }> {
  let outcome: { apple: number; google: number; status: WalletDeliveryStatus } = {
    apple: 0,
    google: 0,
    status: 'failed',
  };
  try {
    const delivery = await deliverCampaignToWallets({
      id: campaign.id,
      orgId: campaign.org_id,
      cardId: campaign.card_id,
      title: campaign.title,
      message: campaign.message,
    });
    outcome = { apple: delivery.apple, google: delivery.google, status: delivery.status };
    after(() =>
      delivery.googleDelivery.catch((err) => {
        console.warn('[campaigns] Google Wallet delivery failed', { campaignId: campaign.id, err });
      }),
    );
  } catch (err) {
    console.warn('[campaigns] Wallet delivery failed', { campaignId: campaign.id, err });
  }

  await db
    .from('campaigns')
    .update({ wallet_devices: outcome.apple, wallet_google: outcome.google, wallet_delivery: outcome.status })
    .eq('id', campaign.id);

  return outcome;
}

export async function createCampaignAction(formData: FormData): Promise<CampaignActionResult> {
  const parsed = parseCampaign(formData);
  if (!parsed.ok) return parsed;

  const ctx = await resolveOrgForCampaigns();
  if (!ctx.ok) return ctx;

  if (!(await cardBelongsToOrg(ctx.db, parsed.data.card_id, ctx.orgId))) {
    return { ok: false, error: 'Tarjeta no encontrada.', field: 'card_id' };
  }

  const { error } = await ctx.db.from('campaigns').insert({
    org_id: ctx.orgId,
    title: parsed.data.title,
    message: parsed.data.message,
    card_id: parsed.data.card_id,
    status: 'draft',
  });
  if (error) return { ok: false, error: 'No pudimos guardar el borrador. Intenta de nuevo.' };

  revalidatePath('/app/campaigns');
  return { ok: true };
}

export async function updateCampaignAction(
  campaignId: string,
  formData: FormData,
): Promise<CampaignActionResult> {
  const parsed = parseCampaign(formData);
  if (!parsed.ok) return parsed;

  const ctx = await resolveOrgForCampaigns();
  if (!ctx.ok) return ctx;

  if (!(await cardBelongsToOrg(ctx.db, parsed.data.card_id, ctx.orgId))) {
    return { ok: false, error: 'Tarjeta no encontrada.', field: 'card_id' };
  }

  const { data, error } = await ctx.db
    .from('campaigns')
    .update({ title: parsed.data.title, message: parsed.data.message, card_id: parsed.data.card_id })
    .eq('id', campaignId)
    .eq('org_id', ctx.orgId)
    .eq('status', 'draft')
    .select('id')
    .maybeSingle();

  if (error) return { ok: false, error: 'No pudimos guardar los cambios. Intenta de nuevo.' };
  if (!data) return { ok: false, error: 'Este borrador ya no existe o ya fue enviado.' };

  revalidatePath('/app/campaigns');
  return { ok: true };
}

/** Crear y enviar en un paso ("Revisar y enviar" desde el formulario). */
export async function sendNewCampaignAction(formData: FormData): Promise<SendCampaignResult> {
  const parsed = parseCampaign(formData);
  if (!parsed.ok) return parsed;

  const ctx = await resolveOrgForCampaigns();
  if (!ctx.ok) return ctx;

  if (!(await cardBelongsToOrg(ctx.db, parsed.data.card_id, ctx.orgId))) {
    return { ok: false, error: 'Tarjeta no encontrada.', field: 'card_id' };
  }

  const { data: campaign, error } = await ctx.db
    .from('campaigns')
    .insert({
      org_id: ctx.orgId,
      title: parsed.data.title,
      message: parsed.data.message,
      card_id: parsed.data.card_id,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .select('id, org_id, card_id, title, message')
    .single();

  if (error || !campaign) return { ok: false, error: 'No pudimos enviar la campaña. Intenta de nuevo.' };

  const outcome = await deliverAndRecord(ctx.db, campaign);
  revalidatePath('/app/campaigns');
  return { ok: true, campaignId: campaign.id, ...outcome };
}

export async function sendCampaignAction(campaignId: string): Promise<SendCampaignResult> {
  const ctx = await resolveOrgForCampaigns();
  if (!ctx.ok) return ctx;

  // Marcar como enviada de forma atómica: el filtro por status evita que dos
  // clics (o dos pestañas) disparen la notificación dos veces.
  const { data: campaign, error } = await ctx.db
    .from('campaigns')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', campaignId)
    .eq('org_id', ctx.orgId)
    .eq('status', 'draft')
    .select('id, org_id, card_id, title, message')
    .maybeSingle();

  if (error) return { ok: false, error: 'No pudimos enviar la campaña. Intenta de nuevo.' };
  if (!campaign) return { ok: false, error: 'Esta campaña ya fue enviada o ya no existe.' };

  const outcome = await deliverAndRecord(ctx.db, campaign);
  revalidatePath('/app/campaigns');
  return { ok: true, campaignId: campaign.id, ...outcome };
}

export async function deleteCampaignAction(campaignId: string): Promise<CampaignActionResult> {
  const ctx = await resolveOrgForCampaigns();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.db
    .from('campaigns')
    .delete()
    .eq('id', campaignId)
    .eq('org_id', ctx.orgId)
    .eq('status', 'draft') // solo se pueden borrar borradores
    .select('id');

  if (error) return { ok: false, error: 'No pudimos eliminar el borrador.' };
  if (!data || data.length === 0) return { ok: false, error: 'Este borrador ya no existe o ya fue enviado.' };

  revalidatePath('/app/campaigns');
  return { ok: true };
}
