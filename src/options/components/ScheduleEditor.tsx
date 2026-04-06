import type { Schedule } from '../../shared/types';

interface ScheduleEditorProps {
  schedule: Schedule;
  onChange: (schedule: Schedule) => void;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function ScheduleEditor({ schedule, onChange }: ScheduleEditorProps) {
  const toggleDay = (day: number) => {
    const days = schedule.days.includes(day)
      ? schedule.days.filter((d) => d !== day)
      : [...schedule.days, day];
    onChange({ ...schedule, days });
  };

  return (
    <div>
      <div className="mb-4">
        <div className="mb-2 text-xs text-text-secondary">Active days</div>
        <div className="flex gap-1.5">
          {DAYS.map((label, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              className={`h-9 w-9 rounded-full text-[11px] ${
                schedule.days.includes(i)
                  ? 'border-none bg-primary text-white'
                  : 'border border-border bg-surface text-text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="mb-1.5 text-xs text-text-secondary">Start time</div>
          <input
            type="time"
            value={schedule.startTime}
            onChange={(e) =>
              onChange({ ...schedule, startTime: e.target.value })
            }
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-[13px] text-text"
          />
        </div>
        <div className="flex-1">
          <div className="mb-1.5 text-xs text-text-secondary">End time</div>
          <input
            type="time"
            value={schedule.endTime}
            onChange={(e) => onChange({ ...schedule, endTime: e.target.value })}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-[13px] text-text"
          />
        </div>
      </div>
    </div>
  );
}
