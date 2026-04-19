import { describe, expect, it } from 'vitest';

import type { BlockRule, TemporaryUnblock } from './types';
import { buildDNRRules, matchesBlockRule } from './rules';

describe('matchesBlockRule', () => {
  const makeRule = (
    pattern: string,
    type: 'url' | 'regex' = 'url',
  ): BlockRule => ({
    id: 'r1',
    pattern,
    type,
    enabled: true,
    schedule: null,
    createdAt: 1000,
  });

  it('matches URL pattern anywhere in the URL', () => {
    expect(matchesBlockRule('https://x.com/home', makeRule('x.com'))).toBe(
      true,
    );
    expect(matchesBlockRule('https://www.x.com/', makeRule('x.com'))).toBe(
      true,
    );
  });

  it('does not match unrelated URLs', () => {
    expect(matchesBlockRule('https://example.com', makeRule('x.com'))).toBe(
      false,
    );
  });

  it('matches regex patterns', () => {
    expect(
      matchesBlockRule(
        'https://www.reddit.com/r/test',
        makeRule('.*reddit\\.com.*', 'regex'),
      ),
    ).toBe(true);
  });

  it('returns false for invalid regex', () => {
    expect(
      matchesBlockRule('https://x.com', makeRule('[invalid', 'regex')),
    ).toBe(false);
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
    const result = buildDNRRules(rules, [], extensionId);
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
    const result = buildDNRRules(rules, [], extensionId);
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
    const result = buildDNRRules(rules, [], extensionId);
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
    const result = buildDNRRules(rules, [], extensionId);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it('appends an allow rule for each temporary unblock', () => {
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
    const tempUnblocks: TemporaryUnblock[] = [
      { domain: 'example.com', expiresAt: Date.now() + 60_000 },
    ];
    const result = buildDNRRules(rules, tempUnblocks, extensionId);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({
      id: 100_001,
      priority: 2,
      action: { type: 'allow' },
      condition: {
        requestDomains: ['example.com'],
        resourceTypes: ['main_frame'],
      },
    });
  });

  it('gives allow rules IDs disjoint from block rules', () => {
    const rules: BlockRule[] = [
      {
        id: 'r1',
        pattern: 'a.com',
        type: 'url',
        enabled: true,
        schedule: null,
        createdAt: 1,
      },
      {
        id: 'r2',
        pattern: 'b.com',
        type: 'url',
        enabled: true,
        schedule: null,
        createdAt: 2,
      },
    ];
    const tempUnblocks: TemporaryUnblock[] = [
      { domain: 'c.com', expiresAt: Date.now() + 60_000 },
      { domain: 'd.com', expiresAt: Date.now() + 60_000 },
    ];
    const result = buildDNRRules(rules, tempUnblocks, extensionId);
    expect(result.map((r) => r.id)).toEqual([1, 2, 100_001, 100_002]);
  });

  it('does not filter expired entries itself (caller prunes)', () => {
    const tempUnblocks: TemporaryUnblock[] = [
      { domain: 'expired.com', expiresAt: Date.now() - 60_000 },
    ];
    const result = buildDNRRules([], tempUnblocks, extensionId);
    expect(result).toHaveLength(1);
    expect(result[0].condition.requestDomains).toEqual(['expired.com']);
  });
});
