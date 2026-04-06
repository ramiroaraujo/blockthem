import { t } from '../../shared/i18n';
import { dayNarrow } from '../../shared/schedule';
import type { Schedule } from '../../shared/types';

interface ScheduleEditorProps {
  schedule: Schedule;
  onChange: (schedule: Schedule) => void;
}

const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6];

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
        <div className="mb-2 text-xs text-text-secondary">
          {t('schedule_editor_active_days')}
        </div>
        <div className="flex gap-1.5">
          {DAY_INDICES.map((i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              className={`h-9 w-9 rounded-full text-[11px] ${
                schedule.days.includes(i)
                  ? 'border-none bg-primary text-white'
                  : 'border border-border bg-surface text-text-muted'
              }`}
            >
              {dayNarrow(i)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="mb-1.5 text-xs text-text-secondary">
            {t('schedule_editor_start_time')}
          </div>
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
          <div className="mb-1.5 text-xs text-text-secondary">
            {t('schedule_editor_end_time')}
          </div>
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
