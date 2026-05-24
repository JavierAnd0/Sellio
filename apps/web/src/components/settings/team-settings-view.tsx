'use client';

import { type FormEvent, useState, useTransition } from 'react';
import { UserPlus, Trash2, Clock, Mail, Shield } from 'lucide-react';
import { Alert, Button, Input } from '@sellio/ui';
import {
  inviteTeamMemberAction,
  deleteInvitationAction,
  removeTeamMemberAction,
} from '@/actions/profile/team.actions';

interface TeamMember {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  joinedAt: string;
  avatarUrl: string | null;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

interface TeamSettingsViewProps {
  members: TeamMember[];
  invitations: PendingInvitation[];
  ownerUserId: string;
}

export function TeamSettingsView({ members, invitations, ownerUserId }: TeamSettingsViewProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPendingInvite, startInviteTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();

  const handleInvite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const formEl = e.currentTarget;

    startInviteTransition(async () => {
      const result = await inviteTeamMemberAction(formData);
      if (result.ok) {
        setSuccess('Invitación enviada con éxito por correo electrónico.');
        formEl.reset();
      } else {
        setError(result.error);
      }
    });
  };

  const handleDeleteInvite = (id: string, email: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas revocar la invitación para ${email}?`)) {
      return;
    }
    setError(null);
    setSuccess(null);

    startDeleteTransition(async () => {
      const result = await deleteInvitationAction(id);
      if (result.ok) {
        setSuccess(`Invitación para ${email} revocada correctamente.`);
      } else {
        setError(result.error);
      }
    });
  };

  const handleRemoveMember = (userId: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas remover a ${name} de tu organización? Esta acción revocará de inmediato su acceso al panel.`)) {
      return;
    }
    setError(null);
    setSuccess(null);

    startDeleteTransition(async () => {
      const result = await removeTeamMemberAction(userId);
      if (result.ok) {
        setSuccess(`Miembro ${name} removido de la organización.`);
      } else {
        setError(result.error);
      }
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'admin':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'cashier':
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Propietario';
      case 'admin':
        return 'Administrador';
      case 'cashier':
      default:
        return 'Cajero / Staff';
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[800px]">
      
      {/* Alert notifications */}
      {success && (
        <Alert variant="success" className="animate-in fade-in slide-in-from-top-4 duration-200">
          {success}
        </Alert>
      )}
      {error && (
        <Alert variant="error" className="animate-in fade-in slide-in-from-top-4 duration-200">
          {error}
        </Alert>
      )}

      {/* Main card */}
      <div className="rounded-2xl bg-surface shadow-sm border border-border/10 p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="font-display text-[28px] font-black tracking-tight text-fg mb-1">
            Equipo del Negocio
          </h2>
          <p className="text-[15px] text-muted">
            Gestiona los miembros de tu equipo, administra accesos de cajeros e invita nuevos usuarios.
          </p>
        </div>

        {/* Invite Member form */}
        <div className="border-t border-border/10 pt-6 mb-8">
          <h3 className="text-lg font-bold text-fg mb-4 flex items-center gap-2">
            <UserPlus size={18} className="text-[#E8341A]" />
            Invitar miembro de equipo
          </h3>

          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full flex flex-col gap-2">
              <label htmlFor="email-invite-input" className="text-[13px] font-bold text-muted">
                Correo electrónico
              </label>
              <Input
                id="email-invite-input"
                name="email"
                type="email"
                required
                placeholder="cajero@tu-negocio.com"
                className="h-[44px] rounded-xl border-border/20 shadow-sm px-4"
              />
            </div>

            <div className="w-full sm:w-[180px] flex flex-col gap-2">
              <label htmlFor="role-invite-select" className="text-[13px] font-bold text-muted">
                Rol asignado
              </label>
              <select
                id="role-invite-select"
                name="role"
                required
                defaultValue="cashier"
                className="h-[44px] rounded-xl border border-border/20 bg-surface-2 shadow-sm px-4 text-sm text-fg outline-none focus:border-[#E8341A]/50 focus:ring-1 focus:ring-[#E8341A]/50 transition-all cursor-pointer font-medium"
              >
                <option value="cashier">Cajero / Staff</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <Button
              id="send-invite-button"
              type="submit"
              loading={isPendingInvite}
              disabled={isPendingInvite || isPendingDelete}
              className="bg-[#E8341A] hover:bg-[#D02B13] text-white font-bold h-[44px] px-6 rounded-xl shadow-sm transition-colors text-[14px] w-full sm:w-auto shrink-0"
            >
              Enviar invitación
            </Button>
          </form>
        </div>

        {/* Active team members */}
        <div className="border-t border-border/10 pt-6">
          <h3 className="text-lg font-bold text-fg mb-4 flex items-center gap-2">
            <Shield size={18} className="text-muted" />
            Miembros activos ({members.length})
          </h3>

          <div className="border border-border/10 rounded-2xl overflow-hidden bg-surface-2/20">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-surface-2/60 border-b border-border/10 text-muted font-bold text-xs uppercase tracking-wider">
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Rol</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Fecha de registro</th>
                    <th className="px-6 py-4 w-12 text-center" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5 text-fg font-medium">
                  {members.map((member) => {
                    const isCurrentUserOwner = member.userId === ownerUserId;
                    return (
                      <tr key={member.userId} className="hover:bg-surface-2/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-surface-2 border border-border/20 flex items-center justify-center text-xs font-bold text-fg shrink-0 shadow-sm">
                              {member.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-fg text-sm leading-none truncate">
                                {member.fullName}
                              </p>
                              <p className="text-[12px] text-muted truncate mt-1">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${getRoleBadge(member.role)}`}>
                            {getRoleLabel(member.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted text-xs hidden sm:table-cell">
                          {new Date(member.joinedAt).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {!isCurrentUserOwner ? (
                            <button
                              id={`remove-member-${member.userId}`}
                              type="button"
                              onClick={() => handleRemoveMember(member.userId, member.fullName)}
                              disabled={isPendingDelete || isPendingInvite}
                              className="text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Remover miembro de la organización"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-muted/60 uppercase tracking-widest">
                              Owner
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pending invitations */}
        {invitations.length > 0 && (
          <div className="border-t border-border/10 pt-6 mt-8">
            <h3 className="text-lg font-bold text-fg mb-4 flex items-center gap-2">
              <Clock size={18} className="text-muted" />
              Invitaciones pendientes ({invitations.length})
            </h3>

            <div className="border border-border/10 rounded-2xl overflow-hidden bg-surface-2/20">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-surface-2/60 border-b border-border/10 text-muted font-bold text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Correo electrónico</th>
                      <th className="px-6 py-4">Rol</th>
                      <th className="px-6 py-4 hidden sm:table-cell">Expira</th>
                      <th className="px-6 py-4 w-12 text-center" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/5 text-fg font-medium">
                    {invitations.map((invite) => (
                      <tr key={invite.id} className="hover:bg-surface-2/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-fg font-semibold">
                            <Mail size={14} className="text-muted" />
                            {invite.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${getRoleBadge(invite.role)}`}>
                            {getRoleLabel(invite.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted text-xs hidden sm:table-cell">
                          {new Date(invite.expiresAt).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            id={`revoke-invite-${invite.id}`}
                            type="button"
                            onClick={() => handleDeleteInvite(invite.id, invite.email)}
                            disabled={isPendingDelete || isPendingInvite}
                            className="text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Revocar invitación"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
