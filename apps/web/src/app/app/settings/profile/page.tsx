import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { createClient } from '@sellio/db/server';
import { SupabaseOrganizationRepository, SupabaseProfileRepository } from '@sellio/db/repositories';

import { ProfileForm } from '@/components/profile/profile-form';

export const metadata: Metadata = { title: 'Perfil' };

export default async function ProfilePage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();

  if (!user) redirect('/login');

  const [profile, org] = await Promise.all([
    new SupabaseProfileRepository().findById(user.id),
    new SupabaseOrganizationRepository().findByOwner(user.id),
  ]);



  return <ProfileForm initialProfile={profile} initialOrg={org} userEmail={user.email} />;
}
