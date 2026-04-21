import { z } from 'zod';

export const customerSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  phone: z.string().min(7),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Customer = z.infer<typeof customerSchema>;
