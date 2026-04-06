import { useState } from 'react';

import type { BlockRule, StorageState } from '../../shared/types';
import { formatSchedule } from '../../shared/schedule';
import { AddRuleModal } from './AddRuleModal';

interface BlockListProps {
  state: StorageState;
  onUpdateState: (updates: Partial<StorageState>) => void;
}

export function BlockList({ state, onUpdateState }: BlockListProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const addRule = (ruleData: Omit<BlockRule, 'id' | 'createdAt'>) => {
    const newRule: BlockRule = {
      ...ruleData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    onUpdateState({ rules: [...state.rules, newRule] });
    setShowAddModal(false);
  };

  const deleteRule = (id: string) => {
    onUpdateState({ rules: state.rules.filter((r) => r.id !== id) });
  };

  const handleExport = () => {
    const { passwordHash, passwordSalt, ...exportData } = state;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blockthem-rules.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data.rules)) {
          onUpdateState({
            rules: data.rules,
            globalSchedule: data.globalSchedule ?? state.globalSchedule,
            blockingEnabled: data.blockingEnabled ?? state.blockingEnabled,
          });
        }
      } catch {
        alert('Invalid JSON file');
      }
    };
    input.click();
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="mb-1 text-2xl">Block List</h1>
          <p className="text-sm text-text-muted">
            Block sites permanently or by schedule
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="mb-6 rounded-md border-none bg-primary px-5 py-2.5 text-[13px] text-white"
      >
        + Add to Block List
      </button>

      {state.rules.length === 0 ? (
        <div className="p-10 text-center text-sm text-text-muted">
          No blocked sites yet. Add a URL or regex pattern to get started.
        </div>
      ) : (
        <div>
          <div className="mb-2 text-xs text-text-secondary">
            Blocked Items ({state.rules.length})
          </div>
          {state.rules.map((rule) => (
            <div
              key={rule.id}
              className="mb-2 flex items-center justify-between rounded-lg bg-surface px-4 py-3"
            >
              <div>
                <div className="text-[13px]">{rule.pattern}</div>
                <div className="mt-0.5 text-[11px] text-text-muted">
                  {rule.type.toUpperCase()}
                  {rule.schedule
                    ? ` · ${formatSchedule(rule.schedule)}`
                    : state.globalSchedule
                      ? ' · Global schedule'
                      : ''}
                </div>
              </div>
              <button
                onClick={() => deleteRule(rule.id)}
                className="border-none bg-transparent p-1 px-2 text-base text-text-muted"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <button
          onClick={handleExport}
          className="rounded-md border border-border bg-surface px-4 py-2 text-[13px] text-text-secondary"
        >
          ↑ Export
        </button>
        <button
          onClick={handleImport}
          className="rounded-md border border-border bg-surface px-4 py-2 text-[13px] text-text-secondary"
        >
          ↓ Import
        </button>
      </div>

      {showAddModal && (
        <AddRuleModal
          existingPatterns={state.rules.map((r) => r.pattern)}
          onAdd={addRule}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
