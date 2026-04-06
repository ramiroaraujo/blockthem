import type { Schedule } from './types';

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

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
}

export function formatSchedule(schedule: Schedule): string {
  const { days, startTime, endTime } = schedule;
  const sorted = [...days].sort((a, b) => a - b);

  let dayStr: string;
  const isConsecutive = sorted.every(
    (d, i) => i === 0 || d === sorted[i - 1] + 1,
  );

  if (isConsecutive && sorted.length > 2) {
    dayStr = `${DAY_NAMES[sorted[0]]}–${DAY_NAMES[sorted[sorted.length - 1]]}`;
  } else {
    dayStr = sorted.map((d) => DAY_NAMES[d]).join(', ');
  }

  return `${dayStr}, ${formatTime12h(startTime)} – ${formatTime12h(endTime)}`;
}
