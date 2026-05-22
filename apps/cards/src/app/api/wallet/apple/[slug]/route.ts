/**
 * Apple Wallet pass endpoint — scaffold.
 *
 * To activate:
 *  1. Enroll in Apple Developer Program (developer.apple.com)
 *  2. Create a Pass Type ID  (Certificates, IDs & Profiles → Identifiers)
 *  3. Generate a Pass Type Certificate and export as .p12
 *  4. Download the Apple WWDR G4 intermediate cert
 *  5. Convert both to base-64 and set the env vars below
 *  6. Install passkit-generator:  pnpm add passkit-generator  (in apps/cards)
 *  7. Replace this file with the real implementation (see comments below)
 *
 * Required env vars:
 *   APPLE_PASS_TYPE_IDENTIFIER   e.g. pass.com.sellio.loyalty
 *   APPLE_TEAM_IDENTIFIER        e.g. ABC1234DEF
 *   APPLE_PASS_CERTIFICATE       base-64 encoded .p12 certificate
 *   APPLE_PASS_CERTIFICATE_PWD   password for the .p12
 *   APPLE_WWDR_CERTIFICATE       base-64 encoded Apple WWDR G4 cert
 */

import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: _slug } = await params;

  return NextResponse.json(
    {
      error: 'Apple Wallet not yet configured.',
      setup: 'See APPLE_PASS_TYPE_IDENTIFIER, APPLE_TEAM_IDENTIFIER, APPLE_PASS_CERTIFICATE env vars.',
    },
    { status: 503 },
  );
}
