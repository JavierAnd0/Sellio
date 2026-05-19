-- ============================================================================
-- Sellio — Añadir plan 'enterprise' al enum org_plan
-- ============================================================================
-- ALTER TYPE ... ADD VALUE es seguro en Postgres 9.1+. No requiere lock
-- exclusivo en la tabla — solo en el tipo.
-- ============================================================================

ALTER TYPE public.org_plan ADD VALUE IF NOT EXISTS 'enterprise';
