import type {
  Card,
  CreateCardInput,
  ICardRepository,
  UpdateCardInput,
} from '@sellio/domain';

import { createClient } from '../server';
import type { Json, Tables } from '../types';

type CardRow = Tables<'cards'>;

export function cardRowToEntity(row: CardRow): Card {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    description: row.description,
    pointsPerCheckin: row.points_per_checkin,
    pointsForReward: row.points_for_reward,
    rewardDescription: row.reward_description,
    maxMembers: row.max_members,
    design: (row.design as Record<string, unknown>) ?? {},
    active: row.active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SupabaseCardRepository implements ICardRepository {
  async create(input: CreateCardInput): Promise<Card> {
    const db = await createClient();

    const { data, error } = await db
      .from('cards')
      .insert({
        org_id: input.orgId,
        name: input.name,
        description: input.description ?? null,
        points_per_checkin: input.pointsPerCheckin,
        points_for_reward: input.pointsForReward,
        reward_description: input.rewardDescription,
        max_members: input.maxMembers ?? null,
        design: (input.design ?? {}) as unknown as Json,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return cardRowToEntity(data);
  }

  async findById(id: string): Promise<Card | null> {
    const db = await createClient();

    const { data, error } = await db
      .from('cards')
      .select()
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return cardRowToEntity(data);
  }

  async findByOrg(orgId: string): Promise<Card[]> {
    const db = await createClient();

    const { data, error } = await db
      .from('cards')
      .select()
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map(cardRowToEntity);
  }

  async update(id: string, input: UpdateCardInput): Promise<Card> {
    const db = await createClient();

    const dbUpdates: Partial<CardRow> = {};
    if (input.name !== undefined) dbUpdates.name = input.name;
    if (input.description !== undefined) dbUpdates.description = input.description;
    if (input.pointsPerCheckin !== undefined) dbUpdates.points_per_checkin = input.pointsPerCheckin;
    if (input.pointsForReward !== undefined) dbUpdates.points_for_reward = input.pointsForReward;
    if (input.rewardDescription !== undefined) dbUpdates.reward_description = input.rewardDescription;
    if (input.maxMembers !== undefined) dbUpdates.max_members = input.maxMembers;
    if (input.design !== undefined) dbUpdates.design = input.design as unknown as Json;
    if (input.active !== undefined) dbUpdates.active = input.active;

    const { data, error } = await db
      .from('cards')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return cardRowToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const db = await createClient();

    const { error } = await db
      .from('cards')
      .update({ active: false })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
