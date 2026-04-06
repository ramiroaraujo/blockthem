import { describe, expect, it } from 'vitest';

import { generateSalt, hashPassword, verifyPassword } from './password';

describe('password utilities', () => {
  describe('generateSalt', () => {
    it('returns a hex string of 32 characters (16 bytes)', () => {
      const salt = generateSalt();
      expect(salt).toMatch(/^[0-9a-f]{32}$/);
    });

    it('returns different values each time', () => {
      const a = generateSalt();
      const b = generateSalt();
      expect(a).not.toBe(b);
    });
  });

  describe('hashPassword', () => {
    it('returns a hex string', async () => {
      const hash = await hashPassword('test123', 'abc123');
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('produces consistent output for same input', async () => {
      const a = await hashPassword('test123', 'salt');
      const b = await hashPassword('test123', 'salt');
      expect(a).toBe(b);
    });

    it('produces different output for different passwords', async () => {
      const a = await hashPassword('password1', 'salt');
      const b = await hashPassword('password2', 'salt');
      expect(a).not.toBe(b);
    });

    it('produces different output for different salts', async () => {
      const a = await hashPassword('test', 'salt1');
      const b = await hashPassword('test', 'salt2');
      expect(a).not.toBe(b);
    });
  });

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const salt = generateSalt();
      const hash = await hashPassword('mypassword', salt);
      expect(await verifyPassword('mypassword', hash, salt)).toBe(true);
    });

    it('returns false for wrong password', async () => {
      const salt = generateSalt();
      const hash = await hashPassword('mypassword', salt);
      expect(await verifyPassword('wrongpassword', hash, salt)).toBe(false);
    });
  });
});
