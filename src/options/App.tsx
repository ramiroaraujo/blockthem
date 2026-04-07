import { useEffect, useState } from 'react';

import type { StorageState } from '../shared/types';
import { getDir, t } from '../shared/i18n';
import { getState, onStateChange, updateState } from '../shared/storage';
import { DEFAULT_STATE } from '../shared/types';
import { BlockList } from './components/BlockList';
import { PasswordGate } from './components/PasswordGate';
import { PasswordPage } from './components/PasswordPage';
import { SchedulePage } from './components/SchedulePage';
import { Sidebar } from './components/Sidebar';

const PAGES = ['blocklist', 'schedule', 'password'] as const;
type Page = (typeof PAGES)[number];

function readHashPage(): Page {
  const hash = window.location.hash.slice(1);
  return (PAGES as readonly string[]).includes(hash)
    ? (hash as Page)
    : 'blocklist';
}

export function App() {
  const [state, setLocalState] = useState<StorageState>(DEFAULT_STATE);
  const [activePage, setActivePage] = useState<Page>(readHashPage);
  const [loaded, setLoaded] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    document.title = t('options_page_title');
    document.documentElement.lang = chrome.i18n.getUILanguage();
    document.documentElement.dir = getDir();
    void getState().then((s) => {
      setLocalState(s);
      setLoaded(true);
      if (!s.passwordHash) setUnlocked(true);
    });
    onStateChange((newState) => {
      setLocalState(newState);
    });
  }, []);

  useEffect(() => {
    history.replaceState(null, '', `#${activePage}`);
  }, [activePage]);

  useEffect(() => {
    const onHashChange = () => setActivePage(readHashPage());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
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
    <div className="flex min-h-screen">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => setActivePage(page as Page)}
        blockingEnabled={state.blockingEnabled}
        onToggleBlocking={() =>
          handleUpdateState({ blockingEnabled: !state.blockingEnabled })
        }
      />
      <main className="flex-1 overflow-y-auto p-8">
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
    </div>
  );
}
