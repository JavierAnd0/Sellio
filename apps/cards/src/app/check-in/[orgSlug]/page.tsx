import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { createAdminClient } from '@sellio/db/admin';

import { CheckInForm } from './check-in-form';

interface CheckInPageProps {
  params: Promise<{ orgSlug: string }>;
}

export async function generateMetadata({ params }: CheckInPageProps): Promise<Metadata> {
  const { orgSlug } = await params;
  const db = createAdminClient();
  const { data: org } = await db.from('organizations').select('name').eq('slug', orgSlug).maybeSingle();
  return { title: org ? `Check-in · ${org.name}` : 'Check-in · Sellio' };
}

export default async function CheckInPage({ params }: CheckInPageProps) {
  const { orgSlug } = await params;

  const db = createAdminClient();
  const { data: org } = await db
    .from('organizations')
    .select('id, name, primary_color')
    .eq('slug', orgSlug)
    .maybeSingle();

  if (!org) notFound();

  const { data: card } = await db
    .from('cards')
    .select('name, points_per_checkin, points_for_reward, reward_description, design')
    .eq('org_id', org.id)
    .eq('active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!card) notFound();

  const primaryColor =
    (card.design && typeof card.design === 'object' && 'primaryColor' in card.design
      ? String(card.design.primaryColor)
      : null) ?? org.primary_color ?? '#E8341A';

  return (
    <CheckInForm
      orgSlug={orgSlug}
      orgName={org.name}
      cardName={card.name}
      pointsPerCheckin={card.points_per_checkin}
      pointsForReward={card.points_for_reward}
      rewardDescription={card.reward_description}
      primaryColor={primaryColor}
    />
  );
}
