/**
 * Verification Provider
 * Context provider for global verification state and notifications
 */

'use client';

import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useVerificationData, useVerificationNotifications } from '@/lib/hooks/useVerificationData';
import { useAuth } from '@/lib/hooks/useAuth';

interface VerificationContextType {
  // Data
  data: ReturnType<typeof useVerificationData>['data'];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  submitApplication: () => Promise<any>;
  refreshData: () => void;
  
  // Computed states
  canApply: boolean;
  isAwaitingReview: boolean;
  needsImprovement: boolean;
  progressPercentage: number;
  
  // Notifications
  notifications: ReturnType<typeof useVerificationNotifications>['notifications'];
  unreadNotificationCount: number;
  addNotification: ReturnType<typeof useVerificationNotifications>['addNotification'];
  markNotificationAsRead: ReturnType<typeof useVerificationNotifications>['markAsRead'];
  removeNotification: ReturnType<typeof useVerificationNotifications>['removeNotification'];
  clearAllNotifications: ReturnType<typeof useVerificationNotifications>['clearAll'];
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const {
    data,
    isLoading,
    error,
    submitApplication,
    refreshData,
    canApply,
    isAwaitingReview,
    needsImprovement,
    progressPercentage
  } = useVerificationData({ 
    autoRefresh: true, 
    refreshInterval: 60000 // Refresh every minute
  });

  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    removeNotification,
    clearAll
  } = useVerificationNotifications();

  // Enhanced submit application with notifications
  const handleSubmitApplication = useCallback(async () => {
    try {
      const result = await submitApplication();
      
      // Trigger notification event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('verification-application-submitted', {
          detail: { userId: user?.uid, result }
        }));
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting verification application:', error);
      throw error;
    }
  }, [submitApplication, user?.uid]);

  // Auto-check eligibility and trigger notifications
  useEffect(() => {
    if (!user?.uid || isLoading) return;

    // Check if user just became eligible
    if (data.isEligible && !data.isVerified && data.applicationStatus === 'none') {
      // Check if we should show eligibility notification
      const lastNotificationKey = `verification-eligible-notified-${user.uid}`;
      const lastNotified = localStorage.getItem(lastNotificationKey);
      const now = Date.now();
      
      // Only notify once per day
      if (!lastNotified || now - parseInt(lastNotified) > 24 * 60 * 60 * 1000) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('verification-eligible'));
        }
        localStorage.setItem(lastNotificationKey, now.toString());
      }
    }

    // Check for progress milestones
    if (data.overallScore >= 80 && data.overallScore < 100 && !data.isEligible) {
      const reminderKey = `verification-reminder-80-${user.uid}`;
      const lastReminder = localStorage.getItem(reminderKey);
      const now = Date.now();
      
      // Remind once per week when 80% complete
      if (!lastReminder || now - parseInt(lastReminder) > 7 * 24 * 60 * 60 * 1000) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('verification-reminder'));
        }
        localStorage.setItem(reminderKey, now.toString());
      }
    }
  }, [data, user?.uid, isLoading]);

  // Listen for verification status changes from admin actions
  useEffect(() => {
    if (typeof window === 'undefined' || !user?.uid) return;

    const handleStatusChange = (event: CustomEvent) => {
      const { userId, newStatus } = event.detail;
      
      if (userId === user.uid) {
        // Refresh data when status changes
        refreshData();
        
        // Trigger appropriate notification
        if (newStatus === 'approved') {
          window.dispatchEvent(new CustomEvent('verification-approved'));
        } else if (newStatus === 'rejected') {
          window.dispatchEvent(new CustomEvent('verification-rejected'));
        }
      }
    };

    window.addEventListener('verification-status-changed' as any, handleStatusChange);
    
    return () => {
      window.removeEventListener('verification-status-changed' as any, handleStatusChange);
    };
  }, [user?.uid, refreshData]);

  const contextValue: VerificationContextType = {
    // Data
    data,
    isLoading,
    error,
    
    // Actions
    submitApplication: handleSubmitApplication,
    refreshData,
    
    // Computed states
    canApply,
    isAwaitingReview,
    needsImprovement,
    progressPercentage,
    
    // Notifications
    notifications,
    unreadNotificationCount: unreadCount,
    addNotification,
    markNotificationAsRead: markAsRead,
    removeNotification,
    clearAllNotifications: clearAll
  };

  return (
    <VerificationContext.Provider value={contextValue}>
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
}

// Higher-order component for protecting verified-only routes/components
export function withVerificationRequired<P extends object>(
  Component: React.ComponentType<P>
) {
  return function VerificationRequired(props: P) {
    const { data, isLoading } = useVerification();

    if (isLoading) {
      return <div>Loading verification status...</div>;
    }

    if (!data.isVerified) {
      return (
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Verification Required</h2>
          <p className="text-muted-foreground">
            This feature is only available to verified creators.
          </p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Hook for checking verification-dependent features
export function useVerificationFeatures() {
  const { data } = useVerification();

  return {
    canAccessVerifiedFeatures: data.isVerified,
    canApplyForVerification: data.isEligible && !data.isVerified && data.applicationStatus === 'none',
    showVerificationBadge: data.isVerified,
    showVerificationProgress: !data.isVerified,
    verificationProgressPercent: data.overallScore,
    nextVerificationSteps: data.nextSteps || []
  };
}
