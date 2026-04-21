'use server';

import { z } from 'zod';

import { createClient } from '@sellio/db/server';
import { SupabaseOrganizationRepository } from '@sellio/db/repositories';
import { SupabaseProfileRepository } from '@sellio/db/repositories';

const schema = z.object({
  fullName: z.string().min(2, 'Mínimo 2 caracteres').max(100).optional(),
  phone: z.string().max(20).optional().or(z.literal('')),
  orgName: z.string().min(2, 'Mínimo 2 caracteres').max(100).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido').optional(),
});

export type UpdateProfileResult =
  | { ok: true }
  | { ok: false; error: string; field?: string };

export async function updateProfileAction(formData: FormData): Promise<UpdateProfileResult> {
  const parsed = schema.safeParse({
    fullName: formData.get('fullName') || undefined,
    phone: formData.get('phone') || undefined,
    orgName: formData.get('orgName') || undefined,
    primaryColor: formData.get('primaryColor') || undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, error: first?.message ?? 'Datos inválidos', field: String(first?.path[0] ?? '') };
  }

  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();

  if (!user) {
    return { ok: false, error: 'Sesión expirada. Vuelve a iniciar sesión.' };
  }

  const { fullName, phone, orgName, primaryColor } = parsed.data;

  const profileRepo = new SupabaseProfileRepository();
  const orgRepo = new SupabaseOrganizationRepository();

  try {
    await Promise.all([
      fullName !== undefined || phone !== undefined
        ? profileRepo.update(user.id, {
            fullName: fullName ?? null,
            phone: phone || null,
          })
        : Promise.resolve(),
      orgName !== undefined || primaryColor !== undefined
        ? orgRepo.findByOwner(user.id).then((org) => {
            if (!org) return;
            return orgRepo.update(org.id, {
              name: orgName,
              primaryColor,
            });
          })
        : Promise.resolve(),
    ]);
  } catch {
    return { ok: false, error: 'Error al guardar los cambios. Intenta de nuevo.' };
  }

  return { ok: true };
}
