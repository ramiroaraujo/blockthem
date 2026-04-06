import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { getState, setState, onStateChange } from '../shared/storage'
import type { StorageState } from '../shared/types'
import { DEFAULT_STATE } from '../shared/types'

export function App() {
  const [state, setLocalState] = useState<StorageState>(DEFAULT_STATE)
  const [activePage, setActivePage] = useState('blocklist')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getState().then((s) => {
      setLocalState(s)
      setLoaded(true)
    })
    onStateChange((newState) => {
      setLocalState(newState)
    })
  }, [])

  const updateState = async (updates: Partial<StorageState>) => {
    const newState = { ...state, ...updates }
    setLocalState(newState)
    await setState(newState)
  }

  if (!loaded) return null

  return (
    <>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        blockingEnabled={state.blockingEnabled}
        onToggleBlocking={() =>
          updateState({ blockingEnabled: !state.blockingEnabled })
        }
      />
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {activePage === 'blocklist' && (
          <div>
            <h1 style={{ fontSize: 24, marginBottom: 4 }}>Block List</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              Block sites permanently or by schedule
            </p>
          </div>
        )}
        {activePage === 'schedule' && (
          <div>
            <h1 style={{ fontSize: 24, marginBottom: 4 }}>Global Schedule</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              Applies to all rules without a custom schedule
            </p>
          </div>
        )}
        {activePage === 'password' && (
          <div>
            <h1 style={{ fontSize: 24, marginBottom: 4 }}>Password Protection</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              Protect all settings with a password
            </p>
          </div>
        )}
      </main>
    </>
  )
}
