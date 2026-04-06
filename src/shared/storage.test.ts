import { describe, it, expect, beforeEach } from 'vitest'
import { getState, setState, onStateChange } from './storage'
import { DEFAULT_STATE, type StorageState } from './types'

describe('storage', () => {
  beforeEach(() => {
    chrome.storage.local.get.mockReset()
    chrome.storage.local.set.mockReset()
    chrome.storage.onChanged.clearListeners()
  })

  describe('getState', () => {
    it('returns default state when storage is empty', async () => {
      chrome.storage.local.get.mockResolvedValue({})
      const state = await getState()
      expect(state).toEqual(DEFAULT_STATE)
    })

    it('returns stored state', async () => {
      const stored: StorageState = {
        ...DEFAULT_STATE,
        blockingEnabled: false,
        rules: [
          {
            id: 'abc',
            pattern: 'facebook.com',
            type: 'url',
            enabled: true,
            schedule: null,
            createdAt: 1000,
          },
        ],
      }
      chrome.storage.local.get.mockResolvedValue({ state: stored })
      const state = await getState()
      expect(state).toEqual(stored)
    })
  })

  describe('setState', () => {
    it('writes state to storage', async () => {
      chrome.storage.local.set.mockResolvedValue(undefined)
      const newState: StorageState = { ...DEFAULT_STATE, blockingEnabled: false }
      await setState(newState)
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ state: newState })
    })
  })

  describe('onStateChange', () => {
    it('registers a listener for state changes', () => {
      const callback = vi.fn()
      onStateChange(callback)
      expect(chrome.storage.onChanged.getListeners().size).toBe(1)
    })
  })
})
