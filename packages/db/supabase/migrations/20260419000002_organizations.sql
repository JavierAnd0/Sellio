-- ============================================================================
-- Sellio — Profiles, Organizations, Members
-- ============================================================================

-- ── profiles: extiende auth.users ───────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Trigger: al crear un auth.users, crear su profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── organizations: el negocio (cafetería, restaurante) ──────────────────────
create table public.organizations (
  id              uuid primary key default uuid_generate_v4(),
  slug            text not null unique,
  name            text not null,
  logo_url        text,
  primary_color   text default '#E8341A',
  country         text not null default 'CO',
  timezone        text not null default 'America/Bogota',
  plan            org_plan not null default 'free',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint orgs_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 3 and 40)
);

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create index organizations_slug_idx on public.organizations(slug);

-- ── organization_members ────────────────────────────────────────────────────
create table public.organization_members (
  org_id      uuid not null references public.organizations(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        org_role not null default 'cashier',
  invited_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index organization_members_user_idx on public.organization_members(user_id);

-- ── Helper function: user pertenece a org? ──────────────────────────────────
create or replace function public.is_org_member(p_org_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.organization_members
    where org_id = p_org_id and user_id = p_user_id
  );
$$;

create or replace function public.org_role_of(p_org_id uuid, p_user_id uuid)
returns org_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.organization_members
  where org_id = p_org_id and user_id = p_user_id;
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- profiles: cada user ve y edita solo el suyo
create policy "users see own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- organizations: miembros ven su org; solo owner/admin edita
create policy "members see their orgs"
  on public.organizations for select
  using (public.is_org_member(id, auth.uid()));

create policy "admins update their orgs"
  on public.organizations for update
  using (public.org_role_of(id, auth.uid()) in ('owner', 'admin'));

create policy "authenticated users create orgs"
  on public.organizations for insert
  with check (auth.uid() is not null);

-- organization_members: miembros ven miembros de su org; owner gestiona
create policy "members see co-members"
  on public.organization_members for select
  using (public.is_org_member(org_id, auth.uid()));

create policy "owners manage members"
  on public.organization_members for all
  using (public.org_role_of(org_id, auth.uid()) = 'owner');
