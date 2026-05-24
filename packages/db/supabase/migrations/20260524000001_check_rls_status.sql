-- ============================================================================
-- Sellio — Helper function to check Row Level Security (RLS) status
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_rls_status()
RETURNS TABLE (tablename text, rls_enabled boolean)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT t.tablename::text, t.rowsecurity
  FROM pg_tables t
  WHERE t.schemaname = 'public';
END;
$$ LANGUAGE plpgsql;
