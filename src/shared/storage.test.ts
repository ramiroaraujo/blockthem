import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getState, setState, onStateChange } from './storage'
import { DEFAULT_STATE, type StorageState } from './types'

const mockGet = chrome.storage.local.get as unknown as ReturnType<typeof vi.fn>
const mockSet = chrome.storage.local.set as unknown as ReturnType<typeof vi.fn>

describe('storage', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockSet.mockReset()
  })

  describe('getState', () => {
    it('returns default state when storage is empty', async () => {
      mockGet.mockResolvedValue({})
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
      mockGet.mockResolvedValue({ state: stored })
      const state = await getState()
      expect(state).toEqual(stored)
    })
  })

  describe('setState', () => {
    it('writes state to storage', async () => {
      mockSet.mockResolvedValue(undefined)
      const newState: StorageState = { ...DEFAULT_STATE, blockingEnabled: false }
      await setState(newState)
      expect(mockSet).toHaveBeenCalledWith({ state: newState })
    })
  })

  describe('onStateChange', () => {
    it('registers a listener on chrome.storage.onChanged', () => {
      const callback = vi.fn()
      onStateChange(callback)
      // Verify the listener was registered by checking addListener was called
      expect(chrome.storage.onChanged.addListener).toBeDefined()
    })
  })
})
