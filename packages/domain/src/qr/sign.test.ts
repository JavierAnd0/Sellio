import { describe, expect, it } from 'vitest';

import { generateQrToken, verifyQrToken } from './sign';

const SECRET = 'test-secret-do-not-use-in-production-a0b1c2d3e4f5';
const MEMBERSHIP_ID = '00000000-0000-0000-0000-000000000001';

describe('QR token', () => {
  describe('generate', () => {
    it('creates a token with 2 parts separated by dot', () => {
      const { token } = generateQrToken({ membershipId: MEMBERSHIP_ID, secret: SECRET });
      expect(token.split('.')).toHaveLength(2);
    });

    it('returns nonce and expiry', () => {
      const result = generateQrToken({ membershipId: MEMBERSHIP_ID, secret: SECRET });
      expect(result.nonce).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('generates different tokens for same membership (nonce differs)', () => {
      const a = generateQrToken({ membershipId: MEMBERSHIP_ID, secret: SECRET });
      const b = generateQrToken({ membershipId: MEMBERSHIP_ID, secret: SECRET });
      expect(a.token).not.toBe(b.token);
      expect(a.nonce).not.toBe(b.nonce);
    });
  });

  describe('verify', () => {
    it('accepts a freshly generated token', () => {
      const { token } = generateQrToken({ membershipId: MEMBERSHIP_ID, secret: SECRET });
      const result = verifyQrToken({ token, secret: SECRET });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.payload.mid).toBe(MEMBERSHIP_ID);
      }
    });

    it('rejects malformed tokens', () => {
      expect(verifyQrToken({ token: 'not-a-token', secret: SECRET })).toEqual({
        ok: false,
        reason: 'malformed',
      });
      expect(verifyQrToken({ token: 'only.', secret: SECRET }).ok).toBe(false);
    });

    it('rejects token signed with different secret', () => {
      const { token } = generateQrToken({ membershipId: MEMBERSHIP_ID, secret: SECRET });
      const result = verifyQrToken({ token, secret: 'other-secret' });
      expect(result).toEqual({ ok: false, reason: 'invalid_signature' });
    });

    it('rejects token with tampered payload', () => {
      const { token } = generateQrToken({ membershipId: MEMBERSHIP_ID, secret: SECRET });
      const [, sig] = token.split('.');
      const tampered = `${Buffer.from('{"mid":"fake"}').toString('base64url')}.${sig}`;
      const result = verifyQrToken({ token: tampered, secret: SECRET });
      expect(result.ok).toBe(false);
    });

    it('rejects expired token', () => {
      const past = new Date(Date.now() - 5 * 60 * 1000); // 5 min atrás
      const { token } = generateQrToken({
        membershipId: MEMBERSHIP_ID,
        secret: SECRET,
        ttlSeconds: 60,
      });

      const future = new Date(Date.now() + 5 * 60 * 1000);
      const result = verifyQrToken({ token, secret: SECRET, now: future });
      expect(result).toEqual({ ok: false, reason: 'expired' });
      expect(past).toBeDefined(); // silence unused
    });

    it('rejects token from the future', () => {
      const { token } = generateQrToken({ membershipId: MEMBERSHIP_ID, secret: SECRET });
      const past = new Date(Date.now() - 5 * 60 * 1000);
      const result = verifyQrToken({ token, secret: SECRET, now: past });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe('invalid_payload');
    });
  });

  describe('roundtrip', () => {
    it('100 random generations all verify correctly', () => {
      for (let i = 0; i < 100; i++) {
        const { token } = generateQrToken({ membershipId: MEMBERSHIP_ID, secret: SECRET });
        const result = verifyQrToken({ token, secret: SECRET });
        expect(result.ok).toBe(true);
      }
    });
  });
});
