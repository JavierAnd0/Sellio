'use server';

import { cookies } from 'next/headers';

const VALID_LOCALES = ['es', 'en'];

export async function setLocaleAction(locale: string) {
  if (!VALID_LOCALES.includes(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}
