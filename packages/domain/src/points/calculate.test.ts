import { describe, expect, it } from 'vitest';

import {
  canRedeem,
  pointsForCheckin,
  pointsToNextReward,
  progressToNextReward,
  redeemableCount,
} from './calculate';

describe('points calculation', () => {
  const config = { pointsPerCheckin: 1, pointsForReward: 10 };

  describe('pointsForCheckin', () => {
    it('returns configured amount', () => {
      expect(pointsForCheckin(config)).toBe(1);
      expect(pointsForCheckin({ ...config, pointsPerCheckin: 5 })).toBe(5);
    });
  });

  describe('canRedeem', () => {
    it('false when below threshold', () => {
      expect(canRedeem(5, config)).toBe(false);
      expect(canRedeem(9, config)).toBe(false);
    });

    it('true at or above threshold', () => {
      expect(canRedeem(10, config)).toBe(true);
      expect(canRedeem(25, config)).toBe(true);
    });
  });

  describe('redeemableCount', () => {
    it('counts full reward cycles', () => {
      expect(redeemableCount(0, config)).toBe(0);
      expect(redeemableCount(9, config)).toBe(0);
      expect(redeemableCount(10, config)).toBe(1);
      expect(redeemableCount(25, config)).toBe(2);
      expect(redeemableCount(30, config)).toBe(3);
    });
  });

  describe('pointsToNextReward', () => {
    it('returns points needed for next reward', () => {
      expect(pointsToNextReward(0, config)).toBe(10);
      expect(pointsToNextReward(3, config)).toBe(7);
      expect(pointsToNextReward(10, config)).toBe(0);
      expect(pointsToNextReward(13, config)).toBe(7);
    });
  });

  describe('progressToNextReward', () => {
    it('returns progress percentage 0-100', () => {
      expect(progressToNextReward(0, config)).toBe(0);
      expect(progressToNextReward(5, config)).toBe(50);
      expect(progressToNextReward(9, config)).toBe(90);
      expect(progressToNextReward(10, config)).toBe(0); // reset en threshold
      expect(progressToNextReward(15, config)).toBe(50);
    });
  });
});
