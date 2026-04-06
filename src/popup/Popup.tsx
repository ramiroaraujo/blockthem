import { useEffect, useState } from 'react';

import { getState, setState } from '../shared/storage';
import { ToggleSwitch } from '../shared/components/ToggleSwitch';
import { verifyPassword } from '../shared/password';
import type { StorageState } from '../shared/types';
import { DEFAULT_STATE } from '../shared/types';

export function Popup() {
  const [state, setLocalState] = useState<StorageState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    getState().then((s) => {
      setLocalState(s);
      setLoaded(true);
    });
  }, []);

  const handleToggle = async () => {
    if (state.passwordHash && state.passwordSalt) {
      setShowPasswordInput(true);
      return;
    }
    await doToggle();
  };

  const doToggle = async () => {
    const newState = { ...state, blockingEnabled: !state.blockingEnabled };
    setLocalState(newState);
    await setState(newState);
    setShowPasswordInput(false);
    setPassword('');
  };

  const handlePasswordSubmit = async () => {
    const valid = await verifyPassword(
      password,
      state.passwordHash!,
      state.passwordSalt!,
    );
    if (valid) {
      await doToggle();
    } else {
      setPasswordError('Wrong password');
      setPassword('');
    }
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  if (!loaded) return null;

  return (
    <div className="box-border w-[280px] bg-bg p-5 font-sans text-text">
      <div className="mb-4 flex items-center gap-2 text-base font-bold text-primary">
        🛡️ BlockThem
      </div>

      <div className="mb-3 flex items-center justify-between rounded-lg bg-surface px-4 py-3">
        <div>
          <div className="text-[13px]">
            Blocking is {state.blockingEnabled ? 'ON' : 'OFF'}
          </div>
          <div className="mt-0.5 text-[11px] text-text-muted">
            {state.rules.length} rule{state.rules.length !== 1 ? 's' : ''}{' '}
            configured
          </div>
        </div>
        <ToggleSwitch
          enabled={state.blockingEnabled}
          onClick={handleToggle}
        />
      </div>

      {showPasswordInput && (
        <div className="mb-3">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            placeholder="Enter password to toggle"
            autoFocus
            className={`mb-2 box-border w-full rounded-md border bg-surface px-2.5 py-2 font-inherit text-xs text-text ${
              passwordError ? 'border-error' : 'border-border'
            }`}
          />
          {passwordError && (
            <div className="text-[11px] text-error">{passwordError}</div>
          )}
        </div>
      )}

      <button
        onClick={openOptions}
        className="box-border w-full rounded-md border border-border bg-transparent px-4 py-2 font-inherit text-xs text-text-secondary"
      >
        Open Settings
      </button>
    </div>
  );
}
