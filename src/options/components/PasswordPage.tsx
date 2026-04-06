import { useState } from 'react';

import type { StorageState } from '../../shared/types';
import { ToggleSwitch } from '../../shared/components/ToggleSwitch';
import { hashPassword, verifyPassword, generateSalt } from '../../shared/password';

interface PasswordPageProps {
  state: StorageState;
  onUpdateState: (updates: Partial<StorageState>) => void;
}

type DialogMode = 'set' | 'change' | 'disable' | null;

function PasswordDialog({
  mode,
  passwordHash,
  passwordSalt,
  onConfirm,
  onClose,
}: {
  mode: 'set' | 'change' | 'disable';
  passwordHash: string | null;
  passwordSalt: string | null;
  onConfirm: (hash: string | null, salt: string | null) => void;
  onClose: () => void;
}) {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (mode === 'disable') {
      if (!currentPwd) {
        setError('Enter your current password');
        return;
      }
      const valid = await verifyPassword(
        currentPwd,
        passwordHash!,
        passwordSalt!,
      );
      if (!valid) {
        setError('Incorrect password');
        return;
      }
      onConfirm(null, null);
      return;
    }

    if (mode === 'change') {
      if (!currentPwd) {
        setError('Enter your current password');
        return;
      }
      const valid = await verifyPassword(
        currentPwd,
        passwordHash!,
        passwordSalt!,
      );
      if (!valid) {
        setError('Incorrect password');
        return;
      }
    }

    if (!newPwd) {
      setError('Enter a new password');
      return;
    }
    if (newPwd !== confirmPwd) {
      setError('Passwords do not match');
      return;
    }

    const salt = generateSalt();
    const hash = await hashPassword(newPwd, salt);
    onConfirm(hash, salt);
  };

  const title =
    mode === 'set'
      ? 'Set Password'
      : mode === 'change'
        ? 'Change Password'
        : 'Disable Password Protection';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[400px] rounded-xl bg-sidebar p-6"
      >
        <h2 className="mb-5 text-base">{title}</h2>

        {(mode === 'change' || mode === 'disable') && (
          <div className="mb-3">
            <div className="mb-1 text-[11px] text-text-secondary">
              Current password
            </div>
            <input
              type="password"
              value={currentPwd}
              onChange={(e) => {
                setCurrentPwd(e.target.value);
                setError('');
              }}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                (mode === 'disable' ? handleSubmit() : undefined)
              }
              autoFocus
              className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-[13px] text-text"
            />
          </div>
        )}

        {(mode === 'set' || mode === 'change') && (
          <>
            <div className="mb-3">
              <div className="mb-1 text-[11px] text-text-secondary">
                New password
              </div>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => {
                  setNewPwd(e.target.value);
                  setError('');
                }}
                autoFocus={mode === 'set'}
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-[13px] text-text"
              />
            </div>
            <div className="mb-3">
              <div className="mb-1 text-[11px] text-text-secondary">
                Confirm password
              </div>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => {
                  setConfirmPwd(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-[13px] text-text"
              />
            </div>
          </>
        )}

        {error && <div className="mb-3 text-xs text-error">{error}</div>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] text-text-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`rounded-md border-none px-4 py-2 text-[13px] text-white ${
              mode === 'disable' ? 'bg-error' : 'bg-primary'
            }`}
          >
            {mode === 'disable'
              ? 'Disable'
              : mode === 'change'
                ? 'Update Password'
                : 'Set Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PasswordPage({ state, onUpdateState }: PasswordPageProps) {
  const isEnabled = state.passwordHash !== null;
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [message, setMessage] = useState('');

  const handleToggle = () => {
    setMessage('');
    if (isEnabled) {
      setDialogMode('disable');
    } else {
      setDialogMode('set');
    }
  };

  const handleDialogConfirm = (hash: string | null, salt: string | null) => {
    onUpdateState({ passwordHash: hash, passwordSalt: salt });
    if (hash === null) {
      setMessage('Password protection disabled');
    } else if (dialogMode === 'set') {
      setMessage('Password protection enabled');
    } else {
      setMessage('Password updated successfully');
    }
    setDialogMode(null);
  };

  return (
    <div className="max-w-[500px]">
      <h1 className="mb-1 text-2xl">Password Protection</h1>
      <p className="mb-6 text-sm text-text-muted">
        Protect all settings with a password
      </p>

      {/* Enable toggle */}
      <div className="mb-6 flex items-center justify-between rounded-lg bg-surface px-4 py-3">
        <div>
          <div className="text-[13px]">Enable password protection</div>
          <div className="mt-0.5 text-[11px] text-text-muted">
            Requires password to access settings and toggle blocking
          </div>
        </div>
        <ToggleSwitch enabled={isEnabled} onClick={handleToggle} />
      </div>

      {/* Change password button (when enabled) */}
      {isEnabled && (
        <button
          onClick={() => {
            setMessage('');
            setDialogMode('change');
          }}
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-[13px] text-text-secondary"
        >
          Change Password
        </button>
      )}

      {!isEnabled && !message && (
        <div className="p-6 text-center text-sm text-text-muted">
          No password set. Enable the toggle above to protect your settings.
        </div>
      )}

      {message && (
        <div className="mt-3 text-xs text-success">{message}</div>
      )}

      <p className="mt-6 text-[11px] text-text-muted">
        Forgot password? Reset by reinstalling the extension.
      </p>

      {dialogMode && (
        <PasswordDialog
          mode={dialogMode}
          passwordHash={state.passwordHash}
          passwordSalt={state.passwordSalt}
          onConfirm={handleDialogConfirm}
          onClose={() => setDialogMode(null)}
        />
      )}
    </div>
  );
}
