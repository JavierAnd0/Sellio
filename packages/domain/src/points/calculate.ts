import { z } from 'zod';

/**
 * Reglas de negocio para el cálculo y manejo de puntos.
 * Funciones puras — sin side effects, sin I/O. Fáciles de testear.
 */

export const cardPointsConfigSchema = z.object({
  pointsPerCheckin: z.number().int().positive(),
  pointsForReward: z.number().int().positive(),
});

export type CardPointsConfig = z.infer<typeof cardPointsConfigSchema>;

/**
 * Puntos ganados en un check-in (actualmente fijo por card, pero
 * queda centralizado aquí para agregar multiplicadores/eventos en M3+).
 */
export function pointsForCheckin(config: CardPointsConfig): number {
  return config.pointsPerCheckin;
}

/**
 * ¿El membership puede canjear su reward?
 */
export function canRedeem(currentPoints: number, config: CardPointsConfig): boolean {
  return currentPoints >= config.pointsForReward;
}

/**
 * ¿Cuántos canjes completos puede hacer?
 */
export function redeemableCount(currentPoints: number, config: CardPointsConfig): number {
  if (config.pointsForReward <= 0) return 0;
  return Math.floor(currentPoints / config.pointsForReward);
}

/**
 * Puntos restantes para el siguiente reward.
 */
export function pointsToNextReward(
  currentPoints: number,
  config: CardPointsConfig,
): number {
  const next = config.pointsForReward - (currentPoints % config.pointsForReward);
  return next === config.pointsForReward && currentPoints > 0 ? 0 : next;
}

/**
 * Progress porcentaje hacia el siguiente reward (0-100).
 */
export function progressToNextReward(
  currentPoints: number,
  config: CardPointsConfig,
): number {
  const inCurrentCycle = currentPoints % config.pointsForReward;
  return Math.round((inCurrentCycle / config.pointsForReward) * 100);
}
