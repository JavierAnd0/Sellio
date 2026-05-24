/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in the environment.');
  process.exit(1);
}

// Operational tables that are allowed to not have RLS (handled by system role or server-only)
const EXCLUDED_TABLES = [
  'qr_nonces',
  'rate_limits',
  'webhook_events',
  'schema_migrations', // Supabase migrations table
];

async function verifyRLS() {
  console.log('🔍 Verifying Row Level Security (RLS) on all public tables via RPC...');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const { data: tables, error } = await supabase.rpc('check_rls_status');

    if (error) {
      throw error;
    }

    if (!tables || !Array.isArray(tables)) {
      throw new Error('No tables returned or response is not an array.');
    }

    let failed = false;
    const rlsDisabledTables: string[] = [];

    console.log('\nTable Status:');
    for (const table of tables as { tablename: string; rls_enabled: boolean }[]) {
      const isExcluded = EXCLUDED_TABLES.includes(table.tablename);
      const rlsEnabled = table.rls_enabled;

      if (rlsEnabled) {
        console.log(`  ✅ ${table.tablename}: RLS Enabled`);
      } else if (isExcluded) {
        console.log(`  ⚠️  ${table.tablename}: RLS Disabled (Excluded/Allowed)`);
      } else {
        console.log(`  ❌ ${table.tablename}: RLS DISABLED`);
        failed = true;
        rlsDisabledTables.push(table.tablename);
      }
    }

    if (failed) {
      console.error('\n❌ Security Audit Failed!');
      console.error(`The following tables do not have Row Level Security enabled: ${rlsDisabledTables.join(', ')}`);
      console.error('Please add "ALTER TABLE public.<tablename> ENABLE ROW LEVEL SECURITY;" to a migration.');
      process.exit(1);
    } else {
      console.log('\n✅ Security Audit Passed! All required tables have Row Level Security enabled.');
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Error executing RLS verification audit:', err);
    console.error('Make sure the "check_rls_status" function has been deployed to Supabase via migration.');
    process.exit(1);
  }
}

verifyRLS();
