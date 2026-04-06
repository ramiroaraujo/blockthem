export interface Schedule {
  days: number[]      // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string   // "HH:mm" (24h)
  endTime: string     // "HH:mm" (24h)
}

export interface BlockRule {
  id: string
  pattern: string
  type: 'url' | 'regex'
  enabled: boolean
  schedule: Schedule | null
  createdAt: number
}

export interface StorageState {
  rules: BlockRule[]
  globalSchedule: Schedule
  scheduleEnabled: boolean
  blockingEnabled: boolean
  passwordHash: string | null
  passwordSalt: string | null
}

export const DEFAULT_STATE: StorageState = {
  rules: [],
  globalSchedule: { days: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' },
  scheduleEnabled: false,
  blockingEnabled: true,
  passwordHash: null,
  passwordSalt: null,
}
