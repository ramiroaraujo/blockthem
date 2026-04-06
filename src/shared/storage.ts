import { DEFAULT_STATE, type StorageState } from './types'

export async function getState(): Promise<StorageState> {
  const result = await chrome.storage.local.get('state')
  return result.state ?? { ...DEFAULT_STATE }
}

export async function setState(state: StorageState): Promise<void> {
  await chrome.storage.local.set({ state })
}

export function onStateChange(
  callback: (newState: StorageState, oldState: StorageState) => void
): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes.state) return
    callback(
      changes.state.newValue ?? { ...DEFAULT_STATE },
      changes.state.oldValue ?? { ...DEFAULT_STATE }
    )
  })
}
