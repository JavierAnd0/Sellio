-- ============================================================================
-- Sellio — NPS Responses + Onboarding Tracking + M3 KPIs RPC
-- ============================================================================

-- ── NPS Responses ─────────────────────────────────────────────────────────
CREATE TABLE public.nps_responses (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid    NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  score         integer NOT NULL CHECK (score >= 0 AND score <= 10),
  comment       text,
  responded_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;

-- Owners pueden insertar y ver sus propias respuestas NPS
CREATE POLICY "owners submit nps"
  ON public.nps_responses FOR ALL
  USING (public.org_role_of(org_id, auth.uid()) = 'owner');

-- ── Onboarding tracking en organizations ──────────────────────────────────
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- ── Función RPC: KPIs consolidados M3 (solo service_role via SECURITY DEFINER) ──
-- Devuelve una sola fila con todas las métricas clave del fundador.
CREATE OR REPLACE FUNCTION public.get_m3_kpis()
RETURNS TABLE (
  total_orgs           bigint,
  paying_orgs          bigint,
  elite_orgs           bigint,
  mrr_cop              numeric,
  churn_rate_30d       numeric,
  nps_score            numeric,
  nps_count            bigint,
  avg_onboarding_mins  numeric
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH
  -- Comercios con suscripción activa
  active_subs AS (
    SELECT DISTINCT org_id
    FROM public.subscriptions
    WHERE status = 'active'
  ),
  -- Comercios que expiraron en los últimos 30 días (churn)
  churned AS (
    SELECT DISTINCT org_id
    FROM public.subscriptions
    WHERE status IN ('canceled', 'past_due')
      AND updated_at >= now() - INTERVAL '30 days'
  ),
  -- Comercios que estaban activos hace 30 días
  active_30d_ago AS (
    SELECT DISTINCT org_id
    FROM public.subscriptions
    WHERE status = 'active'
      AND current_period_start <= now() - INTERVAL '30 days'
  ),
  -- MRR: facturas pagadas en los últimos 30 días
  mrr AS (
    SELECT coalesce(SUM(amount_cents) / 100.0, 0) AS value
    FROM public.invoices
    WHERE status = 'paid'
      AND currency = 'COP'
      AND paid_at >= now() - INTERVAL '30 days'
  ),
  -- NPS: cálculo del score (% promotores 9-10 - % detractores 0-6)
  nps AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE score >= 9) AS promoters,
      COUNT(*) FILTER (WHERE score <= 6) AS detractors
    FROM public.nps_responses
  ),
  -- Onboarding: promedio de minutos desde creación hasta primera tarjeta
  onboarding AS (
    SELECT
      AVG(
        EXTRACT(EPOCH FROM (onboarding_completed_at - created_at)) / 60.0
      ) AS avg_mins
    FROM public.organizations
    WHERE onboarding_completed_at IS NOT NULL
  )
  SELECT
    (SELECT COUNT(*) FROM public.organizations)::bigint                        AS total_orgs,
    (SELECT COUNT(*) FROM active_subs)::bigint                                 AS paying_orgs,
    (SELECT COUNT(*) FROM public.organizations WHERE plan IN ('elite','enterprise'))::bigint AS elite_orgs,
    (SELECT value FROM mrr)                                                    AS mrr_cop,
    -- Churn: churned / active_30d_ago (si no hay datos, 0)
    CASE
      WHEN (SELECT COUNT(*) FROM active_30d_ago) = 0 THEN 0
      ELSE ROUND(
        (SELECT COUNT(*) FROM churned)::numeric /
        (SELECT COUNT(*) FROM active_30d_ago)::numeric * 100, 1
      )
    END                                                                        AS churn_rate_30d,
    -- NPS score = (promotores - detractores) / total * 100
    CASE
      WHEN (SELECT total FROM nps) = 0 THEN NULL
      ELSE ROUND(
        ((SELECT promoters FROM nps) - (SELECT detractors FROM nps))::numeric /
        (SELECT total FROM nps)::numeric * 100, 1
      )
    END                                                                        AS nps_score,
    (SELECT total FROM nps)::bigint                                            AS nps_count,
    (SELECT ROUND(avg_mins::numeric, 1) FROM onboarding)                      AS avg_onboarding_mins;
END;
$$;
