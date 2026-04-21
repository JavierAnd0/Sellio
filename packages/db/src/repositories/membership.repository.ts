import type { IMembershipRepository, Membership } from '@sellio/domain';

import { createClient } from '../server';
import type { Tables } from '../types';

type MembershipRow = Tables<'memberships'>;

function membershipRowToEntity(row: MembershipRow): Membership {
  return {
    id: row.id,
    cardId: row.card_id,
    customerId: row.customer_id,
    slug: row.slug,
    points: row.points,
    joinedAt: new Date(row.joined_at),
    lastActivityAt: row.last_activity_at ? new Date(row.last_activity_at) : null,
  };
}

export class SupabaseMembershipRepository implements IMembershipRepository {
  async create(cardId: string, customerId: string): Promise<Membership> {
    const db = await createClient();

    const { data, error } = await db
      .from('memberships')
      .insert({ card_id: cardId, customer_id: customerId })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return membershipRowToEntity(data);
  }

  async findBySlug(slug: string): Promise<Membership | null> {
    const db = await createClient();

    const { data, error } = await db
      .from('memberships')
      .select()
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return membershipRowToEntity(data);
  }

  async findByCardAndCustomer(cardId: string, customerId: string): Promise<Membership | null> {
    const db = await createClient();

    const { data, error } = await db
      .from('memberships')
      .select()
      .eq('card_id', cardId)
      .eq('customer_id', customerId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return membershipRowToEntity(data);
  }
}
