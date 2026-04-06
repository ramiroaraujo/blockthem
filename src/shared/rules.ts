import type { BlockRule } from './types';

export function buildDNRRules(
  rules: BlockRule[],
  _extensionId: string,
): chrome.declarativeNetRequest.Rule[] {
  const enabledRules = rules.filter((r) => r.enabled);
  return enabledRules.map((rule, index) => {
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
}
