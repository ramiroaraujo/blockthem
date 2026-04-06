import { describe, it, expect } from 'vitest'
import {
  ScheduleSchema,
  BlockRuleSchema,
  ImportDataSchema,
  PasswordSchema,
  validateRulePattern,
} from './schemas'

describe('ScheduleSchema', () => {
  it('accepts a valid schedule', () => {
    const result = ScheduleSchema.safeParse({
      days: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '17:00',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty days array', () => {
    const result = ScheduleSchema.safeParse({
      days: [],
      startTime: '09:00',
      endTime: '17:00',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid day number', () => {
    const result = ScheduleSchema.safeParse({
      days: [7],
      startTime: '09:00',
      endTime: '17:00',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid time format', () => {
    const result = ScheduleSchema.safeParse({
      days: [1],
      startTime: '9am',
      endTime: '17:00',
    })
    expect(result.success).toBe(false)
  })
})

describe('BlockRuleSchema', () => {
  const validRule = {
    id: 'r1',
    pattern: 'facebook.com',
    type: 'url' as const,
    enabled: true,
    schedule: null,
    createdAt: 1000,
  }

  it('accepts a valid URL rule', () => {
    expect(BlockRuleSchema.safeParse(validRule).success).toBe(true)
  })

  it('accepts a valid regex rule', () => {
    const rule = { ...validRule, type: 'regex', pattern: '.*reddit\\.com.*' }
    expect(BlockRuleSchema.safeParse(rule).success).toBe(true)
  })

  it('rejects a regex rule with invalid pattern', () => {
    const rule = { ...validRule, type: 'regex', pattern: '[invalid' }
    expect(BlockRuleSchema.safeParse(rule).success).toBe(false)
  })

  it('rejects rule with missing fields', () => {
    const result = BlockRuleSchema.safeParse({ id: 'r1', pattern: 'x' })
    expect(result.success).toBe(false)
  })

  it('accepts rule with a schedule', () => {
    const rule = {
      ...validRule,
      schedule: { days: [1, 2], startTime: '09:00', endTime: '17:00' },
    }
    expect(BlockRuleSchema.safeParse(rule).success).toBe(true)
  })
})

describe('ImportDataSchema', () => {
  it('accepts valid import data', () => {
    const data = {
      rules: [
        {
          id: 'r1',
          pattern: 'facebook.com',
          type: 'url',
          enabled: true,
          schedule: null,
          createdAt: 1000,
        },
      ],
      blockingEnabled: true,
    }
    expect(ImportDataSchema.safeParse(data).success).toBe(true)
  })

  it('rejects import with invalid rules', () => {
    const data = {
      rules: [{ id: 'r1', pattern: '[bad', type: 'regex', enabled: true, schedule: null, createdAt: 1 }],
    }
    expect(ImportDataSchema.safeParse(data).success).toBe(false)
  })

  it('rejects import where rules is not an array', () => {
    expect(ImportDataSchema.safeParse({ rules: 'bad' }).success).toBe(false)
  })
})

describe('PasswordSchema', () => {
  it('accepts a password with 6+ characters', () => {
    expect(PasswordSchema.safeParse('secret').success).toBe(true)
  })

  it('rejects a password shorter than 6 characters', () => {
    const result = PasswordSchema.safeParse('short')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Password must be at least 6 characters'
      )
    }
  })

  it('rejects an empty password', () => {
    expect(PasswordSchema.safeParse('').success).toBe(false)
  })
})

describe('validateRulePattern', () => {
  it('returns null for a valid URL pattern', () => {
    expect(validateRulePattern('facebook.com', 'url')).toBeNull()
  })

  it('returns null for a valid regex pattern', () => {
    expect(validateRulePattern('.*reddit\\.com.*', 'regex')).toBeNull()
  })

  it('returns error for an invalid regex pattern', () => {
    expect(validateRulePattern('[invalid', 'regex')).toBe('Invalid regex pattern')
  })

  it('returns error for an empty pattern', () => {
    expect(validateRulePattern('', 'url')).toBe('Pattern is required')
    expect(validateRulePattern('  ', 'regex')).toBe('Pattern is required')
  })
})
