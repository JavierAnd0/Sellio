import { redirect } from 'next/navigation';
import { createClient } from '@sellio/db/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  const founderEmail = process.env.FOUNDER_EMAIL;
  if (!user || !founderEmail || user.email !== founderEmail) {
    redirect('/app/dashboard');
  }

  return <>{children}</>;
}
