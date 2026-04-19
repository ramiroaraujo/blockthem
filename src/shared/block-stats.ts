export interface DomainStats {
  today: number;
  todayDate: string; // "YYYY-MM-DD"
  week: number;
  weekStart: string; // "YYYY-MM-DD" (Monday)
  month: number;
  monthKey: string; // "YYYY-MM"
  total: number;
}

export type BlockStats = Record<string, DomainStats>;

export interface StatCounts {
  today: number;
  week: number;
  month: number;
  total: number;
  hasMultipleDays: boolean;
  hasMultipleWeeks: boolean;
  hasMultipleMonths: boolean;
}

/** Format a Date as "YYYY-MM-DD". */
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Get the Monday of the week containing `d`, as "YYYY-MM-DD". */
function toWeekKey(d: Date): string {
  const monday = new Date(d);
  const dayOfWeek = d.getDay();
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(d.getDate() - offset);
  return toDateKey(monday);
}

/** Format a Date as "YYYY-MM". */
function toMonthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** Read effective counts from stored stats, resetting stale periods. */
export function computeStatCounts(
  stats: DomainStats,
  now: Date = new Date(),
): StatCounts {
  const currentDay = toDateKey(now);
  const currentWeek = toWeekKey(now);
  const currentMonth = toMonthKey(now);

  const today = stats.todayDate === currentDay ? stats.today : 0;
  const week = stats.weekStart === currentWeek ? stats.week : 0;
  const month = stats.monthKey === currentMonth ? stats.month : 0;
  const total = stats.total;

  return {
    today,
    week,
    month,
    total,
    hasMultipleDays: week > today || (month > week && week === 0),
    hasMultipleWeeks: month > week,
    hasMultipleMonths: total > month,
  };
}

/** Record a block event. Returns a new stats object (does not mutate input). */
export function recordEvent(
  stats: BlockStats,
  hostname: string,
  now: Date = new Date(),
): BlockStats {
  const currentDay = toDateKey(now);
  const currentWeek = toWeekKey(now);
  const currentMonth = toMonthKey(now);

  const existing = stats[hostname];
  const entry: DomainStats = existing
    ? { ...existing }
    : {
        today: 0,
        todayDate: currentDay,
        week: 0,
        weekStart: currentWeek,
        month: 0,
        monthKey: currentMonth,
        total: 0,
      };

  // Reset stale periods
  if (entry.todayDate !== currentDay) {
    entry.today = 0;
    entry.todayDate = currentDay;
  }
  if (entry.weekStart !== currentWeek) {
    entry.week = 0;
    entry.weekStart = currentWeek;
  }
  if (entry.monthKey !== currentMonth) {
    entry.month = 0;
    entry.monthKey = currentMonth;
  }

  entry.today++;
  entry.week++;
  entry.month++;
  entry.total++;

  return { ...stats, [hostname]: entry };
}
