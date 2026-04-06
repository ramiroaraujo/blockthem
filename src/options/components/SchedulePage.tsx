import type { Schedule, StorageState } from '../../shared/types';
import { ToggleSwitch } from '../../shared/components/ToggleSwitch';
import { t } from '../../shared/i18n';
import { formatSchedule } from '../../shared/schedule';
import { ScheduleEditor } from './ScheduleEditor';

interface SchedulePageProps {
  state: StorageState;
  onUpdateState: (updates: Partial<StorageState>) => void;
}

export function SchedulePage({ state, onUpdateState }: SchedulePageProps) {
  const enabled = state.scheduleEnabled;

  const toggleEnabled = () => {
    onUpdateState({ scheduleEnabled: !enabled });
  };

  const updateSchedule = (newSchedule: Schedule) => {
    onUpdateState({ globalSchedule: newSchedule });
  };

  return (
    <div className="max-w-[500px]">
      <h1 className="mb-1 text-2xl">{t('schedule_title')}</h1>
      <p className="mb-6 text-sm text-text-muted">{t('schedule_subtitle')}</p>

      {/* Enable toggle */}
      <div className="mb-6 flex items-center justify-between rounded-lg bg-surface px-4 py-3">
        <div className="text-[13px]">{t('schedule_enable')}</div>
        <ToggleSwitch enabled={enabled} onClick={toggleEnabled} />
      </div>

      {enabled && (
        <>
          <ScheduleEditor
            schedule={state.globalSchedule}
            onChange={updateSchedule}
          />

          {/* Summary */}
          <div className="mt-6 rounded-lg border-l-3 border-l-primary bg-surface px-4 py-3">
            <div className="text-xs text-text-secondary">
              {t('schedule_summary_label')}
            </div>
            <div className="mt-1 text-[13px]">
              {t('schedule_summary_active', [
                formatSchedule(state.globalSchedule),
              ])}
            </div>
          </div>
        </>
      )}

      {!enabled && (
        <div className="p-6 text-center text-sm text-text-muted">
          {t('schedule_summary_empty')}
        </div>
      )}
    </div>
  );
}
