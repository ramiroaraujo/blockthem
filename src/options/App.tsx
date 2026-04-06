import { useEffect, useState } from 'react';

import type { StorageState } from '../shared/types';
import { getState, onStateChange, updateState } from '../shared/storage';
import { DEFAULT_STATE } from '../shared/types';
import { BlockList } from './components/BlockList';
import { PasswordGate } from './components/PasswordGate';
import { PasswordPage } from './components/PasswordPage';
import { SchedulePage } from './components/SchedulePage';
import { Sidebar } from './components/Sidebar';

export function App() {
  const [state, setLocalState] = useState<StorageState>(DEFAULT_STATE);
  const [activePage, setActivePage] = useState('blocklist');
  const [loaded, setLoaded] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    void getState().then((s) => {
      setLocalState(s);
      setLoaded(true);
    });
    onStateChange((newState) => {
      setLocalState(newState);
    });
  }, []);

  const handleUpdateState = async (updates: Partial<StorageState>) => {
    const newState = await updateState(updates);
    setLocalState(newState);
  };

  if (!loaded) return null;

  if (loaded && state.passwordHash && state.passwordSalt && !unlocked) {
    return (
      <PasswordGate
        passwordHash={state.passwordHash}
        passwordSalt={state.passwordSalt}
        onUnlock={() => setUnlocked(true)}
      />
    );
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
  );
}
