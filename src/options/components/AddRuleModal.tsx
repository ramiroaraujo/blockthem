import { useState } from 'react';

import type { BlockRule, Schedule } from '../../shared/types';
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
  const [useCustomSchedule, setUseCustomSchedule] = useState(editRule?.schedule !== null && editRule?.schedule !== undefined);
  const [error, setError] = useState('');
  const [schedule, setSchedule] = useState<Schedule>(editRule?.schedule ?? {
    days: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '17:00',
  });

  const handleSubmit = () => {
    const trimmed = pattern.trim();
    if (!trimmed) return;
    if (existingPatterns.includes(trimmed) && trimmed !== editRule?.pattern) {
      setError('This pattern is already in your block list');
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
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-sidebar)',
          borderRadius: 12,
          padding: 24,
          width: 440,
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 20 }}>{editRule ? 'Edit Block Rule' : 'Add Block Rule'}</h2>

        {/* Type selector */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              marginBottom: 6,
            }}
          >
            Type
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['url', 'regex'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  flex: 1,
                  padding: 8,
                  border: type === t ? 'none' : '1px solid var(--color-border)',
                  borderRadius: 6,
                  background:
                    type === t
                      ? 'var(--color-primary)'
                      : 'var(--color-surface)',
                  color: type === t ? 'white' : 'var(--color-text-secondary)',
                  fontSize: 13,
                  textTransform: 'uppercase',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern input */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              marginBottom: 6,
            }}
          >
            {type === 'url' ? 'URL to block' : 'Regex pattern'}
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
              type === 'url' ? 'e.g. facebook.com' : 'e.g. .*social.*'
            }
            autoFocus
            style={{
              width: '100%',
              background: 'var(--color-bg)',
              border: `1px solid ${error ? '#e74c3c' : 'var(--color-border)'}`,
              borderRadius: 6,
              padding: '10px 12px',
              color: 'var(--color-text)',
              fontSize: 13,
            }}
          />
          {error && (
            <div style={{ color: '#e74c3c', fontSize: 11, marginTop: 4 }}>
              {error}
            </div>
          )}
        </div>

        {/* Custom schedule toggle */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Custom schedule
            </div>
            <div
              onClick={() => setUseCustomSchedule(!useCustomSchedule)}
              style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                background: useCustomSchedule
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: useCustomSchedule ? 'white' : '#666',
                  position: 'absolute',
                  top: 2,
                  left: useCustomSchedule ? 18 : 2,
                  transition: 'left 0.2s',
                }}
              />
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--color-text-muted)',
              marginTop: 4,
            }}
          >
            Uses global schedule when off
          </div>
        </div>

        {useCustomSchedule && (
          <div style={{ marginBottom: 16 }}>
            <ScheduleEditor schedule={schedule} onChange={setSchedule} />
          </div>
        )}

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
            marginTop: 20,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            {editRule ? 'Save Changes' : 'Add Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}
