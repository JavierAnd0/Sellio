-- ============================================================================
-- Sellio — Point transactions, redemptions, QR nonces (append-only)
-- ============================================================================
-- Principio: todo lo que toca dinero/puntos es append-only. Nunca UPDATE ni
-- DELETE. Corregir errores mediante una nueva transacción de tipo 'adjust'.
-- ============================================================================

-- ── point_transactions: ledger append-only ──────────────────────────────────
create table public.point_transactions (
  id                uuid primary key default uuid_generate_v4(),
  membership_id     uuid not null references public.memberships(id) on delete cascade,
  type              point_tx_type not null,
  points            int not null,  -- positivo para earn, negativo para redeem/expire
  source            point_tx_source not null,
  idempotency_key   text unique,   -- previene double-submit
  metadata          jsonb not null default '{}'::jsonb,  -- ip, user_agent, location
  created_at        timestamptz not null default now(),
  created_by        uuid references auth.users(id)  -- null si es auto (checkin del cliente)
);

-- Indices para queries comunes
create index pt_membership_idx on public.point_transactions(membership_id, created_at desc);
create index pt_created_idx on public.point_transactions(created_at desc);

-- Regla: no UPDATE ni DELETE en esta tabla
create or replace function public.block_point_tx_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'point_transactions is append-only. Use a new row to correct errors.';
end;
$$;

create trigger pt_no_update
  before update on public.point_transactions
  for each row execute function public.block_point_tx_mutation();

create trigger pt_no_delete
  before delete on public.point_transactions
  for each row execute function public.block_point_tx_mutation();

-- Trigger: al insertar, actualizar cache de points en memberships
create or replace function public.update_membership_points()
returns trigger
language plpgsql
as $$
begin
  update public.memberships
  set points = points + new.points,
      last_activity_at = now()
  where id = new.membership_id;
  return new;
end;
$$;

create trigger pt_sync_membership
  after insert on public.point_transactions
  for each row execute function public.update_membership_points();

-- ── redemptions: registro de canjes ─────────────────────────────────────────
create table public.redemptions (
  id                uuid primary key default uuid_generate_v4(),
  membership_id     uuid not null references public.memberships(id) on delete cascade,
  point_tx_id       uuid not null references public.point_transactions(id),
  points_used       int not null check (points_used > 0),
  reward_snapshot   jsonb not null,  -- snapshot del reward al momento (campo reward_description + design)
  redeemed_at       timestamptz not null default now(),
  redeemed_by       uuid not null references auth.users(id)
);

create index redemptions_membership_idx on public.redemptions(membership_id, redeemed_at desc);

-- ── qr_nonces: previene replay attacks en QR dinámicos ──────────────────────
create table public.qr_nonces (
  nonce         text primary key,
  membership_id uuid not null references public.memberships(id) on delete cascade,
  used_at       timestamptz,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);

create index qr_nonces_expires_idx on public.qr_nonces(expires_at);

-- Función de limpieza (correr con pg_cron cada hora)
create or replace function public.cleanup_expired_qr_nonces()
returns int
language plpgsql
as $$
declare
  deleted_count int;
begin
  delete from public.qr_nonces where expires_at < now() - interval '1 hour';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- ── rate_limits: rate limiting en DB (hasta M3, luego Upstash Redis) ────────
create table public.rate_limits (
  key         text not null,
  window_start timestamptz not null,
  count       int not null default 1,
  primary key (key, window_start)
);

create index rate_limits_window_idx on public.rate_limits(window_start);

create or replace function public.increment_rate_limit(
  p_key text,
  p_window_seconds int
)
returns int
language plpgsql
as $$
declare
  current_window timestamptz;
  current_count int;
begin
  -- Ventana actual (redondeada)
  current_window := date_trunc('minute', now()) +
                    make_interval(secs => floor(extract(second from now())::int / p_window_seconds) * p_window_seconds);

  insert into public.rate_limits (key, window_start, count)
  values (p_key, current_window, 1)
  on conflict (key, window_start)
    do update set count = public.rate_limits.count + 1
  returning count into current_count;

  return current_count;
end;
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.point_transactions enable row level security;
alter table public.redemptions enable row level security;
alter table public.qr_nonces enable row level security;
alter table public.rate_limits enable row level security;

-- point_transactions: miembros de la org ven las de sus memberships
create policy "org members see point tx"
  on public.point_transactions for select
  using (exists (
    select 1 from public.memberships m
    join public.cards c on c.id = m.card_id
    where m.id = membership_id and public.is_org_member(c.org_id, auth.uid())
  ));

create policy "org members insert point tx"
  on public.point_transactions for insert
  with check (exists (
    select 1 from public.memberships m
    join public.cards c on c.id = m.card_id
    where m.id = membership_id and public.is_org_member(c.org_id, auth.uid())
  ));

-- redemptions: mismo patrón
create policy "org members see redemptions"
  on public.redemptions for select
  using (exists (
    select 1 from public.memberships m
    join public.cards c on c.id = m.card_id
    where m.id = membership_id and public.is_org_member(c.org_id, auth.uid())
  ));

create policy "org members create redemptions"
  on public.redemptions for insert
  with check (exists (
    select 1 from public.memberships m
    join public.cards c on c.id = m.card_id
    where m.id = membership_id and public.is_org_member(c.org_id, auth.uid())
  ));

-- qr_nonces y rate_limits: solo accesible via service_role (nunca desde cliente)
-- No creamos policies → nadie excepto service_role puede leer/escribir
