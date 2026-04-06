import { useState } from 'react'
import { verifyPassword } from '../../shared/password'

interface PasswordGateProps {
  passwordHash: string
  passwordSalt: string
  onUnlock: () => void
}

export function PasswordGate({ passwordHash, passwordSalt, onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleUnlock = async () => {
    const valid = await verifyPassword(password, passwordHash, passwordSalt)
    if (valid) {
      onUnlock()
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUnlock()
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--color-bg)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 320, padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>BlockThem Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24 }}>
          Enter your password to access settings
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError('') }}
          onKeyDown={handleKeyDown}
          placeholder="Password"
          autoFocus
          style={{
            width: '100%',
            background: 'var(--color-surface)',
            border: `1px solid ${error ? '#e74c3c' : 'var(--color-border)'}`,
            borderRadius: 6,
            padding: '10px 12px',
            color: 'var(--color-text)',
            fontSize: 13,
            marginBottom: error ? 8 : 16,
          }}
        />

        {error && (
          <div style={{ color: '#e74c3c', fontSize: 12, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleUnlock}
          style={{
            width: '100%',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          Unlock
        </button>

        <p style={{ fontSize: 11, color: '#444', marginTop: 16 }}>
          Forgot password? Reset by reinstalling the extension.
        </p>
      </div>
    </div>
  )
}
