import { useState } from 'react'
import type { StorageState } from '../../shared/types'
import { hashPassword, verifyPassword, generateSalt } from '../../shared/password'

interface PasswordPageProps {
  state: StorageState
  onUpdateState: (updates: Partial<StorageState>) => void
}

type DialogMode = 'set' | 'change' | 'disable' | null

function PasswordDialog({
  mode,
  passwordHash,
  passwordSalt,
  onConfirm,
  onClose,
}: {
  mode: 'set' | 'change' | 'disable'
  passwordHash: string | null
  passwordSalt: string | null
  onConfirm: (hash: string | null, salt: string | null) => void
  onClose: () => void
}) {
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')

    if (mode === 'disable') {
      if (!currentPwd) { setError('Enter your current password'); return }
      const valid = await verifyPassword(currentPwd, passwordHash!, passwordSalt!)
      if (!valid) { setError('Incorrect password'); return }
      onConfirm(null, null)
      return
    }

    if (mode === 'change') {
      if (!currentPwd) { setError('Enter your current password'); return }
      const valid = await verifyPassword(currentPwd, passwordHash!, passwordSalt!)
      if (!valid) { setError('Incorrect password'); return }
    }

    if (!newPwd) { setError('Enter a new password'); return }
    if (newPwd !== confirmPwd) { setError('Passwords do not match'); return }

    const salt = generateSalt()
    const hash = await hashPassword(newPwd, salt)
    onConfirm(hash, salt)
  }

  const title = mode === 'set' ? 'Set Password' : mode === 'change' ? 'Change Password' : 'Disable Password Protection'

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    padding: '10px 12px',
    color: 'var(--color-text)',
    fontSize: 13,
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-sidebar)',
          borderRadius: 12,
          padding: 24,
          width: 400,
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 20 }}>{title}</h2>

        {(mode === 'change' || mode === 'disable') && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Current password</div>
            <input
              type="password"
              value={currentPwd}
              onChange={(e) => { setCurrentPwd(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && (mode === 'disable' ? handleSubmit() : undefined)}
              autoFocus
              style={inputStyle}
            />
          </div>
        )}

        {(mode === 'set' || mode === 'change') && (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>New password</div>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => { setNewPwd(e.target.value); setError('') }}
                autoFocus={mode === 'set'}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Confirm password</div>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => { setConfirmPwd(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                style={inputStyle}
              />
            </div>
          </>
        )}

        {error && (
          <div style={{ color: '#e74c3c', fontSize: 12, marginBottom: 12 }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              background: mode === 'disable' ? '#e74c3c' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            {mode === 'disable' ? 'Disable' : mode === 'change' ? 'Update Password' : 'Set Password'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PasswordPage({ state, onUpdateState }: PasswordPageProps) {
  const isEnabled = state.passwordHash !== null
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [message, setMessage] = useState('')

  const handleToggle = () => {
    setMessage('')
    if (isEnabled) {
      setDialogMode('disable')
    } else {
      setDialogMode('set')
    }
  }

  const handleDialogConfirm = (hash: string | null, salt: string | null) => {
    onUpdateState({ passwordHash: hash, passwordSalt: salt })
    if (hash === null) {
      setMessage('Password protection disabled')
    } else if (dialogMode === 'set') {
      setMessage('Password protection enabled')
    } else {
      setMessage('Password updated successfully')
    }
    setDialogMode(null)
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Password Protection</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 24 }}>
        Protect all settings with a password
      </p>

      {/* Enable toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: 'var(--color-surface)',
        borderRadius: 8,
        marginBottom: 24,
      }}>
        <div>
          <div style={{ fontSize: 13 }}>Enable password protection</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Requires password to access settings and toggle blocking
          </div>
        </div>
        <div
          onClick={handleToggle}
          style={{
            width: 40,
            height: 22,
            borderRadius: 11,
            background: isEnabled ? 'var(--color-primary)' : 'var(--color-border)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: isEnabled ? 'white' : '#666',
            position: 'absolute',
            top: 2,
            left: isEnabled ? 20 : 2,
            transition: 'left 0.2s',
          }} />
        </div>
      </div>

      {/* Change password button (when enabled) */}
      {isEnabled && (
        <button
          onClick={() => { setMessage(''); setDialogMode('change') }}
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            padding: '10px 16px',
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          Change Password
        </button>
      )}

      {!isEnabled && !message && (
        <div style={{
          padding: 24,
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 14,
        }}>
          No password set. Enable the toggle above to protect your settings.
        </div>
      )}

      {message && (
        <div style={{ color: '#2ecc71', fontSize: 12, marginTop: 12 }}>{message}</div>
      )}

      <p style={{
        fontSize: 11,
        color: 'var(--color-text-muted)',
        marginTop: 24,
      }}>
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
  )
}
