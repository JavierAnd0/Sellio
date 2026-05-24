'use server';

import { createAdminClient } from '@sellio/db/admin';

export type CheckInResult =
  | {
      ok: true;
      newPoints: number;
      pointsForReward: number;
      rewardDescription: string;
      customerName: string | null;
      membershipSlug: string;
      pointsAdded: number;
    }
  | { ok: false; error: string; retryAfterMinutes?: number };

export async function checkInAction(orgSlug: string, formData: FormData): Promise<CheckInResult> {
  const rawPhone = (formData.get('phone') as string | null)?.trim() ?? '';
  const phone = rawPhone.replace(/\s/g, '');
  const name = (formData.get('name') as string | null)?.trim() ?? '';

  if (!name) {
    return { ok: false, error: 'Ingresa tu nombre completo.' };
  }

  if (!phone || !/^\+?[0-9()\-. ]{7,20}$/.test(rawPhone)) {
    return { ok: false, error: 'Ingresa un número de teléfono válido.' };
  }

  const db = createAdminClient();

  const { data: org } = await db
    .from('organizations')
    .select('id, name')
    .eq('slug', orgSlug)
    .maybeSingle();

  if (!org) return { ok: false, error: 'Negocio no encontrado.' };

  const { data: card } = await db
    .from('cards')
    .select('id, points_per_checkin, points_for_reward, reward_description')
    .eq('org_id', org.id)
    .eq('active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!card) return { ok: false, error: 'Este negocio no tiene una tarjeta activa.' };

  const { data: customer, error: customerError } = await db
    .from('customers')
    .upsert({ org_id: org.id, phone, name }, { onConflict: 'org_id,phone' })
    .select('id, name')
    .single();

  if (customerError || !customer) return { ok: false, error: 'Error al registrar tu información.' };

  const { data: membership, error: membershipError } = await db
    .from('memberships')
    .upsert({ card_id: card.id, customer_id: customer.id }, { onConflict: 'card_id,customer_id' })
    .select('id, points, slug')
    .single();

  if (membershipError || !membership) return { ok: false, error: 'Error al crear tu membresía.' };

  // Rate limit: 1 check-in per 30 minutes
  const windowStart = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: recentTx } = await db
    .from('point_transactions')
    .select('created_at')
    .eq('membership_id', membership.id)
    .eq('source', 'checkin')
    .gte('created_at', windowStart)
    .limit(1)
    .maybeSingle();

  if (recentTx) {
    const txTime = new Date(recentTx.created_at).getTime();
    const minsLeft = Math.max(1, Math.ceil((txTime + 30 * 60 * 1000 - Date.now()) / 60_000));
    return {
      ok: false,
      error: `Ya sumaste puntos hace poco. Vuelve en ${minsLeft} minuto${minsLeft !== 1 ? 's' : ''}.`,
      retryAfterMinutes: minsLeft,
    };
  }

  const pointsAdded = card.points_per_checkin;
  const newPoints = membership.points + pointsAdded;

  const { error: txError } = await db.from('point_transactions').insert({
    membership_id: membership.id,
    type: 'earn' as const,
    points: pointsAdded,
    source: 'checkin' as const,
    idempotency_key: crypto.randomUUID(),
  });

  if (txError) return { ok: false, error: 'Error al sumar el punto. Intenta de nuevo.' };

  await db
    .from('memberships')
    .update({ points: newPoints, last_activity_at: new Date().toISOString() })
    .eq('id', membership.id);

  return {
    ok: true,
    newPoints,
    pointsForReward: card.points_for_reward,
    rewardDescription: card.reward_description,
    customerName: customer.name,
    membershipSlug: membership.slug,
    pointsAdded,
  };
}
