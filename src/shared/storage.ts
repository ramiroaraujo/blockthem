import type { StorageState } from './types';
import { DEFAULT_STATE } from './types';

export async function getState(): Promise<StorageState> {
  const result = await chrome.storage.local.get('state');
  const raw = (result as { state?: Record<string, unknown> }).state;
  if (!raw) return { ...DEFAULT_STATE };

  // Migration: convert old null-based schedule to enabled-flag approach
  if (!('scheduleEnabled' in raw)) {
    return {
      ...DEFAULT_STATE,
      ...(raw as Partial<StorageState>),
      scheduleEnabled:
        raw.globalSchedule !== null && raw.globalSchedule !== undefined,
      globalSchedule:
        (raw.globalSchedule as StorageState['globalSchedule'] | null) ??
        DEFAULT_STATE.globalSchedule,
    };
  }

  return { ...DEFAULT_STATE, ...(raw as unknown as StorageState) };
}

export async function setState(state: StorageState): Promise<void> {
  await chrome.storage.local.set({ state });
}

export async function updateState(
  updates: Partial<StorageState>,
): Promise<StorageState> {
  const current = await getState();
  const merged = { ...current, ...updates };
  await setState(merged);
  return merged;
}

export function onStateChange(
  callback: (newState: StorageState, oldState: StorageState) => void,
): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes.state) return;
    callback(
      (changes.state.newValue as StorageState) ?? { ...DEFAULT_STATE },
      (changes.state.oldValue as StorageState) ?? { ...DEFAULT_STATE },
    );
  });
}
