'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@sellio/db/server';

const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export type LoginResult = { ok: true } | { ok: false; error: string; field?: string };

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, error: first?.message ?? 'Datos inválidos', field: String(first?.path[0] ?? '') };
  }

  const { email, password } = parsed.data;
  const db = await createClient();

  const { error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { ok: false, error: 'Email o contraseña incorrectos' };
    }
    if (error.message.includes('Email not confirmed')) {
      return { ok: false, error: 'Confirma tu email antes de ingresar', field: 'email' };
    }
    return { ok: false, error: 'Error al iniciar sesión. Intenta de nuevo.' };
  }

  redirect('/app');
}
