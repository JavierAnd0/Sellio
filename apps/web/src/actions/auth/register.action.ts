'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@sellio/db/server';
import { SupabaseOrganizationRepository } from '@sellio/db/repositories';
import { deriveSlug } from '@sellio/domain';

const registerSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  fullName: z.string().min(2, 'Ingresa tu nombre completo').max(100),
  businessName: z.string().min(2, 'Ingresa el nombre de tu negocio').max(100),
});

export type RegisterResult =
  | { ok: true }
  | { ok: false; error: string; field?: string };

function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    const value = (error as { code?: unknown }).code;
    if (typeof value === 'string') return value;
  }
  return undefined;
}

export async function registerAction(formData: FormData): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    businessName: formData.get('businessName'),
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, error: first?.message ?? 'Datos inválidos', field: String(first?.path[0] ?? '') };
  }

  const { email, password, fullName, businessName } = parsed.data;
  const db = await createClient();

  const { data, error: authError } = await db.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (authError || !data.user) {
    if (authError?.message.includes('already registered')) {
      return { ok: false, error: 'Este email ya está registrado', field: 'email' };
    }
    return { ok: false, error: authError?.message ?? 'Error al crear la cuenta' };
  }

  const newUser = data.user;
  const orgRepo = new SupabaseOrganizationRepository();
  const baseSlug = deriveSlug(businessName);

  const tryCreateOrg = async (slug: string) =>
    orgRepo.create({ ownerId: newUser.id, name: businessName, slug });

  try {
    await tryCreateOrg(baseSlug);
  } catch (firstError) {
    if (getErrorCode(firstError) === 'slug_taken') {
      const suffix = Math.random().toString(36).slice(2, 5);
      try {
        await tryCreateOrg(`${baseSlug.slice(0, 37)}-${suffix}`);
      } catch (secondError) {
        const secondCode = getErrorCode(secondError);
        if (secondCode === 'org_insert_blocked') {
          return { ok: false, error: 'No hay permisos para crear organizaciones (RLS). Ejecuta migraciones y revisa políticas.' };
        }
        if (secondCode === 'org_members_bootstrap_blocked') {
          return { ok: false, error: 'No se pudo vincular tu usuario al negocio. Aplica la migración de bootstrap de organization_members.' };
        }
        return { ok: false, error: 'No se pudo crear tu organización. Intenta de nuevo.' };
      }
    } else {
      const firstCode = getErrorCode(firstError);
      if (firstCode === 'org_insert_blocked') {
        return { ok: false, error: 'No hay permisos para crear organizaciones (RLS). Ejecuta migraciones y revisa políticas.' };
      }
      if (firstCode === 'org_members_bootstrap_blocked') {
        return { ok: false, error: 'No se pudo vincular tu usuario al negocio. Aplica la migración de bootstrap de organization_members.' };
      }
      return { ok: false, error: 'No se pudo crear tu organización. Intenta de nuevo.' };
    }
  }

  redirect('/verify-email');
}

export async function resendVerificationAction(email: string): Promise<{ ok: boolean }> {
  const db = await createClient();
  const { error } = await db.auth.resend({ type: 'signup', email });
  return { ok: !error };
}
