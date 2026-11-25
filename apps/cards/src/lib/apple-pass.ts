import { PKPass } from 'passkit-generator';

import { createAdminClient } from '@sellio/db/admin';
import { extractPemFromP12 } from '@sellio/db/apple-wallet';
import { getLatestCampaignForCard, type CampaignMessage } from '@sellio/db/wallet-campaigns';

import { generateAppleAuthToken } from '@/lib/wallet-updates';

/**
 * Construcción del .pkpass, compartida por la descarga inicial
 * (/api/wallet/apple/[slug]) y por la actualización que pide Apple
 * (/api/wallet/apple/v1/passes/...).
 */

export interface AppleWalletEnv {
  passTypeIdentifier: string;
  teamIdentifier: string;
  wwdrBase64: string;
  p12Base64: string;
  p12Passphrase: string | undefined;
}

/** null si falta algo — incluido WALLET_AUTH_SECRET, que firma el auth token. */
export function getAppleWalletEnv(env: Record<string, string | undefined> = process.env): AppleWalletEnv | null {
  const { APPLE_PASS_TYPE_IDENTIFIER, APPLE_TEAM_IDENTIFIER, APPLE_WWDR_CERTIFICATE, APPLE_PASS_CERTIFICATE } = env;
  if (!APPLE_PASS_TYPE_IDENTIFIER || !APPLE_TEAM_IDENTIFIER || !APPLE_WWDR_CERTIFICATE || !APPLE_PASS_CERTIFICATE) {
    return null;
  }
  if (!env.WALLET_AUTH_SECRET) return null;
  return {
    passTypeIdentifier: APPLE_PASS_TYPE_IDENTIFIER,
    teamIdentifier: APPLE_TEAM_IDENTIFIER,
    wwdrBase64: APPLE_WWDR_CERTIFICATE,
    p12Base64: APPLE_PASS_CERTIFICATE,
    p12Passphrase: env.APPLE_PASS_CERTIFICATE_PWD,
  };
}

export const APPLE_WALLET_ENV_HELP =
  'Set env vars: APPLE_PASS_TYPE_IDENTIFIER, APPLE_TEAM_IDENTIFIER, APPLE_PASS_CERTIFICATE, APPLE_WWDR_CERTIFICATE, WALLET_AUTH_SECRET';

export interface PassData {
  slug: string;
  points: number;
  cardName: string | null;
  pointsForReward: number | null;
  rewardDescription: string | null;
  primaryColorHex: string;
  orgName: string | null;
  orgSlug: string | null;
  customerName: string | null;
  campaign: CampaignMessage | null;
}

export async function loadPassData(slug: string): Promise<PassData | null> {
  const db = createAdminClient();
  const { data: membership } = await db
    .from('memberships')
    .select(
      `slug, points,
       cards ( id, org_id, name, points_for_reward, reward_description, design,
         organizations ( name, slug, primary_color ) ),
       customers ( name )`,
    )
    .eq('slug', slug)
    .maybeSingle();

  if (!membership) return null;

  const card = membership.cards as {
    id: string;
    org_id: string;
    name: string;
    points_for_reward: number;
    reward_description: string;
    design: Record<string, unknown> | null;
    organizations: { name: string; slug: string; primary_color: string } | null;
  } | null;
  const org = card?.organizations ?? null;
  const customer = membership.customers as { name: string | null } | null;

  const designColor = card?.design && 'primaryColor' in card.design ? String(card.design.primaryColor) : null;

  return {
    slug,
    points: membership.points,
    cardName: card?.name ?? null,
    pointsForReward: card?.points_for_reward ?? null,
    rewardDescription: card?.reward_description ?? null,
    primaryColorHex: designColor ?? org?.primary_color ?? '#E8341A',
    orgName: org?.name ?? null,
    orgSlug: org?.slug ?? null,
    customerName: customer?.name ?? null,
    campaign: card ? await getLatestCampaignForCard(card.org_id, card.id) : null,
  };
}

export function hexToRgb(hex: string): string {
  if (hex.startsWith('rgb')) return hex;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

export function buildPassJson(data: PassData, env: Pick<AppleWalletEnv, 'passTypeIdentifier' | 'teamIdentifier'>) {
  const cardsBase = process.env.NEXT_PUBLIC_CARDS_URL ?? 'https://cards.sellio.app';
  const cardUrl = `${cardsBase}/${data.slug}`;
  const checkInUrl = data.orgSlug ? `${cardsBase}/check-in/${data.orgSlug}` : cardUrl;

  const backFields: Array<Record<string, string>> = [];
  if (data.campaign) {
    // Cuando el valor de un campo con changeMessage cambia en una
    // actualización, iOS muestra la notificación (%@ = valor nuevo).
    backFields.push({
      key: 'campaign',
      label: data.campaign.title,
      value: data.campaign.message,
      changeMessage: '%@',
    });
  }
  backFields.push(
    {
      key: 'instructions',
      label: 'Cómo acumular puntos',
      value: 'Escanea el código QR de este comercio en tu próxima visita para sumar puntos y ganar recompensas.',
    },
    { key: 'link', label: 'Ver mi tarjeta online', value: cardUrl },
  );

  return {
    formatVersion: 1,
    passTypeIdentifier: env.passTypeIdentifier,
    teamIdentifier: env.teamIdentifier,
    organizationName: data.orgName ?? 'Sellio',
    serialNumber: data.slug,
    description: data.cardName ?? 'Tarjeta de puntos',
    backgroundColor: hexToRgb(data.primaryColorHex),
    foregroundColor: 'rgb(255, 255, 255)',
    labelColor: 'rgba(255, 255, 255, 0.75)',
    webServiceURL: `${cardsBase}/api/wallet/apple`,
    authenticationToken: generateAppleAuthToken(data.slug),
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
        { key: 'points', label: 'PUNTOS', value: `${data.points} / ${data.pointsForReward ?? '?'}` },
      ],
      secondaryFields: [{ key: 'reward', label: 'PRÓXIMO PREMIO', value: data.rewardDescription ?? '' }],
      auxiliaryFields: [{ key: 'holder', label: 'TITULAR', value: data.customerName ?? 'Cliente Sellio' }],
      backFields,
    },
  };
}

// PNG transparente 1×1 — TODO: usar el logo del comercio / de Sellio.
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

export function signPass(passJson: object, env: AppleWalletEnv): Buffer {
  const { signerCert, signerKey } = extractPemFromP12(Buffer.from(env.p12Base64, 'base64'), env.p12Passphrase);
  const pass = new PKPass();
  pass.addBuffer('pass.json', Buffer.from(JSON.stringify(passJson)));
  for (const name of ['icon.png', 'icon@2x.png', 'logo.png', 'logo@2x.png']) {
    pass.addBuffer(name, PLACEHOLDER_PNG);
  }
  pass.certificates = {
    wwdr: Buffer.from(env.wwdrBase64, 'base64'),
    signerCert,
    signerKey,
    signerKeyPassphrase: env.p12Passphrase,
  };
  return pass.getAsBuffer();
}
