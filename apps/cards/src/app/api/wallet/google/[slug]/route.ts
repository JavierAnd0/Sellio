import { NextResponse } from 'next/server';

import { createAdminClient } from '@sellio/db/admin';
import { getGoogleWalletConfig, googleObjectId, signGoogleJwt } from '@sellio/db/google-wallet';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const config = getGoogleWalletConfig();
  if (!config) {
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

  const classId = `${config.issuerId}.${process.env.GOOGLE_WALLET_CLASS_ID ?? 'sellio_loyalty'}`;
  const objectId = googleObjectId(config.issuerId, slug);

  const jwtPayload = {
    iss: config.saEmail,
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

  // Registrar que este pass se guardó en Google Wallet (para contar el alcance
  // de las campañas). Google no confirma el guardado: cuenta la intención.
  // device_library_id es null → la constraint única no deduplica: comprobamos antes.
  const { data: existing } = await db
    .from('wallet_registrations')
    .select('id')
    .eq('platform', 'google')
    .eq('membership_slug', membership.slug)
    .maybeSingle();
  if (!existing) {
    await db.from('wallet_registrations').insert({ membership_slug: membership.slug, platform: 'google' });
  }

  const token = signGoogleJwt(jwtPayload, config.saPrivateKey);
  return NextResponse.redirect(`https://pay.google.com/gp/v/save/${token}`);
}
