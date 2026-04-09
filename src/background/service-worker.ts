import type { BlockRule, StorageState } from '../shared/types';
import { buildDNRRules, matchesBlockRule } from '../shared/rules';
import { isScheduleActive } from '../shared/schedule';
import { getState, onStateChange } from '../shared/storage';

const ALARM_NAME = 'blockthem-schedule-check';

// In-memory cache for fast URL checks in navigation listeners
let cachedActiveRules: BlockRule[] = [];

function getActiveRules(state: StorageState): BlockRule[] {
  if (!state.blockingEnabled) return [];

  return state.rules.filter((rule) => {
    if (!rule.enabled) return false;

    const schedule =
      rule.schedule ?? (state.scheduleEnabled ? state.globalSchedule : null);
    if (!schedule) return true; // No schedule = always active

    return isScheduleActive(schedule);
  });
}

async function syncStaticRulesets(state: StorageState): Promise<void> {
  const enableRulesetIds: string[] = [];
  const disableRulesetIds: string[] = [];

  const adultEnabled = state.blockingEnabled && state.blockAdultSites;
  const gamblingEnabled = state.blockingEnabled && state.blockGamblingSites;

  (adultEnabled ? enableRulesetIds : disableRulesetIds).push('adult');
  (gamblingEnabled ? enableRulesetIds : disableRulesetIds).push('gambling');

  await chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds,
    disableRulesetIds,
  });
}

async function syncRulesInternal(): Promise<void> {
  const state = await getState();
  const activeRules = getActiveRules(state);
  cachedActiveRules = activeRules;
  const extensionId = chrome.runtime.id;
  const newRules = buildDNRRules(activeRules, extensionId);

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map((r) => r.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: newRules,
  });

  await syncStaticRulesets(state);

  if (shouldScanTabs) {
    shouldScanTabs = false;
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && tab.url) {
        checkAndBlock(tab.id, tab.url);
      }
    }
  }
}

let shouldScanTabs = false;
let syncChain: Promise<void> = Promise.resolve();

function syncRules(): void {
  syncChain = syncChain
    .then(() => syncRulesInternal())
    .catch((err) => console.error('[BlockThem] syncRules error:', err));
}

function getBlockedUrl(rule: BlockRule): string {
  const ruleParam = encodeURIComponent(rule.pattern);
  return chrome.runtime.getURL(
    `src/blocked/index.html?rule=${ruleParam}&type=${rule.type}`,
  );
}

function checkAndBlock(tabId: number, url: string): void {
  if (!url?.startsWith('http')) return;

  // Don't block our own block page
  const extensionOrigin = chrome.runtime.getURL('');
  if (url.startsWith(extensionOrigin)) return;

  for (const rule of cachedActiveRules) {
    if (matchesBlockRule(url, rule)) {
      void chrome.tabs.update(tabId, { url: getBlockedUrl(rule) });
      return;
    }
  }
}

// Sync rules on startup
syncRules();

// Sync rules when storage changes
onStateChange((newState, oldState) => {
  if (newState.blockingEnabled && !oldState.blockingEnabled) {
    shouldScanTabs = true;
  }
  syncRules();
});

// Set up periodic alarm for schedule re-evaluation
void chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    syncRules();
  }
});

// Fallback: catch navigations that DNR might miss (e.g. server-side redirects)
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return; // Only top-level frame
  checkAndBlock(details.tabId, details.url);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    checkAndBlock(tabId, changeInfo.url);
  }
});
