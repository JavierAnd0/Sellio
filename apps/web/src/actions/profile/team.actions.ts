'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@sellio/db/server';
import { createAdminClient } from '@sellio/db/admin';
import { SupabaseOrganizationRepository } from '@sellio/db/repositories';
import { getResendClient, getFromAddress, InviteEmail } from '@sellio/emails';

const inviteSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  role: z.enum(['admin', 'cashier']),
});

export type TeamActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function inviteTeamMemberAction(formData: FormData): Promise<TeamActionResult> {
  const parsed = inviteSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role'),
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, error: first?.message ?? 'Datos inválidos' };
  }

  const { email, role } = parsed.data;

  try {
    const db = await createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return { ok: false, error: 'Sesión expirada. Vuelve a iniciar sesión.' };

    const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
    if (!org) return { ok: false, error: 'Solo el propietario del negocio puede invitar miembros de equipo.' };

    // Check if the user is already a member
    const adminDb = createAdminClient();
    
    // Check if there is an active member with this email
    const { data: usersData } = await adminDb.auth.admin.listUsers();
    const existingUser = (usersData?.users || []).find(u => u.email === email);

    if (existingUser) {
      const { data: existingMember } = await adminDb
        .from('organization_members')
        .select('*')
        .eq('org_id', org.id)
        .eq('user_id', existingUser.id)
        .maybeSingle();

      if (existingMember) {
        return { ok: false, error: 'Este usuario ya es miembro de tu organización.' };
      }
    }

    // Check if there is a pending invite for this email in this org
    const { data: existingInvite } = await adminDb
      .from('invitations')
      .select('*')
      .eq('org_id', org.id)
      .eq('email', email)
      .maybeSingle();

    if (existingInvite) {
      return { ok: false, error: 'Ya existe una invitación pendiente para este correo electrónico.' };
    }

    // Create invitation token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const { error: inviteError } = await adminDb
      .from('invitations')
      .insert({
        org_id: org.id,
        email,
        role,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (inviteError) {
      console.error('[inviteTeamMemberAction] Database insert error:', inviteError);
      return { ok: false, error: 'Error al registrar la invitación en la base de datos.' };
    }

    // Send email via Resend
    const resend = getResendClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${appUrl}/register?invite_token=${token}`;

    const { error: emailError } = await resend.emails.send({
      from: getFromAddress(),
      to: email,
      subject: `Te han invitado a unirte a ${org.name} en Sellio`,
      react: InviteEmail({
        orgName: org.name,
        inviterEmail: user.email || 'Propietario del negocio',
        inviteUrl,
        role,
      }),
    });

    if (emailError) {
      console.error('[inviteTeamMemberAction] Resend email send error:', emailError);
      // We don't fail the operation completely, but warn that the email could not be sent
      return { ok: true, error: 'Invitación creada, pero ocurrió un problema al enviar el correo electrónico.' } as any;
    }

    revalidatePath('/app/settings/team');
    return { ok: true };
  } catch (err: any) {
    console.error('[inviteTeamMemberAction] Fatal error:', err);
    return { ok: false, error: err?.message || 'Ocurrió un error inesperado al procesar la invitación.' };
  }
}

export async function deleteInvitationAction(invitationId: string): Promise<TeamActionResult> {
  try {
    const db = await createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return { ok: false, error: 'Sesión expirada.' };

    const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
    if (!org) return { ok: false, error: 'No tienes permisos para revocar invitaciones.' };

    const adminDb = createAdminClient();
    const { error } = await adminDb
      .from('invitations')
      .delete()
      .eq('id', invitationId)
      .eq('org_id', org.id);

    if (error) {
      console.error('[deleteInvitationAction] Error:', error);
      return { ok: false, error: 'No se pudo eliminar la invitación.' };
    }

    revalidatePath('/app/settings/team');
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Error del servidor.' };
  }
}

export async function removeTeamMemberAction(memberUserId: string): Promise<TeamActionResult> {
  try {
    const db = await createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return { ok: false, error: 'Sesión expirada.' };

    const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
    if (!org) return { ok: false, error: 'Solo el propietario de la organización puede remover miembros.' };

    if (memberUserId === user.id) {
      return { ok: false, error: 'No puedes removerte a ti mismo de la organización.' };
    }

    const adminDb = createAdminClient();
    const { error } = await adminDb
      .from('organization_members')
      .delete()
      .eq('user_id', memberUserId)
      .eq('org_id', org.id);

    if (error) {
      console.error('[removeTeamMemberAction] Error:', error);
      return { ok: false, error: 'No se pudo remover al miembro del equipo.' };
    }

    revalidatePath('/app/settings/team');
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Error del servidor.' };
  }
}
