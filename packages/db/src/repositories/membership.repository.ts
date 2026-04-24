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

  async countByCard(cardId: string): Promise<number> {
    const db = await createClient();
    const { count, error } = await db
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('card_id', cardId);
    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  async sumPointsByCard(cardId: string): Promise<number> {
    const db = await createClient();
    const { data, error } = await db
      .from('memberships')
      .select('points')
      .eq('card_id', cardId);
    if (error) throw new Error(error.message);
    return (data ?? []).reduce((sum, row) => sum + (row.points ?? 0), 0);
  }

  async countScansByCard(cardId: string): Promise<number> {
    const db = await createClient();
    const { count, error } = await db
      .from('point_transactions')
      .select('id, memberships!inner(card_id)', { count: 'exact', head: true })
      .eq('memberships.card_id', cardId);
      
    if (error) {
      console.error('Error counting scans by card:', error);
      return 0;
    }
    return count ?? 0;
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
