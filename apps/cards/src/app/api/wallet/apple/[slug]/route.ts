import { NextResponse } from 'next/server';
import { PKPass } from 'passkit-generator';
import * as forge from 'node-forge';

import { createAdminClient } from '@sellio/db/admin';
import { generateAppleAuthToken } from '@/lib/wallet-updates';

// Helper to convert hex colors to Apple Wallet's rgb(r, g, b) format
function hexToRgb(hex: string): string {
  if (hex.startsWith('rgb')) return hex;
  
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

interface ExtractedCerts {
  signerCert: string;
  signerKey: string;
}

// Decodes a PKCS#12 (.p12) buffer and extracts both the certificate and private key in PEM format using node-forge
function extractCertificatesFromP12(p12Buffer: Buffer, passphrase?: string): ExtractedCerts {
  const p12Der = p12Buffer.toString('binary');
  const p12Asn1 = forge.asn1.fromDer(p12Der);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase || '');
  
  const bags = p12.getBags({});
  
  // Extract Certificate
  const certBags = bags['1.2.840.113549.1.12.10.1.3'] || [];
  if (certBags.length === 0 || !certBags[0]?.cert) {
    throw new Error('No valid certificates found in .p12 file');
  }
  const signerCert = forge.pki.certificateToPem(certBags[0].cert);
  
  // Extract Private Key (look in PKCS#8 shrouded key bags or plain key bags)
  const keyBags = bags['1.2.840.113549.1.12.10.1.2'] || bags['1.2.840.113549.1.12.10.1.1'] || [];
  if (keyBags.length === 0 || !keyBags[0]?.key) {
    throw new Error('No valid private key found in .p12 file');
  }
  const signerKey = forge.pki.privateKeyToPem(keyBags[0].key);
  
  return { signerCert, signerKey };
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = createAdminClient();

  const { data: membership } = await db
    .from('memberships')
    .select(
      `id, slug, points,
       cards ( name, points_for_reward, reward_description, design,
         organizations ( name, slug, primary_color ) ),
       customers ( name )`,
    )
    .eq('slug', slug)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const card = membership.cards as {
    name: string;
    points_for_reward: number;
    reward_description: string;
    design: Record<string, unknown> | null;
    organizations: { name: string; slug: string; primary_color: string } | null;
  } | null;

  const org = card?.organizations;
  const customer = membership.customers as { name: string | null } | null;

  const primaryColorHex =
    (card?.design && 'primaryColor' in card.design ? String(card.design.primaryColor) : null) ??
    org?.primary_color ??
    '#E8341A';

  const primaryColor = hexToRgb(primaryColorHex);
  const foregroundColor = 'rgb(255, 255, 255)';
  const labelColor = 'rgba(255, 255, 255, 0.75)';

  const cardsBase = process.env.NEXT_PUBLIC_CARDS_URL ?? 'https://cards.sellio.app';
  const cardUrl = `${cardsBase}/${slug}`;
  const checkInUrl = org?.slug ? `${cardsBase}/check-in/${org.slug}` : cardUrl;

  const authToken = generateAppleAuthToken(slug);
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER || 'pass.com.sellio.loyalty',
    teamIdentifier: process.env.APPLE_TEAM_IDENTIFIER || 'ABC1234DEF',
    organizationName: org?.name ?? 'Sellio',
    serialNumber: slug,
    description: card?.name ?? 'Tarjeta de puntos',
    backgroundColor: primaryColor,
    foregroundColor,
    labelColor,
    webServiceURL: `${cardsBase}/api/wallet/apple`,
    authenticationToken: authToken,
    barcodes: [
      {
        format: 'PKBarcodeFormatQR',
        message: checkInUrl,
        messageEncoding: 'iso-8859-1',
        altText: 'Escanea para sumar puntos',
      },
    ],
    storeCard: {
      primaryFields: [
        {
          key: 'points',
          label: 'PUNTOS',
          value: `${membership.points} / ${card?.points_for_reward ?? '?'}`,
        },
      ],
      secondaryFields: [
        {
          key: 'reward',
          label: 'PRÓXIMO PREMIO',
          value: card?.reward_description ?? '',
        },
      ],
      auxiliaryFields: [
        {
          key: 'holder',
          label: 'TITULAR',
          value: customer?.name ?? 'Cliente Sellio',
        },
      ],
      backFields: [
        {
          key: 'instructions',
          label: 'Cómo acumular puntos',
          value: 'Escanea el código QR de este comercio en tu próxima visita para sumar puntos y ganar increíbles recompensas.',
        },
        {
          key: 'link',
          label: 'Ver mi tarjeta online',
          value: cardUrl,
        },
      ],
    },
  };

  const passTypeIdentifier = process.env.APPLE_PASS_TYPE_IDENTIFIER;
  const teamIdentifier = process.env.APPLE_TEAM_IDENTIFIER;
  const wwdrCertBase64 = process.env.APPLE_WWDR_CERTIFICATE;
  const signerCertBase64 = process.env.APPLE_PASS_CERTIFICATE;
  const signerKeyPassphrase = process.env.APPLE_PASS_CERTIFICATE_PWD;

  const isConfigured = passTypeIdentifier && teamIdentifier && wwdrCertBase64 && signerCertBase64;

  if (!isConfigured) {
    // Return a mock pass payload/instructions in local development when certs are not configured
    return NextResponse.json(
      {
        error: 'Apple Wallet not fully configured in this environment.',
        message: 'Set env vars: APPLE_PASS_TYPE_IDENTIFIER, APPLE_TEAM_IDENTIFIER, APPLE_PASS_CERTIFICATE, APPLE_WWDR_CERTIFICATE',
        debug: {
          passJson,
        },
      },
      { status: 503 },
    );
  }

  try {
    const wwdrBuffer = Buffer.from(wwdrCertBase64, 'base64');
    const p12Buffer = Buffer.from(signerCertBase64, 'base64');

    const { signerCert, signerKey } = extractCertificatesFromP12(p12Buffer, signerKeyPassphrase);

    const pass = new PKPass();
    pass.addBuffer('pass.json', Buffer.from(JSON.stringify(passJson)));

    // Add a tiny 1x1 transparent PNG as the icon & logo so that the pass is valid and compiles cleanly
    const transparentPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64',
    );
    pass.addBuffer('icon.png', transparentPng);
    pass.addBuffer('icon@2x.png', transparentPng);
    pass.addBuffer('logo.png', transparentPng);
    pass.addBuffer('logo@2x.png', transparentPng);

    // Apply the certificates
    pass.certificates = {
      wwdr: wwdrBuffer,
      signerCert,
      signerKey,
      signerKeyPassphrase,
    };

    const passBuffer = pass.getAsBuffer();

    return new Response(new Uint8Array(passBuffer), {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="pass-${slug}.pkpass"`,
      },
    });
  } catch (err: any) {
    console.error('Error generating Apple Wallet Pass:', err);
    return NextResponse.json(
      { error: 'Failed to generate Apple Wallet Pass', details: err.message },
      { status: 500 },
    );
  }
}
