-- ============================================================================
-- Sellio — Cerrar lectura pública (anon) de memberships
-- ============================================================================
-- La policy original "public read by slug" usaba `using (true)`, lo que
-- permitía enumeración total de memberships vía la REST API de Supabase
-- con la anon key. Todas las rutas públicas (/[slug], /api/wallet/*,
-- /check-in/*) usan createAdminClient (service-role), así que la policy
-- anon no protegía ningún flujo legítimo.

drop policy if exists "public read by slug" on public.memberships;
