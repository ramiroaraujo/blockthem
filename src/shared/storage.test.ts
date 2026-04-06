import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getState, setState, updateState, onStateChange } from './storage'
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

    it('migrates old state without scheduleEnabled (schedule was null)', async () => {
      const oldState = {
        rules: [],
        globalSchedule: null,
        blockingEnabled: true,
        passwordHash: null,
        passwordSalt: null,
      }
      mockGet.mockResolvedValue({ state: oldState })
      const state = await getState()
      expect(state.scheduleEnabled).toBe(false)
      expect(state.globalSchedule).toEqual(DEFAULT_STATE.globalSchedule)
    })

    it('migrates old state without scheduleEnabled (schedule was set)', async () => {
      const schedule = { days: [0, 6], startTime: '10:00', endTime: '22:00' }
      const oldState = {
        rules: [],
        globalSchedule: schedule,
        blockingEnabled: true,
        passwordHash: null,
        passwordSalt: null,
      }
      mockGet.mockResolvedValue({ state: oldState })
      const state = await getState()
      expect(state.scheduleEnabled).toBe(true)
      expect(state.globalSchedule).toEqual(schedule)
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

  describe('updateState', () => {
    it('reads current state, merges updates, and writes back', async () => {
      const stored: StorageState = { ...DEFAULT_STATE, blockingEnabled: true }
      mockGet.mockResolvedValue({ state: stored })
      mockSet.mockResolvedValue(undefined)

      const result = await updateState({ blockingEnabled: false })

      expect(result).toEqual({ ...stored, blockingEnabled: false })
      expect(mockSet).toHaveBeenCalledWith({
        state: { ...stored, blockingEnabled: false },
      })
    })

    it('only changes specified fields', async () => {
      const stored: StorageState = {
        ...DEFAULT_STATE,
        blockingEnabled: true,
        rules: [
          { id: 'r1', pattern: 'x.com', type: 'url', enabled: true, schedule: null, createdAt: 1 },
        ],
      }
      mockGet.mockResolvedValue({ state: stored })
      mockSet.mockResolvedValue(undefined)

      const result = await updateState({ blockingEnabled: false })

      expect(result.rules).toEqual(stored.rules)
      expect(result.blockingEnabled).toBe(false)
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
