'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface TwoFactorEnforcementProps {
  onDismiss?: () => void;
  showOnlyIfRequired?: boolean;
}

export default function TwoFactorEnforcement({ 
  onDismiss, 
  showOnlyIfRequired = true 
}: TwoFactorEnforcementProps) {
  const auth = getAuth(app);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [enforcement, setEnforcement] = useState<{
    enforcementRequired: boolean;
    isAdminUser: boolean;
    hasTwoFactor: boolean;
    userRole: string;
    gracePeriodDays: number;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (user) {
      checkEnforcement();
    }
  }, [user]);

  const checkEnforcement = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/auth/2fa/enforce', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setEnforcement(result);
      }
    } catch (error) {
      console.error('Failed to check 2FA enforcement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup2FA = () => {
    router.push('/settings/security');
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (loading || isLoading || isDismissed) {
    return null;
  }

  if (!user || !enforcement) {
    return null;
  }

  // Only show if enforcement is required (when showOnlyIfRequired is true)
  if (showOnlyIfRequired && !enforcement.enforcementRequired) {
    return null;
  }

  return (
    <div className={`rounded-lg p-4 mb-4 ${
      enforcement.enforcementRequired 
        ? 'bg-red-50 border border-red-200' 
        : enforcement.isAdminUser && !enforcement.hasTwoFactor
          ? 'bg-yellow-50 border border-yellow-200'
          : 'bg-blue-50 border border-blue-200'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {enforcement.enforcementRequired ? (
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${
            enforcement.enforcementRequired 
              ? 'text-red-800' 
              : 'text-yellow-800'
          }`}>
            {enforcement.enforcementRequired 
              ? 'Two-Factor Authentication Required' 
              : 'Enhanced Security Recommended'
            }
          </h3>
          
          <div className={`mt-2 text-sm ${
            enforcement.enforcementRequired 
              ? 'text-red-700' 
              : 'text-yellow-700'
          }`}>
            <p>{enforcement.message}</p>
            
            {enforcement.enforcementRequired && enforcement.gracePeriodDays > 0 && (
              <p className="mt-1 font-medium">
                You have {enforcement.gracePeriodDays} days to enable 2FA.
              </p>
            )}
            
            <div className="mt-3 space-y-2">
              <div className="text-xs">
                <span className="font-medium">Account Role:</span> {enforcement.userRole}
              </div>
              <div className="text-xs">
                <span className="font-medium">2FA Status:</span> {
                  enforcement.hasTwoFactor ? 'Enabled' : 'Not Enabled'
                }
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleSetup2FA}
              className={`btn btn-sm ${
                enforcement.enforcementRequired 
                  ? 'btn-primary' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {enforcement.hasTwoFactor ? 'Manage 2FA Settings' : 'Enable Two-Factor Authentication'}
            </button>
            
            {!enforcement.enforcementRequired && (
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
        
        {!enforcement.enforcementRequired && (
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}