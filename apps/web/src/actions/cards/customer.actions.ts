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

const addCustomerSchema = z.object({
  phone: z.string().min(7, 'Teléfono inválido').max(20),
  name: z.string().max(100).optional(),
});

export type AddCustomerResult =
  | { ok: true; membership: Membership }
  | { ok: false; error: string; field?: string };

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
  } catch {
    return { ok: false, error: 'Error al agregar el cliente. Intenta de nuevo.' };
  }
}
