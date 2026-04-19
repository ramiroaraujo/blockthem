import { z } from 'zod';

import { t } from './i18n';

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
  { message: t('schemas_invalid_regex') },
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
    { message: t('schemas_regex_rule_invalid') },
  );

export const TemporaryUnblockSchema = z.object({
  domain: z.string().min(1),
  expiresAt: z.number(),
});

export const ImportDataSchema = z.object({
  rules: z.array(BlockRuleSchema),
  globalSchedule: ScheduleSchema.nullable().optional(),
  scheduleEnabled: z.boolean().optional(),
  blockingEnabled: z.boolean().optional(),
});

export const PasswordSchema = z
  .string()
  .min(6, t('schemas_password_min_length'));

export function validateRulePattern(
  pattern: string,
  type: 'url' | 'regex',
): string | null {
  if (!pattern.trim()) return t('schemas_pattern_required');
  if (type === 'regex') {
    const result = safeRegex.safeParse(pattern);
    if (!result.success) return result.error.issues[0].message;
  }
  return null;
}
