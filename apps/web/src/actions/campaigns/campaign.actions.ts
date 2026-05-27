'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@sellio/db/server';
import { SupabaseOrganizationRepository } from '@sellio/db/repositories';

const campaignSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(100),
  message: z.string().min(1, 'El mensaje es obligatorio').max(500),
  card_id: z.string().uuid().optional().or(z.literal('')),
});

export type CampaignActionResult =
  | { ok: true }
  | { ok: false; error: string; field?: string };

export async function createCampaignAction(
  formData: FormData,
): Promise<CampaignActionResult> {
  const parsed = campaignSchema.safeParse({
    title: formData.get('title'),
    message: formData.get('message'),
    card_id: formData.get('card_id') || '',
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, error: first?.message ?? 'Datos inválidos', field: String(first?.path[0] ?? '') };
  }

  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) return { ok: false, error: 'Organización no encontrada.' };

  const { error } = await db.from('campaigns').insert({
    org_id: org.id,
    title: parsed.data.title,
    message: parsed.data.message,
    card_id: parsed.data.card_id || null,
    status: 'draft',
  });

  if (error) return { ok: false, error: 'Error al crear la campaña.' };

  revalidatePath('/app/campaigns');
  return { ok: true };
}

export async function sendCampaignAction(
  campaignId: string,
): Promise<CampaignActionResult> {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) return { ok: false, error: 'Organización no encontrada.' };

  const { data: campaign } = await db
    .from('campaigns')
    .select('id, org_id, status, card_id, title, message')
    .eq('id', campaignId)
    .eq('org_id', org.id)
    .maybeSingle();

  if (!campaign) return { ok: false, error: 'Campaña no encontrada.' };
  if (campaign.status === 'sent') return { ok: false, error: 'Esta campaña ya fue enviada.' };

  // Mark as sent
  // TODO: trigger actual email/SMS delivery via Resend or similar when credentials are configured
  const { error } = await db
    .from('campaigns')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', campaignId);

  if (error) return { ok: false, error: 'Error al marcar la campaña como enviada.' };

  revalidatePath('/app/campaigns');
  return { ok: true };
}

export async function deleteCampaignAction(
  campaignId: string,
): Promise<CampaignActionResult> {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) return { ok: false, error: 'Organización no encontrada.' };

  const { error } = await db
    .from('campaigns')
    .delete()
    .eq('id', campaignId)
    .eq('org_id', org.id)
    .eq('status', 'draft'); // solo se pueden borrar drafts

  if (error) return { ok: false, error: 'Error al eliminar la campaña.' };

  revalidatePath('/app/campaigns');
  return { ok: true };
}
