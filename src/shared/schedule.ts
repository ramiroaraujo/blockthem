import type { Schedule } from './types';
import { getUILocale, t } from './i18n';

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function currentMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

export function isScheduleActive(
  schedule: Schedule,
  now = new Date(),
): boolean {
  const { days, startTime, endTime } = schedule;
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const mins = currentMinutes(now);
  const today = now.getDay();

  // All-day schedule (00:00–00:00)
  if (start === end) {
    return days.includes(today);
  }

  // Normal schedule (start < end): e.g. 09:00–17:00
  if (start < end) {
    return days.includes(today) && mins >= start && mins < end;
  }

  // Overnight schedule (start > end): e.g. 22:00–06:00
  if (mins >= start && days.includes(today)) {
    return true;
  }
  const yesterday = (today + 6) % 7;
  if (mins < end && days.includes(yesterday)) {
    return true;
  }

  return false;
}

// Reference Sunday so dayIdx 0..6 maps to Sun..Sat regardless of locale.
const REF_SUNDAY = new Date(2024, 0, 7);
function refDate(dayIdx: number): Date {
  const d = new Date(REF_SUNDAY);
  d.setDate(REF_SUNDAY.getDate() + dayIdx);
  return d;
}

// Newer ICU emits a narrow no-break space (U+202F) between time and AM/PM.
// Normalize to a regular space for visual + test consistency.
function normalizeSpace(s: string): string {
  return s.replace(/\u202F/g, ' ');
}

export function dayShort(dayIdx: number): string {
  return normalizeSpace(
    new Intl.DateTimeFormat(getUILocale(), { weekday: 'short' }).format(
      refDate(dayIdx),
    ),
  );
}

export function dayNarrow(dayIdx: number): string {
  return normalizeSpace(
    new Intl.DateTimeFormat(getUILocale(), { weekday: 'narrow' }).format(
      refDate(dayIdx),
    ),
  );
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(2024, 0, 1, h, m);
  return normalizeSpace(
    new Intl.DateTimeFormat(getUILocale(), {
      hour: 'numeric',
      minute: '2-digit',
    }).format(d),
  );
}

export function formatSchedule(schedule: Schedule): string {
  const { days, startTime, endTime } = schedule;
  const sorted = [...days].sort((a, b) => a - b);

  const isConsecutive = sorted.every(
    (d, i) => i === 0 || d === sorted[i - 1] + 1,
  );

  const dayStr =
    isConsecutive && sorted.length > 2
      ? t('schedule_day_range', [
          dayShort(sorted[0]),
          dayShort(sorted[sorted.length - 1]),
        ])
      : sorted.map(dayShort).join(t('schedule_day_separator'));

  return t('schedule_format', [
    dayStr,
    formatTime(startTime),
    formatTime(endTime),
  ]);
}
