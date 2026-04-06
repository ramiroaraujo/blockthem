import { z } from 'zod';

export const ScheduleSchema = z.object({
  days: z.array(z.number().int().min(0).max(6)).min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const safeRegex = z.string().refine(
  (val) => {
    try {
      new RegExp(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid regex pattern' },
);

export const BlockRuleSchema = z
  .object({
    id: z.string().min(1),
    pattern: z.string().min(1),
    type: z.enum(['url', 'regex']),
    enabled: z.boolean(),
    schedule: ScheduleSchema.nullable(),
    createdAt: z.number(),
  })
  .refine(
    (rule) => {
      if (rule.type === 'regex') {
        return safeRegex.safeParse(rule.pattern).success;
      }
      return true;
    },
    { message: 'Regex rule has an invalid pattern' },
  );

export const ImportDataSchema = z.object({
  rules: z.array(BlockRuleSchema),
  globalSchedule: ScheduleSchema.nullable().optional(),
  scheduleEnabled: z.boolean().optional(),
  blockingEnabled: z.boolean().optional(),
});

export const PasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

export function validateRulePattern(
  pattern: string,
  type: 'url' | 'regex',
): string | null {
  if (!pattern.trim()) return 'Pattern is required';
  if (type === 'regex') {
    const result = safeRegex.safeParse(pattern);
    if (!result.success) return result.error.issues[0].message;
  }
  return null;
}
