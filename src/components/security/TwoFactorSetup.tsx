'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import BackupCodeManager from './BackupCodeManager';
import DisableTwoFactor from './DisableTwoFactor';

export default function TwoFactorSetup() {
  const auth = getAuth(app);
  const [user, loading] = useAuthState(auth);
  const [setupStep, setSetupStep] = useState<'status' | 'setup' | 'verify' | 'complete'>('status');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFAStatus, setTwoFAStatus] = useState({
    enabled: false,
    setupInProgress: false,
    backupCodesRemaining: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBackupCodeManagement, setShowBackupCodeManagement] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTwoFAStatus();
    }
  }, [user]);

  const fetchTwoFAStatus = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/auth/2fa/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const status = await response.json();
        setTwoFAStatus({
          enabled: status.twoFactorEnabled,
          setupInProgress: status.setupInProgress,
          backupCodesRemaining: status.backupCodesRemaining
        });
      }
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error);
    }
  };

  const startSetup = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setQrCode(result.qrCode);
        setSecret(result.secret);
        setSetupStep('verify');
      } else {
        setError(result.error || 'Failed to setup 2FA');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!user || !verificationCode) return;

    setIsLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationCode })
      });

      const result = await response.json();

      if (response.ok) {
        setBackupCodes(result.backupCodes);
        setSetupStep('complete');
        setTwoFAStatus({ ...twoFAStatus, enabled: true });
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFA = async (token: string) => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const authToken = await user.getIdToken();
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token: token,
          password: 'dummy' // TODO: Implement password verification
        })
      });

      const result = await response.json();

      if (response.ok) {
        setTwoFAStatus({ ...twoFAStatus, enabled: false });
        setSetupStep('status');
      } else {
        setError(result.error || 'Failed to disable 2FA');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <p>Please log in to manage two-factor authentication.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {setupStep === 'status' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
          
          {twoFAStatus.enabled ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">2FA is enabled</span>
              </div>
              
              <p className="text-gray-600 text-sm">
                Your account is protected with two-factor authentication.
              </p>
              
              <div className="text-sm text-gray-600">
                <p>Backup codes remaining: <span className="font-medium">{twoFAStatus.backupCodesRemaining}</span></p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setShowBackupCodeManagement(true)}
                  className="w-full btn btn-secondary"
                >
                  Manage Backup Codes
                </button>
                
                <button
                  onClick={() => setSetupStep('setup')}
                  className="w-full text-sm text-gray-600 hover:text-gray-500"
                >
                  View Advanced Settings
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-700 font-medium">2FA is not enabled</span>
              </div>
              
              <p className="text-gray-600 text-sm">
                Secure your account with two-factor authentication for extra protection.
              </p>

              <button
                onClick={startSetup}
                disabled={isLoading}
                className={`w-full btn btn-primary ${isLoading ? 'opacity-50' : ''}`}
              >
                {isLoading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
              </button>
            </div>
          )}
        </div>
      )}

      {setupStep === 'verify' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Setup Two-Factor Authentication</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Scan this QR code with your authenticator app:
              </p>
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600 mb-1">
                Can't scan? Enter this code manually:
              </p>
              <code className="text-sm font-mono break-all">{secret}</code>
            </div>

            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                Enter verification code from your app:
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="input w-full"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={verifySetup}
                disabled={isLoading || verificationCode.length !== 6}
                className={`w-full btn btn-primary ${(isLoading || verificationCode.length !== 6) ? 'opacity-50' : ''}`}
              >
                {isLoading ? 'Verifying...' : 'Verify & Enable'}
              </button>
              
              <button
                onClick={() => setSetupStep('status')}
                className="w-full btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {setupStep === 'complete' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication Enabled!</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Setup completed successfully</span>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Important: Save your backup codes</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Store these backup codes in a safe place. You can use them to access your account if you lose your phone.
              </p>
              <div className="bg-white border rounded p-3 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="py-1">{code}</div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSetupStep('status')}
              className="w-full btn btn-primary"
            >
              Complete Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}