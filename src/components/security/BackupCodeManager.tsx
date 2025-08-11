'use client';

import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import BackupCodeManager from './BackupCodeManager';
import DisableTwoFactor from './DisableTwoFactor';

interface BackupCodeManagerProps {
  onClose: () => void;
  onUpdate?: (newCount: number) => void;
}

export default function BackupCodeManager({ onClose, onUpdate }: BackupCodeManagerProps) {
  const auth = getAuth(app);
  const [user] = useAuthState(auth);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState<{
    backupCodesCount: number;
    hasBackupCodes: boolean;
    totalGenerated: number;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);

  React.useEffect(() => {
    fetchBackupStatus();
  }, [user]);

  const fetchBackupStatus = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/auth/2fa/backup-codes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const status = await response.json();
        setCurrentStatus(status);
      }
    } catch (error) {
      console.error('Failed to fetch backup codes status:', error);
    }
  };

  const regenerateBackupCodes = async () => {
    if (!user || !verificationCode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/auth/2fa/backup-codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationCode.trim() })
      });

      const result = await response.json();

      if (response.ok) {
        setBackupCodes(result.backupCodes);
        setCurrentStatus({
          backupCodesCount: result.count,
          hasBackupCodes: true,
          totalGenerated: result.count
        });
        setShowRegenerateForm(false);
        setVerificationCode('');
        
        if (onUpdate) {
          onUpdate(result.count);
        }
      } else {
        if (response.status === 429) {
          setError(`Too many failed attempts. Please try again in ${result.resetTime} minutes.`);
        } else {
          setError(result.error || 'Failed to regenerate backup codes');
        }
      }
    } catch (error) {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    if (!backupCodes.length) return;

    const text = `X-Open-Network Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nBackup Codes:\n${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\nImportant:\n- Keep these codes in a safe place\n- Each code can only be used once\n- Use them to access your account if you lose your phone\n- Generate new codes if you suspect they are compromised`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'x-open-network-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!backupCodes.length) return;

    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Backup Code Management</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {backupCodes.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h3 className="font-medium text-green-800 mb-2">New Backup Codes Generated!</h3>
                <p className="text-sm text-green-700 mb-3">
                  Please save these codes immediately. Your previous backup codes are no longer valid.
                </p>
                
                <div className="bg-white border rounded p-3 font-mono text-sm max-h-40 overflow-y-auto">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="py-1 border-b last:border-b-0">
                      {index + 1}. {code}
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={downloadBackupCodes}
                    className="btn btn-sm btn-primary"
                  >
                    Download as Text File
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="btn btn-sm btn-secondary"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
          ) : currentStatus ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium mb-2">Current Status</h3>
                <div className="text-sm space-y-1">
                  <p>Backup codes remaining: <span className="font-medium">{currentStatus.backupCodesCount}</span></p>
                  <p>Total generated: <span className="font-medium">{currentStatus.totalGenerated}</span></p>
                  <p>Status: <span className={`font-medium ${currentStatus.hasBackupCodes ? 'text-green-600' : 'text-red-600'}`}>
                    {currentStatus.hasBackupCodes ? 'Active' : 'No backup codes'}
                  </span></p>
                </div>
              </div>

              {!showRegenerateForm ? (
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <h3 className="font-medium text-yellow-800 mb-2">Regenerate Backup Codes</h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      This will create 10 new backup codes and invalidate all existing codes.
                    </p>
                    <button
                      onClick={() => setShowRegenerateForm(true)}
                      className="btn btn-sm bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Regenerate Codes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <h3 className="font-medium text-yellow-800 mb-2">Confirm Regeneration</h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Enter your current 2FA code or a backup code to confirm:
                    </p>
                    
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
                          onClick={regenerateBackupCodes}
                          disabled={isLoading || !verificationCode.trim()}
                          className={`btn btn-sm btn-primary ${(isLoading || !verificationCode.trim()) ? 'opacity-50' : ''}`}
                        >
                          {isLoading ? 'Generating...' : 'Confirm Regeneration'}
                        </button>
                        <button
                          onClick={() => {
                            setShowRegenerateForm(false);
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
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-8 h-8 mx-auto mb-2 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading backup code status...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}