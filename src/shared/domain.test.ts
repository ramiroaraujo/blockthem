import { describe, expect, it } from 'vitest';

import { normalizeDomain } from './domain';

describe('normalizeDomain', () => {
  it('strips www. prefix', () => {
    expect(normalizeDomain('www.example.com')).toBe('example.com');
    expect(normalizeDomain('https://www.Example.com/path')).toBe('example.com');
  });

  it('lowercases the hostname', () => {
    expect(normalizeDomain('Example.COM')).toBe('example.com');
  });

  it('accepts a bare hostname', () => {
    expect(normalizeDomain('example.com')).toBe('example.com');
  });

  it('accepts a full URL and extracts hostname', () => {
    expect(normalizeDomain('https://example.com/foo?bar=1')).toBe(
      'example.com',
    );
  });

  it('returns null for garbage input', () => {
    expect(normalizeDomain('https://')).toBeNull();
    expect(normalizeDomain('')).toBeNull();
  });
});
