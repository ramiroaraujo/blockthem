import { useState } from 'react'
import type { BlockRule, StorageState } from '../../shared/types'
import { formatSchedule } from '../../shared/schedule'
import { AddRuleModal } from './AddRuleModal'

interface BlockListProps {
  state: StorageState
  onUpdateState: (updates: Partial<StorageState>) => void
}

export function BlockList({ state, onUpdateState }: BlockListProps) {
  const [showAddModal, setShowAddModal] = useState(false)

  const addRule = (ruleData: Omit<BlockRule, 'id' | 'createdAt'>) => {
    const newRule: BlockRule = {
      ...ruleData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }
    onUpdateState({ rules: [...state.rules, newRule] })
    setShowAddModal(false)
  }

  const deleteRule = (id: string) => {
    onUpdateState({ rules: state.rules.filter((r) => r.id !== id) })
  }

  const handleExport = () => {
    const { passwordHash, passwordSalt, ...exportData } = state
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'blockthem-rules.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const data = JSON.parse(text)
        if (Array.isArray(data.rules)) {
          onUpdateState({
            rules: data.rules,
            globalSchedule: data.globalSchedule ?? state.globalSchedule,
            blockingEnabled: data.blockingEnabled ?? state.blockingEnabled,
          })
        }
      } catch {
        alert('Invalid JSON file')
      }
    }
    input.click()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Block List</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            Block sites permanently or by schedule
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        style={{
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 6,
          fontSize: 13,
          marginBottom: 24,
        }}
      >
        + Add to Block List
      </button>

      {state.rules.length === 0 ? (
        <div style={{
          padding: 40,
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 14,
        }}>
          No blocked sites yet. Add a URL or regex pattern to get started.
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Blocked Items ({state.rules.length})
          </div>
          {state.rules.map((rule) => (
            <div
              key={rule.id}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 13 }}>{rule.pattern}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
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
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  fontSize: 16,
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
        <button
          onClick={handleExport}
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          ↑ Export
        </button>
        <button
          onClick={handleImport}
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          ↓ Import
        </button>
      </div>

      {showAddModal && (
        <AddRuleModal onAdd={addRule} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
