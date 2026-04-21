'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@sellio/db/server';

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ResetPasswordResult = { ok: true } | { ok: false; error: string; field?: string };

export async function resetPasswordAction(formData: FormData): Promise<ResetPasswordResult> {
  const parsed = schema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, error: first?.message ?? 'Datos inválidos', field: String(first?.path[0] ?? '') };
  }

  const db = await createClient();
  const { error } = await db.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { ok: false, error: 'Error al actualizar la contraseña. El enlace puede haber expirado.' };
  }

  redirect('/login?reset=success');
}
