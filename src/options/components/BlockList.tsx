import { useState } from 'react';

import type { BlockRule, StorageState } from '../../shared/types';
import { ToggleSwitch } from '../../shared/components/ToggleSwitch';
import { formatSchedule } from '../../shared/schedule';
import { AddRuleModal } from './AddRuleModal';

interface BlockListProps {
  state: StorageState;
  onUpdateState: (updates: Partial<StorageState>) => void;
}

export function BlockList({ state, onUpdateState }: BlockListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<BlockRule | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );

  const addRule = (ruleData: Omit<BlockRule, 'id' | 'createdAt'>) => {
    const newRule: BlockRule = {
      ...ruleData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    onUpdateState({ rules: [...state.rules, newRule] });
    setShowAddModal(false);
  };

  const updateRule = (ruleData: Omit<BlockRule, 'id' | 'createdAt'>) => {
    if (!editingRule) return;
    onUpdateState({
      rules: state.rules.map((r) =>
        r.id === editingRule.id
          ? { ...ruleData, id: r.id, createdAt: r.createdAt }
          : r,
      ),
    });
    setEditingRule(null);
  };

  const deleteRule = (id: string) => {
    onUpdateState({ rules: state.rules.filter((r) => r.id !== id) });
    setConfirmingDeleteId(null);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingRule(null);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ rules: state.rules }, null, 2)], {
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
        const data = JSON.parse(text) as { rules?: BlockRule[] };
        if (Array.isArray(data.rules)) {
          onUpdateState({ rules: data.rules });
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

      <div className="mb-6">
        <div className="mb-2 text-xs text-text-secondary">Category Filters</div>
        <div className="mb-2 flex items-center justify-between rounded-lg bg-surface px-4 py-3">
          <div>
            <div className="text-[13px]">Block adult sites</div>
            <div className="mt-0.5 text-[11px] text-text-muted">
              ~77K sites from community blocklist
            </div>
          </div>
          <ToggleSwitch
            enabled={state.blockAdultSites}
            onClick={() =>
              onUpdateState({ blockAdultSites: !state.blockAdultSites })
            }
          />
        </div>
        <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
          <div>
            <div className="text-[13px]">Block gambling sites</div>
            <div className="mt-0.5 text-[11px] text-text-muted">
              ~6K sites from community blocklist
            </div>
          </div>
          <ToggleSwitch
            enabled={state.blockGamblingSites}
            onClick={() =>
              onUpdateState({ blockGamblingSites: !state.blockGamblingSites })
            }
          />
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-2">
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-md border-none bg-primary px-5 py-2.5 text-[13px] text-white"
        >
          + Add to Block List
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="rounded-md border border-border bg-surface px-4 py-2 text-[13px] text-text-secondary"
          >
            ↑ Export Rules
          </button>
          <button
            onClick={handleImport}
            className="rounded-md border border-border bg-surface px-4 py-2 text-[13px] text-text-secondary"
          >
            ↓ Import Rules
          </button>
        </div>
      </div>

      {state.rules.length === 0 ? (
        <div className="p-10 text-center text-sm text-text-muted">
          No blocked sites yet. Add a URL or regex pattern to get started.
        </div>
      ) : (
        <div>
          <div className="mb-2 text-xs text-text-secondary">
            Blocked Items ({state.rules.length})
          </div>
          {state.rules.map((rule) => {
            const isConfirming = confirmingDeleteId === rule.id;
            return (
              <div
                key={rule.id}
                className="mb-2 flex items-center justify-between rounded-lg bg-surface px-4 py-3"
                onClick={() => isConfirming && setConfirmingDeleteId(null)}
              >
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingRule(rule);
                  }}
                >
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
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRule(rule);
                    }}
                    className="border-none bg-transparent p-1 px-2 text-base text-text-muted"
                    title="Edit rule"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmingDeleteId(isConfirming ? null : rule.id);
                    }}
                    className="border-none bg-transparent p-1 px-2 text-base text-text-muted"
                    title="Delete rule"
                  >
                    🗑
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-200"
                    style={{
                      width: isConfirming ? 76 : 0,
                      opacity: isConfirming ? 1 : 0,
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRule(rule.id);
                      }}
                      className="whitespace-nowrap rounded-md border-none bg-error px-3 py-1 text-xs text-white"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showAddModal || editingRule) && (
        <AddRuleModal
          existingPatterns={state.rules.map((r) => r.pattern)}
          editRule={editingRule ?? undefined}
          onAdd={editingRule ? updateRule : addRule}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
