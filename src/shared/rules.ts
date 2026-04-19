import type { BlockRule, TemporaryUnblock } from './types';

export function matchesBlockRule(url: string, rule: BlockRule): boolean {
  if (rule.type === 'url') {
    return url.includes(rule.pattern);
  }
  try {
    return new RegExp(rule.pattern).test(url);
  } catch {
    return false;
  }
}

const ALLOW_RULE_ID_BASE = 100_001;

export function buildDNRRules(
  rules: BlockRule[],
  tempUnblocks: TemporaryUnblock[],
  _extensionId: string,
): chrome.declarativeNetRequest.Rule[] {
  const enabledRules = rules.filter((r) => r.enabled);
  const blockRules = enabledRules.map((rule, index) => {
    const ruleParam = encodeURIComponent(rule.pattern);
    const redirectPath = `/src/blocked/index.html?rule=${ruleParam}&type=${rule.type}`;

    const dnrRule: chrome.declarativeNetRequest.Rule = {
      id: index + 1,
      priority: 1,
      action: {
        type: 'redirect' as chrome.declarativeNetRequest.RuleActionType,
        redirect: { extensionPath: redirectPath },
      },
      condition: {
        resourceTypes: [
          'main_frame' as chrome.declarativeNetRequest.ResourceType,
        ],
      },
    };

    if (rule.type === 'url') {
      dnrRule.condition.urlFilter = `*${rule.pattern}*`;
    } else {
      dnrRule.condition.regexFilter = rule.pattern;
    }

    return dnrRule;
  });

  const allowRules: chrome.declarativeNetRequest.Rule[] = tempUnblocks.map(
    (unblock, index) => ({
      id: ALLOW_RULE_ID_BASE + index,
      priority: 2,
      action: {
        type: 'allow' as chrome.declarativeNetRequest.RuleActionType,
      },
      condition: {
        requestDomains: [unblock.domain],
        resourceTypes: [
          'main_frame' as chrome.declarativeNetRequest.ResourceType,
        ],
      },
    }),
  );

  return [...blockRules, ...allowRules];
}
