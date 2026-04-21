'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@sellio/db/server';

export async function signoutAction(): Promise<void> {
  const db = await createClient();
  await db.auth.signOut();
  redirect('/login');
}
