import type { Organization } from '@sellio/domain';
import type { Tier } from '@/components/cards/card-renderer';

export const TRIAL_DAYS = 20;

export function getEffectiveTier(org: Organization): Tier {
  if (org.plan === 'enterprise' || org.plan === 'elite') return org.plan;
  if (org.plan === 'basic') return 'basic';
  if (org.trialEndsAt && new Date() < org.trialEndsAt) return 'basic';
  return 'free';
}

export function getTrialDaysLeft(org: Organization): number | null {
  if (org.plan !== 'free' || !org.trialEndsAt) return null;
  const msLeft = org.trialEndsAt.getTime() - Date.now();
  if (msLeft <= 0) return 0;
  return Math.ceil(msLeft / (1000 * 60 * 60 * 24));
}

export function isTrialExpired(org: Organization): boolean {
  if (org.plan !== 'free') return false;
  if (!org.trialEndsAt) return false;
  return new Date() >= org.trialEndsAt;
}
