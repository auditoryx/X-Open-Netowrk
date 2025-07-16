'use client';

import { useState } from 'react';
import { emailService, EmailCaptureData } from '@/lib/services/emailService';
import { useProgressiveOnboarding } from '@/components/onboarding/ProgressiveOnboarding';
import toast from 'react-hot-toast';
import { SCHEMA_FIELDS } from '../lib/SCHEMA_FIELDS';

export interface UseEmailCaptureResult {
  captureEmail: (email: string, source: EmailCaptureData['source']) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useEmailCapture(): UseEmailCaptureResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { state } = useProgressiveOnboarding();

  const captureEmail = async (email: string, source: EmailCaptureData['source']): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Prepare capture data with progressive onboarding context
      const captureData: EmailCaptureData = {
        email,
        source,
        metadata: {
          profileViewed: state.profileViewed,
          searchPerformed: state.searchPerformed,
          lastCreatorViewed: getLastViewedCreator(),
          timestamp: new Date().toISOString(),
        },
      };

      const result = await emailService.captureEmail(captureData);

      if (result.success) {
        setSuccess(true);
        
        // Show success toast
        toast.success('🎉 Welcome to AuditoryX! Check your email for exclusive deals.', {
          duration: 5000,
          style: {
            background: '#10b981',
            color: 'white',
          },
        });

        // Track successful email capture
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag(SCHEMA_FIELDS.XP_TRANSACTION.EVENT, 'email_capture', {
            event_category: 'engagement',
            event_label: source,
            value: 1,
          });
        }

        return true;
      } else {
        throw new Error(result.message || 'Failed to capture email');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      // Show error toast
      toast.error(errorMessage, {
        duration: 4000,
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    captureEmail,
    isLoading,
    error,
    success,
  };
}

// Helper function to get the last viewed creator from URL or localStorage
function getLastViewedCreator(): string {
  if (typeof window === 'undefined') return '';

  // Try to get from current URL if on profile page
  const pathname = window.location.pathname;
  if (pathname.startsWith('/profile/')) {
    return pathname.split('/profile/')[1] || '';
  }

  // Try to get from localStorage (you could track this in progressive onboarding)
  return localStorage.getItem('lastViewedCreator') || '';
}
