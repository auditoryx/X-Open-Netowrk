'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const twoFAVerifySchema = z.object({
  code: z.string().min(6, 'Code must be at least 6 characters').max(8, 'Code must be at most 8 characters')
});

type TwoFAVerifyForm = z.infer<typeof twoFAVerifySchema>;

interface TwoFactorVerifyProps {
  onVerified: () => void;
  onCancel: () => void;
  userToken: string;
}

export default function TwoFactorVerify({ onVerified, onCancel, userToken }: TwoFactorVerifyProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm<TwoFAVerifyForm>({
    resolver: zodResolver(twoFAVerifySchema)
  });

  const onSubmit = async (data: TwoFAVerifyForm) => {
    setIsVerifying(true);
    clearErrors();

    try {
      const response = await fetch('/api/auth/2fa/verify-login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: data.code })
      });

      const result = await response.json();

      if (response.ok) {
        onVerified();
      } else {
        setError('code', { message: result.error || 'Invalid code. Please try again.' });
      }
    } catch (error) {
      setError('code', { message: 'Network error. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-gray-200">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Two-Factor Authentication
        </h2>
        <p className="text-gray-600">
          {useBackupCode 
            ? 'Enter one of your backup codes to sign in'
            : 'Enter the verification code from your authenticator app'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            {useBackupCode ? 'Backup Code' : 'Verification Code'}
          </label>
          <input
            {...register('code')}
            type="text"
            id="code"
            className={`input w-full text-center text-lg tracking-wider ${errors.code ? 'border-red-500' : ''}`}
            placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
            maxLength={useBackupCode ? 8 : 6}
            disabled={isVerifying}
            autoComplete="off"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className={`btn btn-primary w-full ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => {
            setUseBackupCode(!useBackupCode);
            clearErrors();
          }}
          className="w-full text-sm text-blue-600 hover:text-blue-500"
        >
          {useBackupCode ? 'Use authenticator app instead' : 'Use a backup code instead'}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="w-full text-sm text-gray-600 hover:text-gray-500"
        >
          ← Back to login
        </button>
      </div>

      <div className="mt-6 bg-gray-50 p-3 rounded text-xs text-gray-600">
        <p className="font-medium mb-1">Having trouble?</p>
        <ul className="space-y-1">
          <li>• Make sure your device's time is correct</li>
          <li>• Try refreshing your authenticator app</li>
          <li>• Use a backup code if you can't access your authenticator</li>
        </ul>
      </div>
    </div>
  );
}