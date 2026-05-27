import { NextResponse } from 'next/server';
import { createAdminClient } from '@sellio/db/admin';

type Params = Promise<{ deviceId: string; passTypeId: string }>;

// List serial numbers (passes) updated since a given tag
export async function GET(req: Request, { params }: { params: Params }) {
  const { deviceId, passTypeId } = await params;
  const { searchParams } = new URL(req.url);
  const updatedSince = searchParams.get('passesUpdatedSince');

  const db = createAdminClient();

  const { data: registrations } = await db
    .from('wallet_registrations')
    .select('membership_slug')
    .eq('device_library_id', deviceId)
    .eq('pass_type_identifier', passTypeId);

  if (!registrations || registrations.length === 0) {
    return new Response(null, { status: 204 });
  }

  const slugs = registrations.map((r) => r.membership_slug);

  let query = db
    .from('memberships')
    .select('slug, last_activity_at')
    .in('slug', slugs);

  if (updatedSince) {
    query = query.gt('last_activity_at', updatedSince);
  }

  const { data: updated } = await query;

  if (!updated || updated.length === 0) {
    return new Response(null, { status: 204 });
  }

  const lastUpdated = updated
    .map((m) => m.last_activity_at ?? '')
    .sort()
    .at(-1) ?? new Date().toISOString();

  return NextResponse.json({
    lastUpdated,
    serialNumbers: updated.map((m) => m.slug),
  });
}
