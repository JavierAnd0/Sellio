import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { createClient } from '@sellio/db/server';

export default async function BuilderLayout({ children }: { children: ReactNode }) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="h-screen overflow-hidden bg-bg">
      {children}
    </div>
  );
}
