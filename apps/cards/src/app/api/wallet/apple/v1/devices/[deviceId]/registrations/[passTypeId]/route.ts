import { NextResponse } from 'next/server';

import { createAdminClient } from '@sellio/db/admin';
import { passUpdatedAt } from '@sellio/db/wallet-campaigns';

type Params = Promise<{ deviceId: string; passTypeId: string }>;

// List serial numbers (passes) updated since a given tag.
// Un pass cambia por actividad de puntos o por una campaña enviada a su tarjeta.
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

  const { data: memberships } = await db
    .from('memberships')
    .select('slug, card_id, last_activity_at, cards ( org_id )')
    .in('slug', registrations.map((r) => r.membership_slug));

  const rows = (memberships ?? []).map((m) => ({
    slug: m.slug,
    card_id: m.card_id,
    last_activity_at: m.last_activity_at,
    org_id: (m.cards as { org_id: string } | null)?.org_id ?? '',
  }));

  const orgIds = [...new Set(rows.map((r) => r.org_id).filter(Boolean))];
  let campaignsQuery = db
    .from('campaigns')
    .select('org_id, card_id, sent_at')
    .eq('status', 'sent')
    .in('org_id', orgIds.length ? orgIds : ['00000000-0000-0000-0000-000000000000']);
  if (updatedSince) campaignsQuery = campaignsQuery.gt('sent_at', updatedSince);
  const { data: campaignRows } = await campaignsQuery;
  const campaigns = (campaignRows ?? []).filter(
    (c): c is { org_id: string; card_id: string | null; sent_at: string } => !!c.sent_at,
  );

  const updated = rows
    .map((r) => ({ slug: r.slug, at: passUpdatedAt(r, campaigns) }))
    .filter((r): r is { slug: string; at: string } => {
      if (!r.at) return false;
      return !updatedSince || new Date(r.at) > new Date(updatedSince);
    });

  if (updated.length === 0) {
    return new Response(null, { status: 204 });
  }

  const lastUpdated = updated
    .map((u) => new Date(u.at).toISOString())
    .sort()
    .at(-1)!;

  return NextResponse.json({
    lastUpdated,
    serialNumbers: updated.map((u) => u.slug),
  });
}
