import { z } from 'zod';

export const orgSlugSchema = z
  .string()
  .min(3, 'Mínimo 3 caracteres')
  .max(40, 'Máximo 40 caracteres')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Solo letras minúsculas, números y guiones');

export const organizationSchema = z.object({
  id: z.string().uuid(),
  slug: orgSlugSchema,
  name: z.string().min(2).max(100),
  logoUrl: z.string().url().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#E8341A'),
  country: z.string().length(2).default('CO'),
  timezone: z.string().default('America/Bogota'),
  plan: z.enum(['free', 'basic', 'elite', 'enterprise']).default('free'),
  trialEndsAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Organization = z.infer<typeof organizationSchema>;

/**
 * Genera un slug URL-safe a partir del nombre del negocio.
 * Resultado siempre cumple orgSlugSchema (sin leading/trailing hyphens, solo a-z0-9-).
 */
export function deriveSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)
    || 'mi-negocio';
}
