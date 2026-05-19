import { z } from 'zod';

export const membershipSchema = z.object({
  id: z.string().uuid(),
  cardId: z.string().uuid(),
  customerId: z.string().uuid(),
  slug: z.string(),
  points: z.number().int().min(0),
  memberNumber: z.number().int().min(1),
  joinedAt: z.date(),
  lastActivityAt: z.date().nullable(),
});

export type Membership = z.infer<typeof membershipSchema>;
