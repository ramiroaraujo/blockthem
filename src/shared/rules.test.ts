import { describe, expect, it } from 'vitest';

import type { BlockRule } from './types';
import { buildDNRRules, matchesBlockRule } from './rules';

describe('matchesBlockRule', () => {
  const makeRule = (pattern: string, type: 'url' | 'regex' = 'url'): BlockRule => ({
    id: 'r1',
    pattern,
    type,
    enabled: true,
    schedule: null,
    createdAt: 1000,
  });

  it('matches URL pattern anywhere in the URL', () => {
    expect(matchesBlockRule('https://x.com/home', makeRule('x.com'))).toBe(true);
    expect(matchesBlockRule('https://www.x.com/', makeRule('x.com'))).toBe(true);
  });

  it('does not match unrelated URLs', () => {
    expect(matchesBlockRule('https://example.com', makeRule('x.com'))).toBe(false);
  });

  it('matches regex patterns', () => {
    expect(matchesBlockRule('https://www.reddit.com/r/test', makeRule('.*reddit\\.com.*', 'regex'))).toBe(true);
  });

  it('returns false for invalid regex', () => {
    expect(matchesBlockRule('https://x.com', makeRule('[invalid', 'regex'))).toBe(false);
  });
});

describe('buildDNRRules', () => {
  const extensionId = 'test-extension-id';

  it('converts a URL rule to a urlFilter redirect rule', () => {
    const rules: BlockRule[] = [
      {
        id: 'r1',
        pattern: 'facebook.com',
        type: 'url',
        enabled: true,
        schedule: null,
        createdAt: 1000,
      },
    ];
    const result = buildDNRRules(rules, extensionId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          extensionPath: '/src/blocked/index.html?rule=facebook.com&type=url',
        },
      },
      condition: {
        urlFilter: '*facebook.com*',
        resourceTypes: ['main_frame'],
      },
    });
  });

  it('converts a regex rule to a regexFilter redirect rule', () => {
    const rules: BlockRule[] = [
      {
        id: 'r2',
        pattern: '.*reddit\\.com.*',
        type: 'regex',
        enabled: true,
        schedule: null,
        createdAt: 1000,
      },
    ];
    const result = buildDNRRules(rules, extensionId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          extensionPath:
            '/src/blocked/index.html?rule=.*reddit%5C.com.*&type=regex',
        },
      },
      condition: {
        regexFilter: '.*reddit\\.com.*',
        resourceTypes: ['main_frame'],
      },
    });
  });

  it('skips disabled rules', () => {
    const rules: BlockRule[] = [
      {
        id: 'r1',
        pattern: 'facebook.com',
        type: 'url',
        enabled: false,
        schedule: null,
        createdAt: 1000,
      },
    ];
    const result = buildDNRRules(rules, extensionId);
    expect(result).toHaveLength(0);
  });

  it('assigns sequential IDs starting from 1', () => {
    const rules: BlockRule[] = [
      {
        id: 'r1',
        pattern: 'facebook.com',
        type: 'url',
        enabled: true,
        schedule: null,
        createdAt: 1000,
      },
      {
        id: 'r2',
        pattern: 'twitter.com',
        type: 'url',
        enabled: true,
        schedule: null,
        createdAt: 2000,
      },
    ];
    const result = buildDNRRules(rules, extensionId);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });
});
