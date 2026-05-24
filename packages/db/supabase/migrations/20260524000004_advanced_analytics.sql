-- ============================================================================
-- Sellio — RPC para Analíticas de Cohortes (Cohort Retention Query)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_cohort_retention(p_org_id uuid)
RETURNS TABLE (
  cohort_month text,
  new_users bigint,
  m1_retention numeric,
  m2_retention numeric,
  m3_retention numeric
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH first_visits AS (
    SELECT
      m.id AS membership_id,
      date_trunc('month', m.created_at) AS c_month
    FROM public.memberships m
    JOIN public.cards c ON m.card_id = c.id
    WHERE c.org_id = p_org_id
  ),
  subsequent_visits AS (
    SELECT DISTINCT
      t.membership_id,
      date_trunc('month', t.created_at) AS v_month
    FROM public.point_transactions t
    JOIN public.memberships m ON t.membership_id = m.id
    JOIN public.cards c ON m.card_id = c.id
    WHERE c.org_id = p_org_id AND t.type = 'earn'
  ),
  visit_offsets AS (
    SELECT
      fv.c_month,
      fv.membership_id,
      ((extract(year from sv.v_month) - extract(year from fv.c_month)) * 12 +
       (extract(month from sv.v_month) - extract(month from fv.c_month)))::int AS months_after
    FROM first_visits fv
    LEFT JOIN subsequent_visits sv ON fv.membership_id = sv.membership_id
  ),
  cohort_sizes AS (
    SELECT
      c_month,
      count(distinct membership_id) AS total_users
    FROM first_visits
    GROUP BY c_month
  ),
  retention_counts AS (
    SELECT
      c_month,
      count(distinct CASE WHEN months_after = 1 THEN membership_id END) AS m1_users,
      count(distinct CASE WHEN months_after = 2 THEN membership_id END) AS m2_users,
      count(distinct CASE WHEN months_after = 3 THEN membership_id END) AS m3_users
    FROM visit_offsets
    GROUP BY c_month
  )
  SELECT
    to_char(cs.c_month, 'YYYY-MM') AS cohort_month,
    cs.total_users AS new_users,
    round(coalesce(rc.m1_users::numeric / nullif(cs.total_users, 0), 0) * 100, 1) AS m1_retention,
    round(coalesce(rc.m2_users::numeric / nullif(cs.total_users, 0), 0) * 100, 1) AS m2_retention,
    round(coalesce(rc.m3_users::numeric / nullif(cs.total_users, 0), 0) * 100, 1) AS m3_retention
  FROM cohort_sizes cs
  LEFT JOIN retention_counts rc ON cs.c_month = rc.c_month
  ORDER BY cs.c_month DESC;
END;
$$ LANGUAGE plpgsql;
