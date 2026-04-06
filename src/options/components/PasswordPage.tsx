import { useState } from 'react';

import type { StorageState } from '../../shared/types';
import { ToggleSwitch } from '../../shared/components/ToggleSwitch';
import { t } from '../../shared/i18n';
import {
  generateSalt,
  hashPassword,
  verifyPassword,
} from '../../shared/password';

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

    if (mode === 'disable' || mode === 'change') {
      if (!currentPwd) {
        setError(t('password_err_enter_current'));
        return;
      }
      if (!passwordHash || !passwordSalt) {
        setError(t('password_err_not_set'));
        return;
      }
      const valid = await verifyPassword(
        currentPwd,
        passwordHash,
        passwordSalt,
      );
      if (!valid) {
        setError(t('password_err_incorrect'));
        return;
      }
      if (mode === 'disable') {
        onConfirm(null, null);
        return;
      }
    }

    if (!newPwd) {
      setError(t('password_err_enter_new'));
      return;
    }
    if (newPwd !== confirmPwd) {
      setError(t('password_err_mismatch'));
      return;
    }

    const salt = generateSalt();
    const hash = await hashPassword(newPwd, salt);
    onConfirm(hash, salt);
  };

  const title =
    mode === 'set'
      ? t('password_dialog_title_set')
      : mode === 'change'
        ? t('password_dialog_title_change')
        : t('password_dialog_title_disable');

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
              {t('password_field_current')}
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
                {t('password_field_new')}
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
                {t('password_field_confirm')}
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
            {t('password_btn_cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className={`rounded-md border-none px-4 py-2 text-[13px] text-white ${
              mode === 'disable' ? 'bg-error' : 'bg-primary'
            }`}
          >
            {mode === 'disable'
              ? t('password_btn_disable')
              : mode === 'change'
                ? t('password_btn_update')
                : t('password_btn_set')}
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
      setMessage(t('password_msg_disabled'));
    } else if (dialogMode === 'set') {
      setMessage(t('password_msg_enabled'));
    } else {
      setMessage(t('password_msg_updated'));
    }
    setDialogMode(null);
  };

  return (
    <div className="max-w-[500px]">
      <h1 className="mb-1 text-2xl">{t('password_title')}</h1>
      <p className="mb-6 text-sm text-text-muted">{t('password_subtitle')}</p>

      {/* Enable toggle */}
      <div className="mb-6 flex items-center justify-between rounded-lg bg-surface px-4 py-3">
        <div>
          <div className="text-[13px]">{t('password_enable')}</div>
          <div className="mt-0.5 text-[11px] text-text-muted">
            {t('password_enable_helper')}
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
          {t('password_change_button')}
        </button>
      )}

      {!isEnabled && !message && (
        <div className="p-6 text-center text-sm text-text-muted">
          {t('password_empty')}
        </div>
      )}

      {message && <div className="mt-3 text-xs text-success">{message}</div>}

      <p className="mt-6 text-[11px] text-text-muted">
        {t('password_forgot_help')}
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
