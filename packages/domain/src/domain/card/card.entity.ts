import { z } from 'zod';

export const cardSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string().min(1).max(60),
  description: z.string().nullable(),
  pointsPerCheckin: z.number().int().positive(),
  pointsForReward: z.number().int().positive(),
  rewardDescription: z.string().min(1),
  maxMembers: z.number().int().positive().nullable(),
  design: z.record(z.unknown()),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Card = z.infer<typeof cardSchema>;
