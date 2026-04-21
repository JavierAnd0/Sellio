import type { Card } from './card.entity';

export interface CreateCardInput {
  orgId: string;
  name: string;
  description?: string | null;
  pointsPerCheckin: number;
  pointsForReward: number;
  rewardDescription: string;
  maxMembers?: number | null;
  design?: Record<string, unknown>;
}

export interface UpdateCardInput {
  name?: string;
  description?: string | null;
  pointsPerCheckin?: number;
  pointsForReward?: number;
  rewardDescription?: string;
  maxMembers?: number | null;
  design?: Record<string, unknown>;
  active?: boolean;
}

export interface ICardRepository {
  create(input: CreateCardInput): Promise<Card>;
  findById(id: string): Promise<Card | null>;
  findByOrg(orgId: string): Promise<Card[]>;
  update(id: string, input: UpdateCardInput): Promise<Card>;
  delete(id: string): Promise<void>;
}
