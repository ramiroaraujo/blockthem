import { useState } from 'react'
import type { StorageState } from '../../shared/types'
import { hashPassword, verifyPassword, generateSalt } from '../../shared/password'

interface PasswordPageProps {
  state: StorageState
  onUpdateState: (updates: Partial<StorageState>) => void
}

export function PasswordPage({ state, onUpdateState }: PasswordPageProps) {
  const isEnabled = state.passwordHash !== null
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const toggleEnabled = async () => {
    if (isEnabled) {
      // Disable — require current password
      if (!currentPwd) {
        setError('Enter your current password to disable')
        return
      }
      const valid = await verifyPassword(currentPwd, state.passwordHash!, state.passwordSalt!)
      if (!valid) {
        setError('Incorrect password')
        return
      }
      onUpdateState({ passwordHash: null, passwordSalt: null })
      setCurrentPwd('')
      setMessage('Password protection disabled')
      setError('')
    } else {
      // Enable — require new password
      if (!newPwd) {
        setError('Enter a new password')
        return
      }
      if (newPwd !== confirmPwd) {
        setError('Passwords do not match')
        return
      }
      const salt = generateSalt()
      const hash = await hashPassword(newPwd, salt)
      onUpdateState({ passwordHash: hash, passwordSalt: salt })
      setNewPwd('')
      setConfirmPwd('')
      setMessage('Password protection enabled')
      setError('')
    }
  }

  const handleChangePassword = async () => {
    setMessage('')
    setError('')

    if (!currentPwd) {
      setError('Enter your current password')
      return
    }
    const valid = await verifyPassword(currentPwd, state.passwordHash!, state.passwordSalt!)
    if (!valid) {
      setError('Incorrect current password')
      return
    }
    if (!newPwd) {
      setError('Enter a new password')
      return
    }
    if (newPwd !== confirmPwd) {
      setError('Passwords do not match')
      return
    }

    const salt = generateSalt()
    const hash = await hashPassword(newPwd, salt)
    onUpdateState({ passwordHash: hash, passwordSalt: salt })
    setCurrentPwd('')
    setNewPwd('')
    setConfirmPwd('')
    setMessage('Password updated successfully')
  }

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
          onClick={toggleEnabled}
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

      {/* Set new password (when not enabled) */}
      {!isEnabled && (
        <div style={{ background: 'var(--color-surface)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 13, marginBottom: 12 }}>Set a password</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>New password</div>
            <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Confirm password</div>
            <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} style={inputStyle} />
          </div>
        </div>
      )}

      {/* Change password (when enabled) */}
      {isEnabled && (
        <div style={{ background: 'var(--color-surface)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 13, marginBottom: 12 }}>Change password</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Current password</div>
            <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>New password</div>
            <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Confirm new password</div>
            <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} style={inputStyle} />
          </div>
          <button
            onClick={handleChangePassword}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            Update Password
          </button>
        </div>
      )}

      {error && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 12 }}>{error}</div>}
      {message && <div style={{ color: '#2ecc71', fontSize: 12, marginTop: 12 }}>{message}</div>}
    </div>
  )
}
