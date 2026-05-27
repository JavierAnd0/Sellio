'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@sellio/db/server';
import { SupabaseOrganizationRepository } from '@sellio/db/repositories';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type NpsEligibility =
  | { shouldShow: false }
  | { shouldShow: true; orgId: string; orgName: string };

export type NpsSubmitResult =
  | { ok: true }
  | { ok: false; error: string };

// ─── checkNpsEligibility ──────────────────────────────────────────────────────
/**
 * Determina si el comercio debe ver el widget de NPS.
 * Condiciones para mostrar:
 *  1. La org tiene ≥14 días de creada (tiempo mínimo de uso real)
 *  2. La org no ha respondido NPS en los últimos 90 días
 */
export async function checkNpsEligibility(): Promise<NpsEligibility> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) return { shouldShow: false };

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) return { shouldShow: false };

  // Verificar antigüedad mínima: 14 días
  const createdAt = new Date(org.createdAt);
  const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation < 14) return { shouldShow: false };

  // Verificar si ya respondió en los últimos 90 días
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentResponse } = await db
    .from('nps_responses')
    .select('id')
    .eq('org_id', org.id)
    .gte('responded_at', ninetyDaysAgo)
    .maybeSingle();

  if (recentResponse) return { shouldShow: false };

  return { shouldShow: true, orgId: org.id, orgName: org.name };
}

// ─── submitNpsResponse ────────────────────────────────────────────────────────
/**
 * Guarda la respuesta NPS del comercio en la base de datos.
 */
export async function submitNpsResponse(
  score: number,
  comment?: string,
): Promise<NpsSubmitResult> {
  if (score < 0 || score > 10 || !Number.isInteger(score)) {
    return { ok: false, error: 'Puntuación inválida.' };
  }

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) return { ok: false, error: 'Organización no encontrada.' };

  const { error } = await db.from('nps_responses').insert({
    org_id: org.id,
    score,
    comment: comment?.trim() || null,
  });

  if (error) {
    console.error('[submitNpsResponse]', error);
    return { ok: false, error: 'Error al guardar. Intenta de nuevo.' };
  }

  return { ok: true };
}
