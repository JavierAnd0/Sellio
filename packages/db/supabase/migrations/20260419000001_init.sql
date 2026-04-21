-- ============================================================================
-- Sellio — Migración inicial: extensiones, enums, helpers
-- ============================================================================
-- Esta migración establece los cimientos sobre los que se construyen todas las
-- demás. No modificar extensiones ni enums sin migración dedicada.
-- ============================================================================

-- ── Extensiones ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";    -- búsqueda fuzzy (nombres, emails)
create extension if not exists "citext";     -- emails case-insensitive

-- ── Enums ───────────────────────────────────────────────────────────────────
create type org_role as enum ('owner', 'admin', 'cashier');
create type org_plan as enum ('free', 'basic', 'elite');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
create type payment_provider as enum ('wompi', 'stripe');
create type point_tx_type as enum ('earn', 'redeem', 'adjust', 'expire');
create type point_tx_source as enum ('checkin', 'manual', 'referral', 'admin', 'import');

-- ── Helpers ─────────────────────────────────────────────────────────────────

-- Trigger genérico para actualizar updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helper para generar slugs url-safe a partir de texto
create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select regexp_replace(
    regexp_replace(
      lower(trim(input)),
      '[^a-z0-9]+', '-', 'g'
    ),
    '(^-|-$)', '', 'g'
  );
$$;

-- Helper para generar membership slugs únicos (8 chars alfanuméricos)
create or replace function public.generate_membership_slug()
returns text
language plpgsql
as $$
declare
  chars text := 'abcdefghijkmnpqrstuvwxyz23456789';  -- sin 0/O/1/l/i (ambiguos)
  result text := '';
  i int;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;
