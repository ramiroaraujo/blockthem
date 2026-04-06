import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { BlockList } from './components/BlockList'
import { SchedulePage } from './components/SchedulePage'
import { PasswordPage } from './components/PasswordPage'
import { PasswordGate } from './components/PasswordGate'
import { getState, updateState, onStateChange } from '../shared/storage'
import type { StorageState } from '../shared/types'
import { DEFAULT_STATE } from '../shared/types'

export function App() {
  const [state, setLocalState] = useState<StorageState>(DEFAULT_STATE)
  const [activePage, setActivePage] = useState('blocklist')
  const [loaded, setLoaded] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    getState().then((s) => {
      setLocalState(s)
      setLoaded(true)
    })
    onStateChange((newState) => {
      setLocalState(newState)
    })
  }, [])

  const handleUpdateState = async (updates: Partial<StorageState>) => {
    const newState = await updateState(updates)
    setLocalState(newState)
  }

  if (!loaded) return null

  if (loaded && state.passwordHash && state.passwordSalt && !unlocked) {
    return (
      <PasswordGate
        passwordHash={state.passwordHash}
        passwordSalt={state.passwordSalt}
        onUnlock={() => setUnlocked(true)}
      />
    )
  }

  return (
    <>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        blockingEnabled={state.blockingEnabled}
        onToggleBlocking={() =>
          handleUpdateState({ blockingEnabled: !state.blockingEnabled })
        }
      />
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {activePage === 'blocklist' && (
          <BlockList state={state} onUpdateState={handleUpdateState} />
        )}
        {activePage === 'schedule' && (
          <SchedulePage state={state} onUpdateState={handleUpdateState} />
        )}
        {activePage === 'password' && (
          <PasswordPage state={state} onUpdateState={handleUpdateState} />
        )}
      </main>
    </>
  )
}
