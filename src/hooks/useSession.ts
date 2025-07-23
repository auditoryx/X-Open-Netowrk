import { useState, useEffect } from 'react';
import { sessionManager } from '@/lib/auth/sessionManager';

interface SessionStatus {
  isValid: boolean;
  expiresAt: Date | null;
  timeUntilExpiry: number | null;
  timeUntilWarning: number | null;
}

export function useSession() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isValid: false,
    expiresAt: null,
    timeUntilExpiry: null,
    timeUntilWarning: null
  });

  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const updateSessionStatus = () => {
      const status = sessionManager.getSessionStatus();
      const WARNING_TIME = 15 * 60 * 1000; // 15 minutes
      
      const timeUntilWarning = status.timeUntilExpiry && status.timeUntilExpiry > WARNING_TIME 
        ? status.timeUntilExpiry - WARNING_TIME 
        : null;

      setSessionStatus({
        ...status,
        timeUntilWarning
      });

      // Show warning if session expires in less than 15 minutes
      if (status.timeUntilExpiry && status.timeUntilExpiry <= WARNING_TIME && status.timeUntilExpiry > 0) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    // Update immediately
    updateSessionStatus();

    // Update every minute
    const interval = setInterval(updateSessionStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const extendSession = async () => {
    try {
      await sessionManager.extendSession();
      setShowWarning(false);
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  };

  const clearAllSessions = async (userId: string) => {
    try {
      await sessionManager.clearAllSessions(userId);
    } catch (error) {
      console.error('Failed to clear all sessions:', error);
      throw error;
    }
  };

  return {
    sessionStatus,
    showWarning,
    extendSession,
    clearAllSessions
  };
}