-- ============================================================================
-- Sellio — Cards, Customers, Memberships
-- ============================================================================

-- ── cards: plantilla de programa de lealtad ─────────────────────────────────
create table public.cards (
  id                   uuid primary key default uuid_generate_v4(),
  org_id               uuid not null references public.organizations(id) on delete cascade,
  name                 text not null,
  description          text,
  points_per_checkin   int not null default 1 check (points_per_checkin > 0),
  points_for_reward    int not null check (points_for_reward > 0),
  reward_description   text not null,
  max_members          int check (max_members is null or max_members > 0),
  design               jsonb not null default '{}'::jsonb,
  active               boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger cards_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

create index cards_org_idx on public.cards(org_id) where active;

-- ── customers: clientes finales del negocio ─────────────────────────────────
create table public.customers (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  phone       text not null,
  name        text,
  email       citext,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, phone)
);

create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create index customers_org_phone_idx on public.customers(org_id, phone);
create index customers_name_trgm_idx on public.customers using gin (name gin_trgm_ops);

-- ── memberships: relación card ↔ customer ───────────────────────────────────
create table public.memberships (
  id            uuid primary key default uuid_generate_v4(),
  card_id       uuid not null references public.cards(id) on delete cascade,
  customer_id   uuid not null references public.customers(id) on delete cascade,
  slug          text not null unique,
  points        int not null default 0,  -- cache total, recalculable desde point_transactions
  joined_at     timestamptz not null default now(),
  last_activity_at timestamptz,
  unique (card_id, customer_id)
);

create index memberships_slug_idx on public.memberships(slug);
create index memberships_card_idx on public.memberships(card_id);
create index memberships_customer_idx on public.memberships(customer_id);

-- Trigger: generar slug único al crear
create or replace function public.assign_membership_slug()
returns trigger
language plpgsql
as $$
declare
  candidate text;
  attempts int := 0;
begin
  if new.slug is null or new.slug = '' then
    loop
      candidate := public.generate_membership_slug();
      exit when not exists (select 1 from public.memberships where slug = candidate);
      attempts := attempts + 1;
      if attempts > 10 then
        raise exception 'Could not generate unique membership slug after 10 attempts';
      end if;
    end loop;
    new.slug := candidate;
  end if;
  return new;
end;
$$;

create trigger memberships_slug_trigger
  before insert on public.memberships
  for each row execute function public.assign_membership_slug();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.cards enable row level security;
alter table public.customers enable row level security;
alter table public.memberships enable row level security;

-- cards: miembros de la org ven y gestionan sus cards
create policy "org members see cards"
  on public.cards for select
  using (public.is_org_member(org_id, auth.uid()));

create policy "org admins manage cards"
  on public.cards for all
  using (public.org_role_of(org_id, auth.uid()) in ('owner', 'admin'));

-- customers: miembros de la org ven y gestionan
create policy "org members see customers"
  on public.customers for select
  using (public.is_org_member(org_id, auth.uid()));

create policy "org members manage customers"
  on public.customers for all
  using (public.is_org_member(org_id, auth.uid()));

-- memberships: ver vía org de la card, o acceso público por slug (anon)
create policy "org members see memberships"
  on public.memberships for select
  using (exists (
    select 1 from public.cards c
    where c.id = card_id and public.is_org_member(c.org_id, auth.uid())
  ));

create policy "public read by slug"
  on public.memberships for select
  to anon
  using (true);  -- filtro por slug lo hace el cliente; info expuesta es mínima

create policy "org members create memberships"
  on public.memberships for insert
  with check (exists (
    select 1 from public.cards c
    where c.id = card_id and public.is_org_member(c.org_id, auth.uid())
  ));
