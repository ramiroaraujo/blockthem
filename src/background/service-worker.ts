import { getState, onStateChange } from '../shared/storage'
import { isScheduleActive } from '../shared/schedule'
import { buildDNRRules } from '../shared/rules'
import type { BlockRule, StorageState } from '../shared/types'

const ALARM_NAME = 'blockthem-schedule-check'

function getActiveRules(state: StorageState): BlockRule[] {
  if (!state.blockingEnabled) return []

  return state.rules.filter((rule) => {
    if (!rule.enabled) return false

    const schedule = rule.schedule ?? state.globalSchedule
    if (!schedule) return true // No schedule = always active

    return isScheduleActive(schedule)
  })
}

async function syncRules(): Promise<void> {
  const state = await getState()
  const activeRules = getActiveRules(state)
  const extensionId = chrome.runtime.id
  const newRules = buildDNRRules(activeRules, extensionId)

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
  const removeRuleIds = existingRules.map((r) => r.id)

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: newRules,
  })
}

// Sync rules on startup
syncRules()

// Sync rules when storage changes
onStateChange(() => {
  syncRules()
})

// Set up periodic alarm for schedule re-evaluation
chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    syncRules()
  }
})
