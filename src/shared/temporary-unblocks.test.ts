import { describe, expect, it } from 'vitest';

import type { TemporaryUnblock } from './types';
import {
  isTempUnblocked,
  pruneExpired,
  UNBLOCK_DURATION_MS,
} from './temporary-unblocks';

const now = 1_700_000_000_000;

const make = (domain: string, offsetMs: number): TemporaryUnblock => ({
  domain,
  expiresAt: now + offsetMs,
});

describe('UNBLOCK_DURATION_MS', () => {
  it('equals one hour in milliseconds', () => {
    expect(UNBLOCK_DURATION_MS).toBe(3_600_000);
  });
});

describe('pruneExpired', () => {
  it('keeps entries with expiresAt strictly greater than now', () => {
    const list = [make('a.com', 1000), make('b.com', -1), make('c.com', 0)];
    const kept = pruneExpired(list, now);
    expect(kept).toEqual([make('a.com', 1000)]);
  });

  it('returns an empty array when all entries are expired', () => {
    expect(pruneExpired([make('a.com', -1)], now)).toEqual([]);
  });

  it('returns an empty array when given an empty list', () => {
    expect(pruneExpired([], now)).toEqual([]);
  });
});

describe('isTempUnblocked', () => {
  const list = [make('a.com', 1000), make('b.com', -1)];

  it('returns true when a matching unexpired entry exists', () => {
    expect(isTempUnblocked('a.com', list, now)).toBe(true);
  });

  it('returns false when matching entry is expired', () => {
    expect(isTempUnblocked('b.com', list, now)).toBe(false);
  });

  it('returns false when no matching entry exists', () => {
    expect(isTempUnblocked('c.com', list, now)).toBe(false);
  });

  it('matches by exact domain string (callers must normalize)', () => {
    expect(isTempUnblocked('A.COM', list, now)).toBe(false);
  });
});
