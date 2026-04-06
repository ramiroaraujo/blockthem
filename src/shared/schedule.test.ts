import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Schedule } from './types';
import { formatSchedule, isScheduleActive } from './schedule';

describe('isScheduleActive', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true when current time is within schedule', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T10:30:00')); // Monday
    const schedule: Schedule = {
      days: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '17:00',
    };
    expect(isScheduleActive(schedule)).toBe(true);
  });

  it('returns false when current time is outside schedule hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T20:00:00')); // Monday 8pm
    const schedule: Schedule = {
      days: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '17:00',
    };
    expect(isScheduleActive(schedule)).toBe(false);
  });

  it('returns false when current day is not in schedule', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-05T10:30:00')); // Sunday
    const schedule: Schedule = {
      days: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '17:00',
    };
    expect(isScheduleActive(schedule)).toBe(false);
  });

  it('handles overnight schedule (start > end) — active before midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T23:00:00')); // Monday 11pm
    const schedule: Schedule = {
      days: [1],
      startTime: '22:00',
      endTime: '06:00',
    };
    expect(isScheduleActive(schedule)).toBe(true);
  });

  it('handles overnight schedule — active after midnight (next day)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-07T03:00:00')); // Tuesday 3am
    const schedule: Schedule = {
      days: [1], // Monday (the day the schedule starts)
      startTime: '22:00',
      endTime: '06:00',
    };
    expect(isScheduleActive(schedule)).toBe(true);
  });

  it('handles overnight schedule — inactive after end time next day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-07T07:00:00')); // Tuesday 7am
    const schedule: Schedule = {
      days: [1],
      startTime: '22:00',
      endTime: '06:00',
    };
    expect(isScheduleActive(schedule)).toBe(false);
  });

  it('returns true at exact start time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T09:00:00'));
    const schedule: Schedule = {
      days: [1],
      startTime: '09:00',
      endTime: '17:00',
    };
    expect(isScheduleActive(schedule)).toBe(true);
  });

  it('returns false at exact end time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T17:00:00'));
    const schedule: Schedule = {
      days: [1],
      startTime: '09:00',
      endTime: '17:00',
    };
    expect(isScheduleActive(schedule)).toBe(false);
  });

  it('returns true for all-day schedule (00:00-00:00)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T12:00:00'));
    const schedule: Schedule = {
      days: [1],
      startTime: '00:00',
      endTime: '00:00',
    };
    expect(isScheduleActive(schedule)).toBe(true);
  });
});

describe('formatSchedule', () => {
  it('formats a weekday schedule', () => {
    const schedule: Schedule = {
      days: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '17:00',
    };
    expect(formatSchedule(schedule)).toBe('Mon–Fri, 9:00 AM – 5:00 PM');
  });

  it('formats a single day schedule', () => {
    const schedule: Schedule = {
      days: [0],
      startTime: '10:00',
      endTime: '14:00',
    };
    expect(formatSchedule(schedule)).toBe('Sun, 10:00 AM – 2:00 PM');
  });

  it('formats non-consecutive days', () => {
    const schedule: Schedule = {
      days: [1, 3, 5],
      startTime: '08:00',
      endTime: '20:00',
    };
    expect(formatSchedule(schedule)).toBe('Mon, Wed, Fri, 8:00 AM – 8:00 PM');
  });
});
