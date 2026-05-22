import crypto from 'crypto';
import { NextResponse } from 'next/server';

import { createAdminClient } from '@sellio/db/admin';

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID ?? '';
const CLASS_SUFFIX = process.env.GOOGLE_WALLET_CLASS_ID ?? 'sellio_loyalty';
const SA_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '';
const SA_PRIVATE_KEY = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

function signJwt(payload: object, privateKey: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${header}.${body}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(data);
  return `${data}.${signer.sign(privateKey, 'base64url')}`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!ISSUER_ID || !SA_EMAIL || !SA_PRIVATE_KEY) {
    return NextResponse.json(
      { error: 'Google Wallet not configured. Set GOOGLE_WALLET_ISSUER_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.' },
      { status: 503 },
    );
  }

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

  const primaryColor =
    (card?.design && 'primaryColor' in card.design ? String(card.design.primaryColor) : null) ??
    org?.primary_color ??
    '#E8341A';

  const cardsBase = process.env.NEXT_PUBLIC_CARDS_URL ?? 'https://cards.sellio.app';
  const cardUrl = `${cardsBase}/${slug}`;
  const checkInUrl = org?.slug ? `${cardsBase}/check-in/${org.slug}` : cardUrl;

  const classId = `${ISSUER_ID}.${CLASS_SUFFIX}`;
  const objectId = `${ISSUER_ID}.${slug.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  const jwtPayload = {
    iss: SA_EMAIL,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: ['https://sellio.app', cardsBase],
    payload: {
      genericClasses: [
        {
          id: classId,
          multipleDevicesAndHoldersAllowedStatus: 'MULTIPLE_HOLDERS',
        },
      ],
      genericObjects: [
        {
          id: objectId,
          classId,
          state: 'ACTIVE',
          cardTitle: {
            defaultValue: { language: 'es', value: org?.name ?? 'Sellio' },
          },
          subheader: {
            defaultValue: { language: 'es', value: card?.name ?? 'Tarjeta de puntos' },
          },
          header: {
            defaultValue: {
              language: 'es',
              value: `${membership.points} / ${card?.points_for_reward ?? '?'} pts`,
            },
          },
          ...(customer?.name
            ? {
                textModulesData: [
                  { id: 'holder', header: 'Titular', body: customer.name },
                  { id: 'reward', header: 'Premio', body: card?.reward_description ?? '' },
                ],
              }
            : {
                textModulesData: [
                  { id: 'reward', header: 'Premio', body: card?.reward_description ?? '' },
                ],
              }),
          barcode: {
            type: 'QR_CODE',
            value: checkInUrl,
            alternateText: 'Escanea para sumar puntos',
          },
          hexBackgroundColor: primaryColor,
          logo: {
            sourceUri: { uri: 'https://sellio.app/icon-192.png' },
            contentDescription: { defaultValue: { language: 'es', value: 'Sellio' } },
          },
          linksModuleData: {
            uris: [{ id: 'card', uri: cardUrl, description: 'Ver mi tarjeta' }],
          },
        },
      ],
    },
  };

  const token = signJwt(jwtPayload, SA_PRIVATE_KEY);
  return NextResponse.redirect(`https://pay.google.com/gp/v/save/${token}`);
}
