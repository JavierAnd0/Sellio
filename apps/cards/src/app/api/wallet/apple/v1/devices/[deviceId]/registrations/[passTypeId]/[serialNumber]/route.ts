import { NextResponse } from 'next/server';
import { createAdminClient } from '@sellio/db/admin';
import { verifyAppleAuthToken } from '@/lib/wallet-updates';

type Params = Promise<{ deviceId: string; passTypeId: string; serialNumber: string }>;

function extractToken(req: Request): string | null {
  const auth = req.headers.get('authorization') ?? '';
  const match = auth.match(/^ApplePass\s+(.+)$/i);
  return match?.[1] ?? null;
}

// Register device for a pass
export async function POST(req: Request, { params }: { params: Params }) {
  const { deviceId, passTypeId, serialNumber } = await params;
  const token = extractToken(req);

  if (!token || !verifyAppleAuthToken(serialNumber, token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let pushToken: string | null = null;
  try {
    const body = (await req.json()) as { pushToken?: string };
    pushToken = body.pushToken ?? null;
  } catch {
    // empty body is fine
  }

  const db = createAdminClient();

  const { data: existing } = await db
    .from('wallet_registrations')
    .select('id')
    .eq('membership_slug', serialNumber)
    .eq('device_library_id', deviceId)
    .eq('pass_type_identifier', passTypeId)
    .maybeSingle();

  if (existing) {
    if (pushToken) {
      await db
        .from('wallet_registrations')
        .update({ push_token: pushToken })
        .eq('id', existing.id);
    }
    return new Response(null, { status: 200 });
  }

  await db.from('wallet_registrations').insert({
    membership_slug: serialNumber,
    platform: 'apple',
    device_library_id: deviceId,
    pass_type_identifier: passTypeId,
    push_token: pushToken,
  });

  return new Response(null, { status: 201 });
}

// Unregister device for a pass
export async function DELETE(_req: Request, { params }: { params: Params }) {
  const { deviceId, passTypeId, serialNumber } = await params;
  const token = extractToken(_req);

  if (!token || !verifyAppleAuthToken(serialNumber, token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createAdminClient();
  await db
    .from('wallet_registrations')
    .delete()
    .eq('membership_slug', serialNumber)
    .eq('device_library_id', deviceId)
    .eq('pass_type_identifier', passTypeId);

  return new Response(null, { status: 200 });
}
