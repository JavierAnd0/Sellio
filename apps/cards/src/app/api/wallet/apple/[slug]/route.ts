import { NextResponse } from 'next/server';

import { APPLE_WALLET_ENV_HELP, buildPassJson, getAppleWalletEnv, loadPassData, signPass } from '@/lib/apple-pass';

// Descarga inicial del pass ("Añadir a Apple Wallet")
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Validar la configuración ANTES de tocar la BD o generar el auth token:
  // generateAppleAuthToken lanza si falta WALLET_AUTH_SECRET.
  const env = getAppleWalletEnv();
  if (!env) {
    return NextResponse.json(
      { error: 'Apple Wallet not fully configured in this environment.', message: APPLE_WALLET_ENV_HELP },
      { status: 503 },
    );
  }

  const data = await loadPassData(slug);
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const passBuffer = signPass(buildPassJson(data, env), env);
    return new Response(new Uint8Array(passBuffer), {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="pass-${slug}.pkpass"`,
      },
    });
  } catch (err: unknown) {
    console.error('Error generating Apple Wallet Pass:', err);
    return NextResponse.json({ error: 'Failed to generate Apple Wallet Pass' }, { status: 500 });
  }
}
