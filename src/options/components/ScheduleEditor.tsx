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
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            marginBottom: 8,
          }}
        >
          Active days
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {DAYS.map((label, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: schedule.days.includes(i)
                  ? 'none'
                  : '1px solid var(--color-border)',
                background: schedule.days.includes(i)
                  ? 'var(--color-primary)'
                  : 'var(--color-surface)',
                color: schedule.days.includes(i)
                  ? 'white'
                  : 'var(--color-text-muted)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              marginBottom: 6,
            }}
          >
            Start time
          </div>
          <input
            type="time"
            value={schedule.startTime}
            onChange={(e) =>
              onChange({ ...schedule, startTime: e.target.value })
            }
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              padding: '10px 12px',
              color: 'var(--color-text)',
              fontSize: 13,
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              marginBottom: 6,
            }}
          >
            End time
          </div>
          <input
            type="time"
            value={schedule.endTime}
            onChange={(e) => onChange({ ...schedule, endTime: e.target.value })}
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              padding: '10px 12px',
              color: 'var(--color-text)',
              fontSize: 13,
            }}
          />
        </div>
      </div>
    </div>
  );
}
