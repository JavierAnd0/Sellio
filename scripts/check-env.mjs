import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

for (const file of ['.env', '.env.local', 'apps/web/.env.local', 'apps/cards/.env.local']) {
  loadEnvFile(file);
}

const requiredBase = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_CARDS_URL',
  'QR_SIGNING_SECRET',
];

const requiredServer = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'WOMPI_PUBLIC_KEY',
  'WOMPI_PRIVATE_KEY',
  'WOMPI_EVENTS_SECRET',
  'WOMPI_INTEGRITY_SECRET',
  'WALLET_AUTH_SECRET',
  'RESEND_API_KEY',
];

const requiredProduction = [
  'SENTRY_DSN',
  'NEXT_PUBLIC_SENTRY_DSN',
];

const optionalIntegrations = {
  googleWallet: [
    'GOOGLE_WALLET_ISSUER_ID',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
  ],
  appleWallet: [
    'APPLE_PASS_TYPE_IDENTIFIER',
    'APPLE_TEAM_IDENTIFIER',
    'APPLE_PASS_CERTIFICATE',
    'APPLE_PASS_CERTIFICATE_PWD',
    'APPLE_WWDR_CERTIFICATE',
  ],
};

const envName = process.env.SELLIO_ENV ?? process.env.NODE_ENV ?? 'development';
const strict = envName === 'production' || envName === 'staging' || process.env.CI === 'true';
const required = strict
  ? [...requiredBase, ...requiredServer, ...(envName === 'production' ? requiredProduction : [])]
  : ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_CARDS_URL'];

const missing = required.filter((key) => !process.env[key]);

for (const [name, keys] of Object.entries(optionalIntegrations)) {
  const present = keys.filter((key) => Boolean(process.env[key]));
  if (present.length > 0 && present.length < keys.length) {
    missing.push(`${name}: partial config (${keys.filter((key) => !process.env[key]).join(', ')})`);
  }
}

if (missing.length > 0) {
  console.error(`Sellio env check failed for ${envName}:`);
  for (const key of missing) console.error(`- ${key}`);
  process.exit(1);
}

console.log(`Sellio env check passed for ${envName}.`);

function loadEnvFile(file) {
  const path = resolve(file);
  if (!existsSync(path)) return;

  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    process.env[key] = rawValue
      .replace(/^['"]|['"]$/g, '')
      .trim();
  }
}
