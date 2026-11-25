import { NextResponse } from 'next/server';

import { buildPassJson, getAppleWalletEnv, loadPassData, signPass } from '@/lib/apple-pass';
import { verifyAppleAuthToken } from '@/lib/wallet-updates';

type Params = Promise<{ passTypeId: string; serialNumber: string }>;

function extractToken(req: Request): string | null {
  const auth = req.headers.get('authorization') ?? '';
  const match = auth.match(/^ApplePass\s+(.+)$/i);
  return match?.[1] ?? null;
}

// Serve updated pass — called by Apple when it needs to refresh
export async function GET(req: Request, { params }: { params: Params }) {
  const { serialNumber } = await params;

  const env = getAppleWalletEnv();
  if (!env) return NextResponse.json({ error: 'Apple Wallet not configured' }, { status: 503 });

  const token = extractToken(req);
  if (!token || !verifyAppleAuthToken(serialNumber, token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await loadPassData(serialNumber);
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    return new Response(new Uint8Array(signPass(buildPassJson(data, env), env)), {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Last-Modified': new Date().toUTCString(),
      },
    });
  } catch (err: unknown) {
    console.error('Error generating updated Apple Wallet Pass:', err);
    return NextResponse.json({ error: 'Failed to generate pass' }, { status: 500 });
  }
}
