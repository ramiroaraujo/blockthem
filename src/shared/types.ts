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
  globalSchedule: Schedule | null
  blockingEnabled: boolean
  passwordHash: string | null
  passwordSalt: string | null
}

export const DEFAULT_STATE: StorageState = {
  rules: [],
  globalSchedule: null,
  blockingEnabled: true,
  passwordHash: null,
  passwordSalt: null,
}
