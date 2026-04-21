'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@sellio/db/server';
import { SupabaseCardRepository, SupabaseOrganizationRepository } from '@sellio/db/repositories';

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
});

export type CardActionResult =
  | { ok: true }
  | { ok: false; error: string; field?: string };

export async function createCardAction(formData: FormData): Promise<never> {
  const parsed = cardSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    pointsPerCheckin: formData.get('pointsPerCheckin'),
    pointsForReward: formData.get('pointsForReward'),
    rewardDescription: formData.get('rewardDescription'),
    maxMembers: formData.get('maxMembers') || undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    throw new Error(first?.message ?? 'Datos inválidos');
  }

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) throw new Error('Organización no encontrada');

  const { name, description, pointsPerCheckin, pointsForReward, rewardDescription, maxMembers } =
    parsed.data;

  const card = await new SupabaseCardRepository().create({
    orgId: org.id,
    name,
    description: description ?? null,
    pointsPerCheckin,
    pointsForReward,
    rewardDescription,
    maxMembers: maxMembers ?? null,
    design: { primaryColor: org.primaryColor },
  });

  redirect(`/app/cards/${card.id}`);
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

  const { name, description, pointsPerCheckin, pointsForReward, rewardDescription, maxMembers } =
    parsed.data;

  try {
    await cardRepo.update(id, {
      name,
      description: description ?? null,
      pointsPerCheckin,
      pointsForReward,
      rewardDescription,
      maxMembers: maxMembers ?? null,
    });
  } catch {
    return { ok: false, error: 'Error al guardar los cambios. Intenta de nuevo.' };
  }

  return { ok: true };
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
