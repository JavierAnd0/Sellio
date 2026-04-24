'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@sellio/db/server';
import { SupabaseCardRepository, SupabaseOrganizationRepository } from '@sellio/db/repositories';
import { deriveSlug } from '@sellio/domain';

export type OnboardingActionResult =
  | { ok: true }
  | { ok: false; error: string };

export type CreateFirstCardResult =
  | { ok: true; cardId: string }
  | { ok: false; error: string };

function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    const value = (error as { code?: unknown }).code;
    if (typeof value === 'string') return value;
  }
  return undefined;
}

/**
 * Updates the organization name during onboarding.
 */
export async function updateBusinessAction(
  businessName: string,
): Promise<OnboardingActionResult> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) return { ok: false, error: 'Sesión expirada. Vuelve a iniciar sesión.' };

  const orgRepo = new SupabaseOrganizationRepository();
  const org = await orgRepo.findByOwner(user.id);

  if (!org) return { ok: false, error: 'Organización no encontrada.' };

  const trimmed = businessName.trim();
  if (!trimmed || trimmed.length < 2) {
    return { ok: false, error: 'El nombre debe tener al menos 2 caracteres.' };
  }

  try {
    await orgRepo.update(org.id, { name: trimmed });
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al actualizar el negocio. Intenta de nuevo.' };
  }
}

/**
 * Creates the first loyalty card during onboarding.
 */
export async function createFirstCardAction(input: {
  cardName: string;
  primaryColor: string;
  gradientBg: string;
  businessName?: string;
}): Promise<CreateFirstCardResult> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) return { ok: false, error: 'Sesión expirada. Vuelve a iniciar sesión.' };

  const orgRepo = new SupabaseOrganizationRepository();
  let org = await orgRepo.findByOwner(user.id);

  // Org creation can silently fail during registration (slug collision edge case).
  // Recover here using the business name the user provided in step 1.
  if (!org) {
    const name = input.businessName?.trim() ||
      (user.user_metadata as { full_name?: string } | undefined)?.full_name ||
      'Mi Negocio';
    const baseSlug = deriveSlug(name);
    try {
      org = await orgRepo.create({ ownerId: user.id, name, slug: baseSlug });
    } catch (firstError) {
      // Only retry when the collision is truly caused by a duplicate slug.
      if (getErrorCode(firstError) !== 'slug_taken') {
        console.error('createFirstCardAction org create failed (first attempt)', firstError);
        if (getErrorCode(firstError) === 'org_members_bootstrap_blocked') {
          return { ok: false, error: 'No se pudo vincular tu usuario al negocio. Ejecuta la migración de membresías y vuelve a intentar.' };
        }
        if (getErrorCode(firstError) === 'org_insert_blocked') {
          return { ok: false, error: 'No hay permisos para crear organizaciones (RLS). Revisa políticas/migraciones.' };
        }
        return { ok: false, error: 'No se pudo crear la organización. Intenta de nuevo.' };
      }

      const suffix = Math.random().toString(36).slice(2, 5);
      try {
        org = await orgRepo.create({ ownerId: user.id, name, slug: `${baseSlug.slice(0, 37)}-${suffix}` });
      } catch (secondError) {
        console.error('createFirstCardAction org create failed (second attempt)', secondError);
        if (getErrorCode(secondError) === 'org_members_bootstrap_blocked') {
          return { ok: false, error: 'No se pudo vincular tu usuario al negocio. Ejecuta la migración de membresías y vuelve a intentar.' };
        }
        if (getErrorCode(secondError) === 'org_insert_blocked') {
          return { ok: false, error: 'No hay permisos para crear organizaciones (RLS). Revisa políticas/migraciones.' };
        }
        return { ok: false, error: 'No se pudo crear la organización. Intenta de nuevo.' };
      }
    }
  }

  const trimmedName = input.cardName.trim();
  if (!trimmedName || trimmedName.length < 1) {
    return { ok: false, error: 'El nombre de la tarjeta es obligatorio.' };
  }

  try {
    const cardRepo = new SupabaseCardRepository();
    const card = await cardRepo.create({
      orgId: org.id,
      name: trimmedName,
      description: null,
      pointsPerCheckin: 1,
      pointsForReward: 10,
      rewardDescription: 'Premio especial para clientes frecuentes',
      maxMembers: null,
      design: {
        primaryColor: input.primaryColor,
        gradientBg: input.gradientBg,
      },
    });

    return { ok: true, cardId: card.id };
  } catch {
    return { ok: false, error: 'Error al crear la tarjeta. Intenta de nuevo.' };
  }
}

/**
 * Redirects to dashboard after onboarding (the "done" indicator is having cards).
 */
export async function finishOnboardingAction(): Promise<never> {
  redirect('/app/dashboard');
}
