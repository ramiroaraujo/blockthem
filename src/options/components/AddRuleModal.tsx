import { useState } from 'react';

import type { BlockRule, Schedule } from '../../shared/types';
import { ToggleSwitch } from '../../shared/components/ToggleSwitch';
import { t } from '../../shared/i18n';
import { validateRulePattern } from '../../shared/schemas';
import { ScheduleEditor } from './ScheduleEditor';

interface AddRuleModalProps {
  existingPatterns: string[];
  editRule?: BlockRule;
  onAdd: (rule: Omit<BlockRule, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function AddRuleModal({
  existingPatterns,
  editRule,
  onAdd,
  onClose,
}: AddRuleModalProps) {
  const [type, setType] = useState<'url' | 'regex'>(editRule?.type ?? 'url');
  const [pattern, setPattern] = useState(editRule?.pattern ?? '');
  const [useCustomSchedule, setUseCustomSchedule] = useState(
    editRule?.schedule !== null && editRule?.schedule !== undefined,
  );
  const [error, setError] = useState('');
  const [schedule, setSchedule] = useState<Schedule>(
    editRule?.schedule ?? {
      days: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '17:00',
    },
  );

  const handleSubmit = () => {
    const trimmed = pattern.trim();
    if (!trimmed) return;
    if (existingPatterns.includes(trimmed) && trimmed !== editRule?.pattern) {
      setError(t('addrule_duplicate'));
      return;
    }
    const patternError = validateRulePattern(trimmed, type);
    if (patternError) {
      setError(patternError);
      return;
    }
    onAdd({
      pattern: trimmed,
      type,
      enabled: true,
      schedule: useCustomSchedule ? schedule : null,
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-[440px] overflow-y-auto rounded-xl bg-sidebar p-6"
      >
        <h2 className="mb-5 text-base">
          {editRule ? t('addrule_title_edit') : t('addrule_title_add')}
        </h2>

        {/* Type selector */}
        <div className="mb-4">
          <div className="mb-1.5 text-xs text-text-secondary">
            {t('addrule_type_label')}
          </div>
          <div className="flex gap-2">
            {(['url', 'regex'] as const).map((typeOption) => (
              <button
                key={typeOption}
                onClick={() => setType(typeOption)}
                className={`flex-1 rounded-md p-2 text-[13px] ${
                  type === typeOption
                    ? 'border-none bg-primary text-white'
                    : 'border border-border bg-surface text-text-secondary'
                }`}
              >
                {typeOption === 'url'
                  ? t('addrule_type_url')
                  : t('addrule_type_regex')}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern input */}
        <div className="mb-4">
          <div className="mb-1.5 text-xs text-text-secondary">
            {type === 'url'
              ? t('addrule_pattern_label_url')
              : t('addrule_pattern_label_regex')}
          </div>
          <input
            type="text"
            value={pattern}
            onChange={(e) => {
              setPattern(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={
              type === 'url'
                ? t('addrule_pattern_placeholder_url')
                : t('addrule_pattern_placeholder_regex')
            }
            autoFocus
            className={`w-full rounded-md border bg-bg px-3 py-2.5 text-[13px] text-text ${
              error ? 'border-error' : 'border-border'
            }`}
          />
          {error && <div className="mt-1 text-[11px] text-error">{error}</div>}
        </div>

        {/* Custom schedule toggle */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-text-secondary">
              {t('addrule_custom_schedule')}
            </div>
            <ToggleSwitch
              enabled={useCustomSchedule}
              onClick={() => setUseCustomSchedule(!useCustomSchedule)}
              size="sm"
            />
          </div>
          <div className="mt-1 text-[11px] text-text-muted">
            {t('addrule_custom_schedule_helper')}
          </div>
        </div>

        {useCustomSchedule && (
          <div className="mb-4">
            <ScheduleEditor schedule={schedule} onChange={setSchedule} />
          </div>
        )}

        {/* Buttons */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] text-text-secondary"
          >
            {t('addrule_cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-md border-none bg-primary px-4 py-2 text-[13px] text-white"
          >
            {editRule ? t('addrule_save_edit') : t('addrule_save_add')}
          </button>
        </div>
      </div>
    </div>
  );
}
