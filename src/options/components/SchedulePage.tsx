import type { Schedule, StorageState } from '../../shared/types'
import { ScheduleEditor } from './ScheduleEditor'
import { formatSchedule } from '../../shared/schedule'

interface SchedulePageProps {
  state: StorageState
  onUpdateState: (updates: Partial<StorageState>) => void
}

const DEFAULT_SCHEDULE: Schedule = {
  days: [1, 2, 3, 4, 5],
  startTime: '09:00',
  endTime: '17:00',
}

export function SchedulePage({ state, onUpdateState }: SchedulePageProps) {
  const enabled = state.globalSchedule !== null
  const schedule = state.globalSchedule ?? DEFAULT_SCHEDULE

  const toggleEnabled = () => {
    onUpdateState({
      globalSchedule: enabled ? null : { ...DEFAULT_SCHEDULE },
    })
  }

  const updateSchedule = (newSchedule: Schedule) => {
    onUpdateState({ globalSchedule: newSchedule })
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Global Schedule</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 24 }}>
        Applies to all rules without a custom schedule
      </p>

      {/* Enable toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: 'var(--color-surface)',
        borderRadius: 8,
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 13 }}>Enable global schedule</div>
        <div
          onClick={toggleEnabled}
          style={{
            width: 40,
            height: 22,
            borderRadius: 11,
            background: enabled ? 'var(--color-primary)' : 'var(--color-border)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <div style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: enabled ? 'white' : '#666',
            position: 'absolute',
            top: 2,
            left: enabled ? 20 : 2,
            transition: 'left 0.2s',
          }} />
        </div>
      </div>

      {enabled && (
        <>
          <ScheduleEditor schedule={schedule} onChange={updateSchedule} />

          {/* Summary */}
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 8,
            padding: '12px 16px',
            borderLeft: '3px solid var(--color-primary)',
            marginTop: 24,
          }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Schedule summary
            </div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              Blocking {formatSchedule(schedule)}
            </div>
          </div>
        </>
      )}

      {!enabled && (
        <div style={{
          padding: 24,
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 14,
        }}>
          No global schedule — all enabled rules are always active.
        </div>
      )}
    </div>
  )
}
