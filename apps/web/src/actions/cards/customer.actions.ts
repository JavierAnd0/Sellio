'use server';

import { z } from 'zod';

import { createClient } from '@sellio/db/server';
import {
  SupabaseCardRepository,
  SupabaseCustomerRepository,
  SupabaseMembershipRepository,
  SupabaseOrganizationRepository,
} from '@sellio/db/repositories';
import type { Membership } from '@sellio/domain';
import { updateGoogleWalletPass } from '@/lib/wallet-updates';

const PHONE_RE = /^\+?[0-9\s\-().]{7,20}$/;

const addCustomerSchema = z.object({
  phone: z
    .string()
    .min(7, 'Teléfono inválido')
    .max(20, 'Teléfono inválido')
    .regex(PHONE_RE, 'Teléfono inválido — solo dígitos, espacios, +, - y paréntesis'),
  name: z.string().max(100).optional(),
});

export type AddCustomerResult =
  | { ok: true; membership: Membership }
  | { ok: false; error: string; field?: string };

export type AddPointsResult =
  | { ok: true; newPoints: number }
  | { ok: false; error: string };

export async function addPointsAction(
  membershipId: string,
  points: number,
): Promise<AddPointsResult> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) return { ok: false, error: 'Sesión expirada.' };

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) return { ok: false, error: 'Organización no encontrada.' };

  // Verify the membership belongs to a card in the caller's org
  const { data: membershipRow } = await db
    .from('memberships')
    .select('card_id, slug')
    .eq('id', membershipId)
    .single();

  if (!membershipRow) return { ok: false, error: 'Membresía no encontrada.' };

  const card = await new SupabaseCardRepository().findById(membershipRow.card_id);
  if (!card || card.orgId !== org.id) return { ok: false, error: 'No autorizado.' };

  try {
    const newPoints = await new SupabaseMembershipRepository().addPoints(
      membershipId,
      points,
      'manual',
      user.id,
    );

    if (membershipRow.slug) {
      updateGoogleWalletPass(membershipRow.slug, newPoints, card.pointsForReward).catch(() => {});
    }

    return { ok: true, newPoints };
  } catch {
    return { ok: false, error: 'Error al sumar los puntos.' };
  }
}

export async function addCustomerAction(
  cardId: string,
  formData: FormData,
): Promise<AddCustomerResult> {
  const parsed = addCustomerSchema.safeParse({
    phone: formData.get('phone'),
    name: formData.get('name') || undefined,
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

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) return { ok: false, error: 'Organización no encontrada.' };

  const card = await new SupabaseCardRepository().findById(cardId);
  if (!card || card.orgId !== org.id) return { ok: false, error: 'Tarjeta no encontrada.' };

  const { phone, name } = parsed.data;

  try {
    const customerRepo = new SupabaseCustomerRepository();
    const membershipRepo = new SupabaseMembershipRepository();

    // Enforce customer limits based on organization plan
    const existingCustomer = await customerRepo.findByPhone(org.id, phone);
    if (!existingCustomer) {
      if (org.plan === 'free' || org.plan === 'basic') {
        const count = await customerRepo.countByOrg(org.id);
        const limit = org.plan === 'free' ? 50 : 500;
        if (count >= limit) {
          return {
            ok: false,
            error: `Has alcanzado el límite de ${limit} clientes en el plan ${org.plan === 'free' ? 'Gratuito' : 'Basic'}. Por favor, actualiza tu plan en Facturación.`,
          };
        }
      }
    }

    const customer = await customerRepo.upsert({
      orgId: org.id,
      phone,
      name: name ?? null,
    });

    const existingMembership = await membershipRepo.findByCardAndCustomer(cardId, customer.id);
    if (existingMembership) {
      return { ok: true, membership: existingMembership };
    }

    const membership = await membershipRepo.create(cardId, customer.id);
    return { ok: true, membership };
  } catch (err) {
    console.error('[addCustomerAction]', err);
    return { ok: false, error: 'Error al agregar el cliente. Intenta de nuevo.' };
  }
}

export interface ImportActionResult {
  ok: boolean;
  imported: number;
  skipped: number;
  error?: string;
}

export async function importCustomersAction(
  cardId: string,
  customersList: { name: string; phone: string }[],
): Promise<ImportActionResult> {
  try {
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();

    if (!user) {
      return { ok: false, imported: 0, skipped: 0, error: 'Sesión expirada. Vuelve a iniciar sesión.' };
    }

    const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
    if (!org) {
      return { ok: false, imported: 0, skipped: 0, error: 'Organización no encontrada.' };
    }

    const card = await new SupabaseCardRepository().findById(cardId);
    if (!card || card.orgId !== org.id) {
      return { ok: false, imported: 0, skipped: 0, error: 'Tarjeta no encontrada.' };
    }

    const customerRepo = new SupabaseCustomerRepository();
    const membershipRepo = new SupabaseMembershipRepository();

    let currentCount = await customerRepo.countByOrg(org.id);
    const isLimited = org.plan === 'free' || org.plan === 'basic';
    const limit = org.plan === 'free' ? 50 : 500;

    let imported = 0;
    let skipped = 0;

    for (const c of customersList) {
      const phone = c.phone.trim();
      const name = c.name.trim();

      if (!phone || !PHONE_RE.test(phone)) {
        skipped++;
        continue;
      }

      const existingCustomer = await customerRepo.findByPhone(org.id, phone);

      if (!existingCustomer) {
        if (isLimited && currentCount >= limit) {
          return {
            ok: false,
            imported,
            skipped: skipped + (customersList.length - imported - skipped),
            error: `Límite de clientes alcanzado (${limit}). Se importaron ${imported} clientes antes de detenerse. Actualiza tu plan para importar más.`,
          };
        }
        currentCount++;
      }

      try {
        const customer = await customerRepo.upsert({
          orgId: org.id,
          phone,
          name: name || null,
        });

        const existingMembership = await membershipRepo.findByCardAndCustomer(cardId, customer.id);
        if (!existingMembership) {
          await membershipRepo.create(cardId, customer.id);
        }

        imported++;
      } catch (err) {
        console.error('[importCustomersAction] Error upserting customer during import:', c, err);
        skipped++;
      }
    }

    return { ok: true, imported, skipped };
  } catch (err: any) {
    console.error('[importCustomersAction] Fatal error:', err);
    return { ok: false, imported: 0, skipped: 0, error: err?.message || 'Error interno del servidor al importar.' };
  }
}
