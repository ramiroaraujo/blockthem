import type { BlockStats } from '../shared/block-stats';
import type {
  BlockRule,
  StorageState,
  TemporaryUnblock,
} from '../shared/types';
import { recordEvent } from '../shared/block-stats';
import { normalizeDomain } from '../shared/domain';
import { buildDNRRules, matchesBlockRule } from '../shared/rules';
import { isScheduleActive } from '../shared/schedule';
import { getState, onStateChange, setState } from '../shared/storage';
import { isTempUnblocked, pruneExpired } from '../shared/temporary-unblocks';

const ALARM_NAME = 'blockthem-schedule-check';

// In-memory cache for fast URL checks in navigation listeners
let cachedActiveRules: BlockRule[] = [];
let cachedTempUnblocks: TemporaryUnblock[] = [];

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

  const liveUnblocks = pruneExpired(state.temporaryUnblocks);
  if (liveUnblocks.length !== state.temporaryUnblocks.length) {
    await setState({ ...state, temporaryUnblocks: liveUnblocks });
  }
  cachedTempUnblocks = liveUnblocks;

  const extensionId = chrome.runtime.id;
  const newRules = buildDNRRules(activeRules, liveUnblocks, extensionId);

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
        void checkAndBlock(tab.id, tab.url);
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

function waitForSync(): Promise<void> {
  return syncChain.catch(() => undefined);
}

interface AwaitSyncMessage {
  type: 'await-sync';
}

function isAwaitSyncMessage(m: unknown): m is AwaitSyncMessage {
  return (
    typeof m === 'object' &&
    m !== null &&
    (m as { type?: unknown }).type === 'await-sync'
  );
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (isAwaitSyncMessage(message)) {
    // Schedule a sync unconditionally; storage.onChanged may not have fired yet
    syncRules();
    void waitForSync().then(() => {
      sendResponse({ ok: true });
    });
    return true; // keep channel open for async response
  }
  return undefined;
});

function getBlockedUrl(rule: BlockRule, domain: string): string {
  const ruleParam = encodeURIComponent(rule.pattern);
  const domainParam = encodeURIComponent(domain);
  return chrome.runtime.getURL(
    `src/blocked/index.html?rule=${ruleParam}&type=${rule.type}&domain=${domainParam}`,
  );
}

async function recordBlockEvent(hostname: string): Promise<void> {
  const result = await chrome.storage.local.get('blockStats');
  const stats: BlockStats =
    (result as { blockStats?: BlockStats }).blockStats ?? {};
  const updated = recordEvent(stats, hostname);
  await chrome.storage.local.set({ blockStats: updated });
}

// Debounce per tab to avoid double-counting from redirect chains
// (e.g. x.com → x.com/home triggers both webNavigation and tabs.onUpdated)
const recentBlocks = new Map<number, number>();
const DEBOUNCE_MS = 2000;

async function checkAndBlock(tabId: number, url: string): Promise<void> {
  if (!url?.startsWith('http')) return;

  // Don't block our own block page
  const extensionOrigin = chrome.runtime.getURL('');
  if (url.startsWith(extensionOrigin)) return;

  const host = normalizeDomain(url);
  if (host && isTempUnblocked(host, cachedTempUnblocks)) return;

  for (const rule of cachedActiveRules) {
    if (matchesBlockRule(url, rule)) {
      const domain = new URL(url).hostname;

      const now = Date.now();
      const lastBlock = recentBlocks.get(tabId);
      if (lastBlock && now - lastBlock < DEBOUNCE_MS) {
        // Still redirect, but don't record a duplicate stat
        void chrome.tabs.update(tabId, { url: getBlockedUrl(rule, domain) });
        return;
      }
      recentBlocks.set(tabId, now);

      await recordBlockEvent(domain);
      void chrome.tabs.update(tabId, { url: getBlockedUrl(rule, domain) });
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
  void checkAndBlock(details.tabId, details.url);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    void checkAndBlock(tabId, changeInfo.url);
  }
});
