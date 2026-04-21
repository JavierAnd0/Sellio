'use server';

import { z } from 'zod';

import { createClient } from '@sellio/db/server';

const schema = z.object({
  email: z.string().email('Ingresa un email válido'),
});

export type ForgotPasswordResult = { ok: true } | { ok: false; error: string };

export async function forgotPasswordAction(formData: FormData): Promise<ForgotPasswordResult> {
  const parsed = schema.safeParse({ email: formData.get('email') });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Email inválido' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const db = await createClient();

  await db.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/reset-password`,
  });

  // Siempre retorna ok para no revelar si el email existe
  return { ok: true };
}
