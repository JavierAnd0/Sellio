-- ============================================================================
-- Sellio — Campañas y Referidos (Campaigns & Referrals)
-- ============================================================================

CREATE TABLE public.campaigns (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  card_id      uuid references public.cards(id) on delete cascade,
  title        text not null,
  message      text not null,
  status       text not null default 'draft', -- 'draft', 'sent'
  sent_at      timestamptz,
  created_at   timestamptz not null default now()
);

CREATE TABLE public.referrals (
  id               uuid primary key default gen_random_uuid(),
  membership_id    uuid not null references public.memberships(id) on delete cascade,
  referred_phone   text not null,
  status           text not null default 'pending', -- 'pending', 'joined', 'rewarded'
  points_rewarded  integer not null default 0,
  created_at       timestamptz not null default now()
);

-- Habilitar RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Políticas para Campaigns
CREATE POLICY "org members see campaigns"
  ON public.campaigns FOR SELECT
  USING (public.org_role_of(org_id, auth.uid()) IS NOT NULL);

CREATE POLICY "org owners and admins manage campaigns"
  ON public.campaigns FOR ALL
  USING (public.org_role_of(org_id, auth.uid()) in ('owner', 'admin'));

-- Políticas para Referrals
CREATE POLICY "org members see referrals"
  ON public.referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN public.cards c ON m.card_id = c.id
      WHERE m.id = public.referrals.membership_id
      AND public.org_role_of(c.org_id, auth.uid()) IS NOT NULL
    )
  );

CREATE POLICY "org owners and admins manage referrals"
  ON public.referrals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN public.cards c ON m.card_id = c.id
      WHERE m.id = public.referrals.membership_id
      AND public.org_role_of(c.org_id, auth.uid()) in ('owner', 'admin')
    )
  );
