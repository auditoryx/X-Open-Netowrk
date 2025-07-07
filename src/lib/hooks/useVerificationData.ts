/**
 * Verification Data Hook
 * Custom hook for managing verification state and operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { verificationService } from '@/lib/services/verificationService';
import { useAuth } from '@/lib/hooks/useAuth';

export interface UseVerificationDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface VerificationData {
  isVerified: boolean;
  isEligible: boolean;
  overallScore: number;
  criteria?: {
    xp: { met: boolean; current: number; required: number };
    profileCompleteness: { met: boolean; current: number; required: number };
    completedBookings: { met: boolean; current: number; required: number };
    averageRating: { met: boolean; current: number; required: number };
    violations: { met: boolean; current: number; allowed: number };
  };
  nextSteps?: string[];
  applicationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  currentApplication?: any;
}

export function useVerificationData(options: UseVerificationDataOptions = {}) {
  const { user } = useAuth();
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  const [data, setData] = useState<VerificationData>({
    isVerified: false,
    isEligible: false,
    overallScore: 0,
    applicationStatus: 'none'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerificationData = useCallback(async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Get verification status
      const status = await verificationService.getUserVerificationStatus(user.uid);
      
      // Get eligibility details
      const eligibility = await verificationService.checkEligibility(user.uid);

      setData({
        isVerified: status.isVerified,
        isEligible: eligibility.isEligible,
        overallScore: eligibility.overallScore,
        criteria: eligibility.criteria,
        nextSteps: eligibility.nextSteps,
        applicationStatus: status.currentApplication ? 
          status.currentApplication.status : 'none',
        currentApplication: status.currentApplication
      });
    } catch (err) {
      console.error('Error fetching verification data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load verification data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  const submitApplication = useCallback(async () => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    try {
      const result = await verificationService.submitApplication(user.uid);
      
      if (result.success) {
        // Refresh data to get updated status
        await fetchVerificationData();
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, fetchVerificationData]);

  const refreshData = useCallback(() => {
    fetchVerificationData();
  }, [fetchVerificationData]);

  // Initial load
  useEffect(() => {
    fetchVerificationData();
  }, [fetchVerificationData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !user?.uid) return;

    const interval = setInterval(fetchVerificationData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchVerificationData, user?.uid]);

  // Listen for verification events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVerificationUpdate = () => {
      refreshData();
    };

    // Listen for custom verification events
    window.addEventListener('verification-status-changed', handleVerificationUpdate);
    window.addEventListener('verification-application-submitted', handleVerificationUpdate);
    
    return () => {
      window.removeEventListener('verification-status-changed', handleVerificationUpdate);
      window.removeEventListener('verification-application-submitted', handleVerificationUpdate);
    };
  }, [refreshData]);

  return {
    data,
    isLoading,
    error,
    submitApplication,
    refreshData,
    // Computed helpers
    canApply: data.isEligible && data.applicationStatus === 'none' && !data.isVerified,
    isAwaitingReview: data.applicationStatus === 'pending',
    needsImprovement: data.applicationStatus === 'rejected',
    progressPercentage: data.overallScore
  };
}

// Utility hook for verification notifications
export function useVerificationNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'eligible' | 'applied' | 'approved' | 'rejected' | 'reminder';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>>([]);

  const addNotification = useCallback((notification: Omit<typeof notifications[0], 'id' | 'timestamp' | 'read'>) => {
    const newNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Trigger browser notification if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon-192x192.png'
      });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Listen for verification events to auto-generate notifications
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVerificationEligible = () => {
      addNotification({
        type: 'eligible',
        title: 'Ready for Verification!',
        message: 'You\'ve met all requirements and can now apply for verification.'
      });
    };

    const handleApplicationSubmitted = () => {
      addNotification({
        type: 'applied',
        title: 'Application Submitted',
        message: 'Your verification application is under review.'
      });
    };

    const handleVerificationApproved = () => {
      addNotification({
        type: 'approved',
        title: 'Verification Approved!',
        message: '🎉 You\'re now a verified creator on AuditoryX!'
      });
    };

    const handleVerificationRejected = () => {
      addNotification({
        type: 'rejected',
        title: 'Application Needs Improvement',
        message: 'Please review the feedback and requirements before reapplying.'
      });
    };

    window.addEventListener('verification-eligible', handleVerificationEligible);
    window.addEventListener('verification-application-submitted', handleApplicationSubmitted);
    window.addEventListener('verification-approved', handleVerificationApproved);
    window.addEventListener('verification-rejected', handleVerificationRejected);

    return () => {
      window.removeEventListener('verification-eligible', handleVerificationEligible);
      window.removeEventListener('verification-application-submitted', handleApplicationSubmitted);
      window.removeEventListener('verification-approved', handleVerificationApproved);
      window.removeEventListener('verification-rejected', handleVerificationRejected);
    };
  }, [addNotification]);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    addNotification,
    markAsRead,
    removeNotification,
    clearAll
  };
}
