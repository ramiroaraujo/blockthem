import { useEffect, useState } from 'react';

import type { StorageState } from '../shared/types';
import { verifyPassword } from '../shared/password';
import { getState, onStateChange, updateState } from '../shared/storage';
import { DEFAULT_STATE } from '../shared/types';

export function Popup() {
  const [state, setLocalState] = useState<StorageState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    void getState().then((s) => {
      setLocalState(s);
      setLoaded(true);
    });
    onStateChange((newState) => {
      setLocalState(newState);
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
    const newState = await updateState({
      blockingEnabled: !state.blockingEnabled,
    });
    setLocalState(newState);
    setShowPasswordInput(false);
    setPassword('');
  };

  const handlePasswordSubmit = async () => {
    if (!state.passwordHash || !state.passwordSalt) return;
    const valid = await verifyPassword(
      password,
      state.passwordHash,
      state.passwordSalt,
    );
    if (valid) {
      await doToggle();
    } else {
      setPasswordError('Wrong password');
      setPassword('');
    }
  };

  const openOptions = () => {
    void chrome.runtime.openOptionsPage();
  };

  if (!loaded) return null;

  return (
    <div
      style={{
        width: 280,
        padding: 20,
        boxSizing: 'border-box',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: '#0d1117',
        color: '#e6e6e6',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#6c5ce7',
        }}
      >
        🛡️ BlockThem
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: '#161b22',
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13 }}>
            Blocking is {state.blockingEnabled ? 'ON' : 'OFF'}
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
            {state.rules.length} rule{state.rules.length !== 1 ? 's' : ''}{' '}
            configured
          </div>
        </div>
        <div
          onClick={handleToggle}
          style={{
            width: 40,
            height: 22,
            borderRadius: 11,
            background: state.blockingEnabled ? '#6c5ce7' : '#333',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: state.blockingEnabled ? 'white' : '#666',
              position: 'absolute',
              top: 2,
              left: state.blockingEnabled ? 20 : 2,
              transition: 'left 0.2s',
            }}
          />
        </div>
      </div>

      {showPasswordInput && (
        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && void handlePasswordSubmit()}
            placeholder="Enter password to toggle"
            autoFocus
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#161b22',
              border: `1px solid ${passwordError ? '#e74c3c' : '#333'}`,
              borderRadius: 6,
              padding: '8px 10px',
              color: '#e6e6e6',
              fontSize: 12,
              marginBottom: 8,
              fontFamily: 'inherit',
            }}
          />
          {passwordError && (
            <div style={{ color: '#e74c3c', fontSize: 11 }}>
              {passwordError}
            </div>
          )}
        </div>
      )}

      <button
        onClick={openOptions}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: 'transparent',
          color: '#888',
          border: '1px solid #333',
          padding: '8px 16px',
          borderRadius: 6,
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Open Settings
      </button>
    </div>
  );
}
