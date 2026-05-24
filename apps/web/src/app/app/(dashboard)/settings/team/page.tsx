import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { createClient } from '@sellio/db/server';
import { createAdminClient } from '@sellio/db/admin';
import { SupabaseOrganizationRepository } from '@sellio/db/repositories';
import { TeamSettingsView } from '@/components/settings/team-settings-view';

export const metadata: Metadata = { title: 'Equipo' };

export default async function TeamSettingsPage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();

  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) {
    return (
      <div className="rounded-2xl bg-surface shadow-sm border border-border/10 p-8 max-w-[700px]">
        <h2 className="font-display text-[24px] font-black tracking-tight text-fg mb-2">
          Acceso no autorizado
        </h2>
        <p className="text-[15px] text-muted">
          Solo el propietario de la organización tiene permisos para administrar el equipo.
        </p>
      </div>
    );
  }

  const adminDb = createAdminClient();

  // 1. Fetch organization members
  const { data: membersRaw } = await adminDb
    .from('organization_members')
    .select('role, user_id, created_at')
    .eq('org_id', org.id);

  const memberIds = (membersRaw || []).map(m => m.user_id);

  // 2. Fetch profiles for member names
  let profilesRaw: Array<{ id: string; full_name: string | null; avatar_url: string | null }> = [];
  if (memberIds.length > 0) {
    const { data } = await adminDb
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', memberIds);
    profilesRaw = data || [];
  }

  // 3. Fetch user emails
  const userEmailMap: Record<string, string> = {};
  try {
    const { data: usersData } = await adminDb.auth.admin.listUsers();
    if (usersData?.users) {
      usersData.users.forEach(u => {
        userEmailMap[u.id] = u.email || '';
      });
    }
  } catch (err) {
    console.error('Error listing auth users:', err);
  }

  // Combine members with profiles and emails
  const members = (membersRaw || []).map(m => {
    const profile = profilesRaw.find(p => p.id === m.user_id);
    return {
      userId: m.user_id,
      role: m.role,
      joinedAt: m.created_at,
      fullName: profile?.full_name || 'Sin nombre',
      avatarUrl: profile?.avatar_url || null,
      email: userEmailMap[m.user_id] || 'Miembro del equipo',
    };
  });

  // 4. Fetch pending invitations
  const { data: invitationsRaw } = await adminDb
    .from('invitations')
    .select('id, email, role, expires_at, created_at')
    .eq('org_id', org.id);

  const invitations = (invitationsRaw || []).map(i => ({
    id: i.id,
    email: i.email,
    role: i.role,
    expiresAt: i.expires_at,
    createdAt: i.created_at,
  }));

  return (
    <TeamSettingsView
      members={members}
      invitations={invitations}
      ownerUserId={user.id}
    />
  );
}
