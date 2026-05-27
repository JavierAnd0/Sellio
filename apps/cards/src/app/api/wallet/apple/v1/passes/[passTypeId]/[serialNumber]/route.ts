import { NextResponse } from 'next/server';
import { PKPass } from 'passkit-generator';
import * as forge from 'node-forge';
import { createAdminClient } from '@sellio/db/admin';
import { verifyAppleAuthToken, generateAppleAuthToken } from '@/lib/wallet-updates';

type Params = Promise<{ passTypeId: string; serialNumber: string }>;

function extractToken(req: Request): string | null {
  const auth = req.headers.get('authorization') ?? '';
  const match = auth.match(/^ApplePass\s+(.+)$/i);
  return match?.[1] ?? null;
}

function hexToRgb(hex: string): string {
  if (hex.startsWith('rgb')) return hex;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

function extractCertsFromP12(p12Buffer: Buffer, passphrase?: string) {
  const p12 = forge.pkcs12.pkcs12FromAsn1(
    forge.asn1.fromDer(p12Buffer.toString('binary')),
    passphrase ?? '',
  );
  const bags = p12.getBags({});
  const certBag = (bags['1.2.840.113549.1.12.10.1.3'] ?? [])[0];
  const keyBag =
    (bags['1.2.840.113549.1.12.10.1.2'] ?? [])[0] ??
    (bags['1.2.840.113549.1.12.10.1.1'] ?? [])[0];
  if (!certBag?.cert || !keyBag?.key) throw new Error('Invalid .p12 file');
  return {
    signerCert: forge.pki.certificateToPem(certBag.cert),
    signerKey: forge.pki.privateKeyToPem(keyBag.key),
  };
}

// Serve updated pass — called by Apple when it needs to refresh
export async function GET(req: Request, { params }: { params: Params }) {
  const { serialNumber } = await params;
  const token = extractToken(req);

  if (!token || !verifyAppleAuthToken(serialNumber, token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const passTypeIdentifier = process.env.APPLE_PASS_TYPE_IDENTIFIER;
  const teamIdentifier = process.env.APPLE_TEAM_IDENTIFIER;
  const wwdrBase64 = process.env.APPLE_WWDR_CERTIFICATE;
  const p12Base64 = process.env.APPLE_PASS_CERTIFICATE;
  const passphrase = process.env.APPLE_PASS_CERTIFICATE_PWD;

  if (!passTypeIdentifier || !teamIdentifier || !wwdrBase64 || !p12Base64) {
    return NextResponse.json({ error: 'Apple Wallet not configured' }, { status: 503 });
  }

  const db = createAdminClient();
  const { data: membership } = await db
    .from('memberships')
    .select(
      `id, slug, points,
       cards ( name, points_for_reward, reward_description, design,
         organizations ( name, slug, primary_color ) ),
       customers ( name )`,
    )
    .eq('slug', serialNumber)
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const card = membership.cards as {
    name: string; points_for_reward: number; reward_description: string;
    design: Record<string, unknown> | null;
    organizations: { name: string; slug: string; primary_color: string } | null;
  } | null;
  const org = card?.organizations;
  const customer = membership.customers as { name: string | null } | null;

  const cardsBase = process.env.NEXT_PUBLIC_CARDS_URL ?? 'https://cards.sellio.app';
  const primaryHex =
    (card?.design && 'primaryColor' in card.design ? String(card.design.primaryColor) : null) ??
    org?.primary_color ?? '#E8341A';

  const authToken = generateAppleAuthToken(serialNumber);
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier,
    teamIdentifier,
    organizationName: org?.name ?? 'Sellio',
    serialNumber,
    description: card?.name ?? 'Tarjeta de puntos',
    backgroundColor: hexToRgb(primaryHex),
    foregroundColor: 'rgb(255, 255, 255)',
    labelColor: 'rgba(255, 255, 255, 0.75)',
    webServiceURL: `${cardsBase}/api/wallet/apple`,
    authenticationToken: authToken,
    barcodes: [{
      format: 'PKBarcodeFormatQR',
      message: org?.slug ? `${cardsBase}/check-in/${org.slug}` : `${cardsBase}/${serialNumber}`,
      messageEncoding: 'iso-8859-1',
      altText: 'Escanea para sumar puntos',
    }],
    storeCard: {
      primaryFields: [{ key: 'points', label: 'PUNTOS', value: `${membership.points} / ${card?.points_for_reward ?? '?'}` }],
      secondaryFields: [{ key: 'reward', label: 'PRÓXIMO PREMIO', value: card?.reward_description ?? '' }],
      auxiliaryFields: [{ key: 'holder', label: 'TITULAR', value: customer?.name ?? 'Cliente Sellio' }],
      backFields: [
        { key: 'instructions', label: 'Cómo acumular puntos', value: 'Escanea el código QR de este comercio en tu próxima visita para sumar puntos.' },
        { key: 'link', label: 'Ver mi tarjeta online', value: `${cardsBase}/${serialNumber}` },
      ],
    },
  };

  try {
    const { signerCert, signerKey } = extractCertsFromP12(
      Buffer.from(p12Base64, 'base64'),
      passphrase,
    );
    const transparentPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64',
    );
    const pass = new PKPass();
    pass.addBuffer('pass.json', Buffer.from(JSON.stringify(passJson)));
    pass.addBuffer('icon.png', transparentPng);
    pass.addBuffer('icon@2x.png', transparentPng);
    pass.addBuffer('logo.png', transparentPng);
    pass.addBuffer('logo@2x.png', transparentPng);
    pass.certificates = {
      wwdr: Buffer.from(wwdrBase64, 'base64'),
      signerCert,
      signerKey,
      signerKeyPassphrase: passphrase,
    };

    return new Response(new Uint8Array(pass.getAsBuffer()), {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Last-Modified': new Date().toUTCString(),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
