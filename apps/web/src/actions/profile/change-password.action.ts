'use server';

import { createClient } from '@sellio/db/server';

export async function changePasswordAction(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { ok: false, error: 'Todos los campos son obligatorios' };
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, field: 'confirmPassword', error: 'Las contraseñas no coinciden' };
  }

  if (newPassword.length < 8) {
    return { ok: false, field: 'newPassword', error: 'La nueva contraseña debe tener al menos 8 caracteres' };
  }

  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();

  if (!user) {
    return { ok: false, error: 'No autorizado' };
  }

  // To change password in Supabase using updateUser, we don't strictly need the current password if we are already authenticated,
  // however validating it might require signing in again to verify. For this simple flow, we'll just update it directly
  // since the user is authenticated in the current session.
  // Ideally, one would re-authenticate using db.auth.signInWithPassword({ email: user.email, password: currentPassword }) 
  // before updating to ensure security. Let's do that for safety if email is available.

  if (user.email) {
    const { error: signInError } = await db.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    
    if (signInError) {
      return { ok: false, field: 'currentPassword', error: 'La contraseña actual es incorrecta' };
    }
  }

  const { error: updateError } = await db.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true };
}
