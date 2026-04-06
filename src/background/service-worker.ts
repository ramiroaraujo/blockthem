import type { BlockRule, StorageState } from '../shared/types';
import { buildDNRRules } from '../shared/rules';
import { isScheduleActive } from '../shared/schedule';
import { getState, onStateChange } from '../shared/storage';

const ALARM_NAME = 'blockthem-schedule-check';

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

async function syncRulesInternal(): Promise<void> {
  const state = await getState();
  const activeRules = getActiveRules(state);
  const extensionId = chrome.runtime.id;
  const newRules = buildDNRRules(activeRules, extensionId);

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map((r) => r.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: newRules,
  });
}

let syncChain: Promise<void> = Promise.resolve();

function syncRules(): void {
  syncChain = syncChain
    .then(() => syncRulesInternal())
    .catch((err) => console.error('[BlockThem] syncRules error:', err));
}

// Sync rules on startup
syncRules();

// Sync rules when storage changes
onStateChange(() => {
  syncRules();
});

// Set up periodic alarm for schedule re-evaluation
void chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    syncRules();
  }
});
