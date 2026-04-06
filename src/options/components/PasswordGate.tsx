import { useState } from 'react';

import { verifyPassword } from '../../shared/password';

interface PasswordGateProps {
  passwordHash: string;
  passwordSalt: string;
  onUnlock: () => void;
}

export function PasswordGate({
  passwordHash,
  passwordSalt,
  onUnlock,
}: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    const valid = await verifyPassword(password, passwordHash, passwordSalt);
    if (valid) {
      onUnlock();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void handleUnlock();
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg">
      <div className="max-w-xs p-10 text-center">
        <div className="mb-4 text-5xl">🔒</div>
        <h1 className="mb-2 text-xl">BlockThem Settings</h1>
        <p className="mb-6 text-[13px] text-text-muted">
          Enter your password to access settings
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Password"
          autoFocus
          className={`w-full rounded-md border bg-surface px-3 py-2.5 text-[13px] text-text ${
            error ? 'mb-2 border-error' : 'mb-4 border-border'
          }`}
        />

        {error && (
          <div className="mb-3 text-xs text-error">{error}</div>
        )}

        <button
          onClick={handleUnlock}
          className="w-full rounded-md border-none bg-primary px-5 py-2.5 text-[13px] text-white"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
