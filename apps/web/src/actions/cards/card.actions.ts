'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@sellio/db/server';
import { SupabaseCardRepository, SupabaseOrganizationRepository, SupabaseMembershipRepository } from '@sellio/db/repositories';
import { isTrialExpired } from '@/lib/trial';

const cardSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(60, 'Máximo 60 caracteres'),
  description: z.string().max(200).optional(),
  pointsPerCheckin: z.coerce
    .number()
    .int()
    .min(1, 'Mínimo 1 punto por visita'),
  pointsForReward: z.coerce
    .number()
    .int()
    .min(1, 'Mínimo 1 punto para recompensa'),
  rewardDescription: z.string().min(1, 'La descripción de la recompensa es obligatoria'),
  maxMembers: z
    .string()
    .optional()
    .transform((val) => (val && val !== '' ? parseInt(val, 10) : null))
    .pipe(z.number().int().positive().nullable()),
  design: z.string().optional(),
});

function parseDesign(raw: string | undefined): Record<string, unknown> {
  if (!raw) return {};
  try { return JSON.parse(raw) as Record<string, unknown>; } catch { return {}; }
}

export type CardActionResult =
  | { ok: true }
  | { ok: false; error: string; field?: string };

export type CreateCardResult =
  | { ok: true; cardId: string }
  | { ok: false; error: string; field?: string };

export async function createCardAction(formData: FormData): Promise<CreateCardResult> {
  const parsed = cardSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    pointsPerCheckin: formData.get('pointsPerCheckin'),
    pointsForReward: formData.get('pointsForReward'),
    rewardDescription: formData.get('rewardDescription'),
    maxMembers: formData.get('maxMembers') || undefined,
    design: formData.get('design') || undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, error: first?.message ?? 'Datos inválidos', field: String(first?.path[0] ?? '') };
  }

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) return { ok: false, error: 'Organización no encontrada.' };

  if (isTrialExpired(org)) {
    return { ok: false, error: 'Tu prueba gratuita ha expirado. Actualiza tu plan para crear tarjetas.' };
  }

  // Enforce card limits based on organization plan
  if (org.plan === 'free' || org.plan === 'basic') {
    const cards = await new SupabaseCardRepository().findByOrg(org.id);
    const limit = org.plan === 'free' ? 1 : 3;
    if (cards.length >= limit) {
      return {
        ok: false,
        error: `Has alcanzado el límite de ${limit} ${limit === 1 ? 'tarjeta' : 'tarjetas'} en el plan ${org.plan === 'free' ? 'Gratuito' : 'Basic'}. Por favor, actualiza tu plan en Facturación.`,
      };
    }
  }

  const { name, description, pointsPerCheckin, pointsForReward, rewardDescription, maxMembers, design } =
    parsed.data;

  try {
    const card = await new SupabaseCardRepository().create({
      orgId: org.id,
      name,
      description: description ?? null,
      pointsPerCheckin,
      pointsForReward,
      rewardDescription,
      maxMembers: maxMembers ?? null,
      design: { primaryColor: org.primaryColor, ...parseDesign(design) },
    });
    return { ok: true, cardId: card.id };
  } catch {
    return { ok: false, error: 'Error al crear la tarjeta. Intenta de nuevo.' };
  }
}

export async function updateCardAction(
  id: string,
  formData: FormData,
): Promise<CardActionResult> {
  const parsed = cardSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    pointsPerCheckin: formData.get('pointsPerCheckin'),
    pointsForReward: formData.get('pointsForReward'),
    rewardDescription: formData.get('rewardDescription'),
    maxMembers: formData.get('maxMembers') || undefined,
    design: formData.get('design') || undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return {
      ok: false,
      error: first?.message ?? 'Datos inválidos',
      field: String(first?.path[0] ?? ''),
    };
  }

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) return { ok: false, error: 'Sesión expirada. Vuelve a iniciar sesión.' };

  const cardRepo = new SupabaseCardRepository();
  const card = await cardRepo.findById(id);

  if (!card) return { ok: false, error: 'Tarjeta no encontrada.' };

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org || card.orgId !== org.id) return { ok: false, error: 'Sin permisos.' };

  if (isTrialExpired(org)) {
    return { ok: false, error: 'Tu prueba gratuita ha expirado. Actualiza tu plan para editar tarjetas.' };
  }

  const { name, description, pointsPerCheckin, pointsForReward, rewardDescription, maxMembers, design } =
    parsed.data;

  // Block changing stamp/points goal if card already has active members
  if (pointsForReward !== card.pointsForReward) {
    const activeCount = await new SupabaseMembershipRepository().countByCard(id);
    if (activeCount > 0) {
      return { ok: false, error: 'No puedes cambiar el número de sellos mientras la tarjeta tenga usuarios activos.', field: 'pointsForReward' };
    }
  }

  try {
    await cardRepo.update(id, {
      name,
      description: description ?? null,
      pointsPerCheckin,
      pointsForReward,
      rewardDescription,
      maxMembers: maxMembers ?? null,
      design: parseDesign(design),
    });
  } catch (err) {
    console.error('[updateCardAction]', err);
    return { ok: false, error: 'Error al guardar los cambios. Intenta de nuevo.' };
  }

  return { ok: true };
}

export async function getCardActiveUserCount(cardId: string): Promise<number> {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return 0;
  try {
    return await new SupabaseMembershipRepository().countByCard(cardId);
  } catch {
    return 0;
  }
}

export async function deleteCardAction(id: string): Promise<never> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) redirect('/login');

  const cardRepo = new SupabaseCardRepository();
  const card = await cardRepo.findById(id);

  if (!card) redirect('/app/cards');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org || card.orgId !== org.id) throw new Error('Sin permisos.');

  await cardRepo.delete(id);
  redirect('/app/cards');
}
