import { describe, expect, it } from 'vitest';

import type { BlockRule } from './types';
import { buildDNRRules } from './rules';

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
