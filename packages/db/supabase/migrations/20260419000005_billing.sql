-- ============================================================================
-- Sellio — Billing: subscriptions, invoices, webhook events
-- ============================================================================

-- ── subscriptions ───────────────────────────────────────────────────────────
create table public.subscriptions (
  id                        uuid primary key default uuid_generate_v4(),
  org_id                    uuid not null unique references public.organizations(id) on delete cascade,
  plan                      org_plan not null,
  status                    subscription_status not null default 'trialing',
  provider                  payment_provider not null,
  provider_subscription_id  text,
  provider_customer_id      text,
  current_period_start      timestamptz,
  current_period_end        timestamptz,
  cancel_at_period_end      boolean not null default false,
  trial_ends_at             timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create index subs_provider_id_idx on public.subscriptions(provider, provider_subscription_id);

-- ── invoices ────────────────────────────────────────────────────────────────
create table public.invoices (
  id                   uuid primary key default uuid_generate_v4(),
  org_id               uuid not null references public.organizations(id) on delete cascade,
  subscription_id      uuid references public.subscriptions(id) on delete set null,
  amount_cents         int not null,
  currency             text not null default 'COP',
  status               text not null,  -- paid, pending, failed
  provider             payment_provider not null,
  provider_invoice_id  text unique,
  paid_at              timestamptz,
  period_start         timestamptz,
  period_end           timestamptz,
  created_at           timestamptz not null default now()
);

create index invoices_org_idx on public.invoices(org_id, created_at desc);

-- ── webhook_events: idempotencia de webhooks ───────────────────────────────
create table public.webhook_events (
  id            uuid primary key default uuid_generate_v4(),
  provider      payment_provider not null,
  event_id      text not null,
  event_type    text not null,
  payload       jsonb not null,
  processed_at  timestamptz,
  error         text,
  created_at    timestamptz not null default now(),
  unique (provider, event_id)
);

create index webhook_events_unprocessed_idx on public.webhook_events(created_at)
  where processed_at is null;

-- ── feature_flags: para M1-M3, simple tabla en DB ───────────────────────────
create table public.feature_flags (
  key              text primary key,
  description      text,
  enabled_globally boolean not null default false,
  enabled_for_orgs uuid[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger feature_flags_updated_at
  before update on public.feature_flags
  for each row execute function public.set_updated_at();

create or replace function public.is_feature_enabled(
  p_flag text,
  p_org_id uuid
)
returns boolean
language sql
stable
as $$
  select coalesce(
    (select enabled_globally or p_org_id = any(enabled_for_orgs)
     from public.feature_flags where key = p_flag),
    false
  );
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.webhook_events enable row level security;
alter table public.feature_flags enable row level security;

-- subscriptions: owners ven su propia
create policy "owners see own subscription"
  on public.subscriptions for select
  using (public.org_role_of(org_id, auth.uid()) = 'owner');

-- invoices: owners ven sus invoices
create policy "owners see own invoices"
  on public.invoices for select
  using (public.org_role_of(org_id, auth.uid()) = 'owner');

-- webhook_events: solo service_role
-- feature_flags: lectura pública (función is_feature_enabled la usa)
create policy "public read feature flags"
  on public.feature_flags for select
  using (true);
