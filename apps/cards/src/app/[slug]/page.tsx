import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { createAdminClient } from '@sellio/db/admin';

import { MembershipCardView } from '@/components/membership-card-view';

interface SlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Tarjeta ${slug} · Sellio`,
  };
}

export default async function MembershipSlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  const db = createAdminClient();

  // Fetch membership with related card, customer, and org data in one query
  const { data: membership, error } = await db
    .from('memberships')
    .select(
      `
      id,
      slug,
      points,
      joined_at,
      last_activity_at,
      cards (
        id,
        name,
        points_for_reward,
        reward_description,
        design,
        active,
        org_id,
        organizations (
          name,
          primary_color
        )
      ),
      customers (
        id,
        name,
        phone
      )
    `,
    )
    .eq('slug', slug)
    .maybeSingle();

  if (error || !membership) {
    notFound();
  }

  const card = membership.cards as {
    id: string;
    name: string;
    points_for_reward: number;
    reward_description: string;
    design: Record<string, unknown> | null;
    active: boolean;
    org_id: string;
    organizations: { name: string; primary_color: string } | null;
  } | null;

  const customer = membership.customers as {
    id: string;
    name: string | null;
    phone: string;
  } | null;

  if (!card || !card.active) {
    notFound();
  }

  const org = card.organizations;
  const primaryColor =
    (card.design && typeof card.design === 'object' && 'primaryColor' in card.design
      ? String(card.design.primaryColor)
      : null) ??
    org?.primary_color ??
    '#E8341A';

  return (
    <MembershipCardView
      businessName={org?.name ?? ''}
      cardName={card.name}
      points={membership.points}
      pointsForReward={card.points_for_reward}
      rewardDescription={card.reward_description}
      customerName={customer?.name ?? null}
      primaryColor={primaryColor}
    />
  );
}
