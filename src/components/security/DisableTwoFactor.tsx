'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

interface DisableTwoFactorProps {
  onDisabled: () => void;
}

export default function DisableTwoFactor({ onDisabled }: DisableTwoFactorProps) {
  const auth = getAuth(app);
  const [user] = useAuthState(auth);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDisable = async () => {
    if (!user || !verificationCode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token: verificationCode.trim(),
          password: 'dummy' // TODO: Implement password verification
        })
      });

      const result = await response.json();

      if (response.ok) {
        onDisabled();
      } else {
        setError(result.error || 'Failed to disable 2FA');
      }
    } catch (error) {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="btn btn-sm bg-red-600 hover:bg-red-700 text-white"
      >
        Disable 2FA
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-red-100 border border-red-300 rounded p-3">
        <h4 className="font-medium text-red-800 mb-2">Confirm Disable Two-Factor Authentication</h4>
        <p className="text-sm text-red-700 mb-3">
          This action will remove 2FA from your account and make it less secure. 
          Enter your current 2FA code or backup code to confirm.
        </p>
        
        {error && (
          <div className="mb-3 p-2 bg-red-200 border border-red-400 rounded text-red-800 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code or backup code"
            className="input w-full"
            maxLength={8}
          />
          
          <div className="flex space-x-2">
            <button
              onClick={handleDisable}
              disabled={isLoading || !verificationCode.trim()}
              className={`btn btn-sm bg-red-600 hover:bg-red-700 text-white ${(isLoading || !verificationCode.trim()) ? 'opacity-50' : ''}`}
            >
              {isLoading ? 'Disabling...' : 'Confirm Disable'}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setVerificationCode('');
                setError('');
              }}
              className="btn btn-sm btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}