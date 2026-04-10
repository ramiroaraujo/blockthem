import { describe, expect, it } from 'vitest';

import type { DomainStats } from './block-stats';
import { computeStatCounts, recordEvent } from './block-stats';

// Fixed reference: Wednesday 2026-04-08 12:00
const NOW = new Date('2026-04-08T12:00:00');

function makeStats(overrides: Partial<DomainStats> = {}): DomainStats {
  return {
    today: 0,
    todayDate: '2026-04-08',
    week: 0,
    weekStart: '2026-04-06', // Monday
    month: 0,
    monthKey: '2026-04',
    total: 0,
    ...overrides,
  };
}

describe('computeStatCounts', () => {
  it('returns current counts when all periods are fresh', () => {
    const stats = makeStats({ today: 3, week: 7, month: 15, total: 42 });
    const counts = computeStatCounts(stats, NOW);
    expect(counts.today).toBe(3);
    expect(counts.week).toBe(7);
    expect(counts.month).toBe(15);
    expect(counts.total).toBe(42);
  });

  it('resets today when date is stale', () => {
    const stats = makeStats({
      today: 5,
      todayDate: '2026-04-07', // yesterday
      week: 10,
      month: 20,
      total: 50,
    });
    const counts = computeStatCounts(stats, NOW);
    expect(counts.today).toBe(0);
    expect(counts.week).toBe(10);
    expect(counts.month).toBe(20);
    expect(counts.total).toBe(50);
  });

  it('resets week when week is stale', () => {
    const stats = makeStats({
      today: 2,
      todayDate: '2026-04-08',
      week: 8,
      weekStart: '2026-03-30', // previous week
      month: 20,
      total: 50,
    });
    const counts = computeStatCounts(stats, NOW);
    expect(counts.today).toBe(2);
    expect(counts.week).toBe(0);
    expect(counts.month).toBe(20);
  });

  it('resets month when month is stale', () => {
    const stats = makeStats({
      today: 1,
      todayDate: '2026-04-08',
      week: 3,
      weekStart: '2026-04-06',
      month: 15,
      monthKey: '2026-03', // previous month
      total: 50,
    });
    const counts = computeStatCounts(stats, NOW);
    expect(counts.today).toBe(1);
    expect(counts.week).toBe(3);
    expect(counts.month).toBe(0);
    expect(counts.total).toBe(50);
  });

  it('total is always returned regardless of staleness', () => {
    const stats = makeStats({
      todayDate: '2025-01-01',
      weekStart: '2025-01-01',
      monthKey: '2025-01',
      total: 100,
    });
    const counts = computeStatCounts(stats, NOW);
    expect(counts.today).toBe(0);
    expect(counts.week).toBe(0);
    expect(counts.month).toBe(0);
    expect(counts.total).toBe(100);
  });

  describe('progressive column flags', () => {
    it('all false when only today has data', () => {
      const stats = makeStats({ today: 3, week: 3, month: 3, total: 3 });
      const counts = computeStatCounts(stats, NOW);
      expect(counts.hasMultipleDays).toBe(false);
      expect(counts.hasMultipleWeeks).toBe(false);
      expect(counts.hasMultipleMonths).toBe(false);
    });

    it('hasMultipleDays when week > today', () => {
      const stats = makeStats({ today: 2, week: 5, month: 5, total: 5 });
      const counts = computeStatCounts(stats, NOW);
      expect(counts.hasMultipleDays).toBe(true);
      expect(counts.hasMultipleWeeks).toBe(false);
    });

    it('hasMultipleWeeks when month > week', () => {
      const stats = makeStats({ today: 1, week: 3, month: 8, total: 8 });
      const counts = computeStatCounts(stats, NOW);
      expect(counts.hasMultipleDays).toBe(true);
      expect(counts.hasMultipleWeeks).toBe(true);
      expect(counts.hasMultipleMonths).toBe(false);
    });

    it('hasMultipleMonths when total > month', () => {
      const stats = makeStats({ today: 1, week: 2, month: 5, total: 20 });
      const counts = computeStatCounts(stats, NOW);
      expect(counts.hasMultipleDays).toBe(true);
      expect(counts.hasMultipleWeeks).toBe(true);
      expect(counts.hasMultipleMonths).toBe(true);
    });

    it('hasMultipleDays true when today is stale but week has data', () => {
      const stats = makeStats({
        today: 3,
        todayDate: '2026-04-07', // stale
        week: 5,
        month: 5,
        total: 5,
      });
      const counts = computeStatCounts(stats, NOW);
      // today=0, week=5 → week > today
      expect(counts.hasMultipleDays).toBe(true);
    });
  });
});

describe('recordEvent', () => {
  it('creates a new entry for a new hostname', () => {
    const result = recordEvent({}, 'x.com', NOW);
    expect(result['x.com']).toEqual({
      today: 1,
      todayDate: '2026-04-08',
      week: 1,
      weekStart: '2026-04-06',
      month: 1,
      monthKey: '2026-04',
      total: 1,
    });
  });

  it('increments all counters for the same period', () => {
    const stats = {
      'x.com': makeStats({ today: 2, week: 5, month: 10, total: 30 }),
    };
    const result = recordEvent(stats, 'x.com', NOW);
    expect(result['x.com'].today).toBe(3);
    expect(result['x.com'].week).toBe(6);
    expect(result['x.com'].month).toBe(11);
    expect(result['x.com'].total).toBe(31);
  });

  it('resets today when recording on a new day', () => {
    const stats = {
      'x.com': makeStats({
        today: 5,
        todayDate: '2026-04-07', // yesterday
        week: 10,
        month: 20,
        total: 50,
      }),
    };
    const result = recordEvent(stats, 'x.com', NOW);
    expect(result['x.com'].today).toBe(1); // reset + 1
    expect(result['x.com'].todayDate).toBe('2026-04-08');
    expect(result['x.com'].week).toBe(11); // not reset, same week
    expect(result['x.com'].total).toBe(51);
  });

  it('resets week when recording in a new week', () => {
    const stats = {
      'x.com': makeStats({
        today: 3,
        todayDate: '2026-03-31',
        week: 8,
        weekStart: '2026-03-30', // previous week
        month: 20,
        total: 50,
      }),
    };
    const result = recordEvent(stats, 'x.com', NOW);
    expect(result['x.com'].today).toBe(1);
    expect(result['x.com'].week).toBe(1); // reset + 1
    expect(result['x.com'].weekStart).toBe('2026-04-06');
    expect(result['x.com'].month).toBe(21); // same month
  });

  it('resets month when recording in a new month', () => {
    const stats = {
      'x.com': makeStats({
        today: 2,
        todayDate: '2026-03-31',
        week: 5,
        weekStart: '2026-03-30',
        month: 15,
        monthKey: '2026-03',
        total: 40,
      }),
    };
    const result = recordEvent(stats, 'x.com', NOW);
    expect(result['x.com'].today).toBe(1);
    expect(result['x.com'].week).toBe(1);
    expect(result['x.com'].month).toBe(1); // reset + 1
    expect(result['x.com'].monthKey).toBe('2026-04');
    expect(result['x.com'].total).toBe(41);
  });

  it('does not mutate the input object', () => {
    const original = {
      'x.com': makeStats({ today: 2, week: 5, month: 10, total: 30 }),
    };
    const result = recordEvent(original, 'x.com', NOW);
    expect(original['x.com'].today).toBe(2);
    expect(result['x.com'].today).toBe(3);
  });

  it('preserves other hostnames', () => {
    const stats = {
      'x.com': makeStats({ total: 10 }),
      'reddit.com': makeStats({ total: 5 }),
    };
    const result = recordEvent(stats, 'x.com', NOW);
    expect(result['reddit.com'].total).toBe(5);
  });
});
