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
  } catch (err) {
    if ((err as { code?: string }).code !== 'slug_taken') throw err;
    const suffix = Math.random().toString(36).slice(2, 5);
    await tryCreateOrg(`${baseSlug.slice(0, 37)}-${suffix}`);
  }

  redirect('/verify-email');
}

export async function resendVerificationAction(email: string): Promise<{ ok: boolean }> {
  const db = await createClient();
  const { error } = await db.auth.resend({ type: 'signup', email });
  return { ok: !error };
}
