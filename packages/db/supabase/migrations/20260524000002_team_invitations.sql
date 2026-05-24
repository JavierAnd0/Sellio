-- ============================================================================
-- Sellio — Invitaciones de equipo (Team Invitations)
-- ============================================================================

CREATE TABLE public.invitations (
  id           uuid primary key default uuid_generate_v4(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  email        text not null,
  role         org_role not null default 'cashier',
  token        text not null unique,
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now()
);

-- RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Solo owners y admins de la organización pueden ver e interactuar con sus invitaciones
CREATE POLICY "org owners and admins see invitations"
  ON public.invitations FOR SELECT
  USING (public.org_role_of(org_id, auth.uid()) in ('owner', 'admin'));

CREATE POLICY "org owners and admins manage invitations"
  ON public.invitations FOR ALL
  USING (public.org_role_of(org_id, auth.uid()) in ('owner', 'admin'));
