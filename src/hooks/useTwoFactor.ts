import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

export interface TwoFactorStatus {
  enabled: boolean;
  setupInProgress: boolean;
  enabledAt: string | null;
  backupCodesRemaining: number;
  hasBackupCodes: boolean;
}

export interface UseTwoFactorResult {
  status: TwoFactorStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
}

export function useTwoFactor(): UseTwoFactorResult {
  const auth = getAuth(app);
  const [user, loading, authError] = useAuthState(auth);
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    if (!user) {
      setStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const token = await user.getIdToken();
      const response = await fetch('/api/auth/2fa/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({
          enabled: data.twoFactorEnabled,
          setupInProgress: data.setupInProgress,
          enabledAt: data.enabledAt,
          backupCodesRemaining: data.backupCodesRemaining,
          hasBackupCodes: data.hasBackupCodes
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch 2FA status');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    fetchStatus();
  }, [user, loading]);

  const refreshStatus = async () => {
    setIsLoading(true);
    await fetchStatus();
  };

  return {
    status,
    isLoading: loading || isLoading,
    error: authError?.message || error,
    refreshStatus
  };
}

// Hook specifically for checking if 2FA is required for an action
export function useRequiresTwoFactor(action: string = 'sensitive_action') {
  const { status, isLoading } = useTwoFactor();
  
  return {
    requiresTwoFactor: status?.enabled || false,
    canProceed: !status?.enabled || status.enabled, // Can proceed if 2FA is disabled or enabled
    isLoading
  };
}