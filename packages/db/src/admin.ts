import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import type { Database } from './types';

/**
 * Cliente Supabase con service-role key.
 *
 * ⚠️  CRÍTICO: NUNCA importar este módulo en código que corra en el cliente.
 * El service-role bypass RLS. Úsalo SOLO en:
 *   - Route Handlers (`app/api/**`)
 *   - Server Actions con validación explícita de permisos
 *   - Scripts (seeds, migrations, jobs)
 *
 * Si necesitas llamar desde el cliente, expón una Route Handler que
 * valide permisos y luego use este cliente internamente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables',
    );
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
