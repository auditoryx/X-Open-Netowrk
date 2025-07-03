'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { emailService, EmailCaptureData } from '@/lib/services/emailService';

interface OnboardingState {
  hasVisited: boolean;
  emailCaptured: boolean;
  interestsSelected: boolean;
  profileViewed: number;
  searchPerformed: number;
  lastVisit: string;
  lastCreatorViewed?: string;
  lastCreatorName?: string;
  favoriteTried: boolean;
  exitIntentShown: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
  shouldShowEmailCapture: () => boolean;
  shouldShowSignupPrompt: () => boolean;
  shouldShowExitIntent: () => boolean;
  trackAction: (action: 'profile_view' | 'search' | 'contact_attempt' | 'booking_attempt' | 'favorite_attempt', metadata?: any) => void;
  captureEmail: (email: string, source: EmailCaptureData['source']) => Promise<{ success: boolean; message?: string }>;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const STORAGE_KEY = 'auditoryx_onboarding';

export function ProgressiveOnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    hasVisited: false,
    emailCaptured: false,
    interestsSelected: false,
    profileViewed: 0,
    searchPerformed: 0,
    lastVisit: new Date().toISOString(),
    lastCreatorViewed: undefined,
    lastCreatorName: undefined,
    favoriteTried: false,
    exitIntentShown: false,
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedState = JSON.parse(stored);
        setState(parsedState);
      } catch (e) {
        console.warn('Failed to parse onboarding state:', e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<OnboardingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const shouldShowEmailCapture = () => {
    // Don't show if user is already logged in or email already captured
    if (user || state.emailCaptured) return false;
    
    // Show after user has viewed 3+ profiles or performed 2+ searches or tried to favorite
    return state.profileViewed >= 3 || state.searchPerformed >= 2 || state.favoriteTried;
  };

  const shouldShowSignupPrompt = () => {
    // Don't show if user is already logged in
    if (user) return false;
    
    // Show if user tries to contact/book (handled by trackAction)
    return false;
  };

  const shouldShowExitIntent = () => {
    // Don't show if user is logged in, email captured, or already shown
    if (user || state.emailCaptured || state.exitIntentShown) return false;
    
    // Show if user has engaged but hasn't converted
    return state.profileViewed >= 2 || state.searchPerformed >= 1;
  };

  const captureEmail = async (email: string, source: EmailCaptureData['source']) => {
    try {
      const result = await emailService.captureEmail({
        email,
        source,
        metadata: {
          profileViewed: state.profileViewed,
          searchPerformed: state.searchPerformed,
          lastCreatorViewed: state.lastCreatorViewed,
          timestamp: new Date().toISOString(),
        },
      });

      if (result.success) {
        updateState({ emailCaptured: true });
      }

      return result;
    } catch (error) {
      console.error('Failed to capture email:', error);
      return { success: false, message: 'Failed to capture email' };
    }
  };

  const trackAction = (action: 'profile_view' | 'search' | 'contact_attempt' | 'booking_attempt' | 'favorite_attempt', metadata?: any) => {
    switch (action) {
      case 'profile_view':
        updateState({ 
          profileViewed: state.profileViewed + 1,
          lastCreatorViewed: metadata?.creatorId,
          lastCreatorName: metadata?.creatorName,
        });
        break;
      case 'search':
        updateState({ searchPerformed: state.searchPerformed + 1 });
        break;
      case 'favorite_attempt':
        updateState({ favoriteTried: true });
        break;
      case 'contact_attempt':
      case 'booking_attempt':
        // These will trigger immediate signup modals
        break;
    }
  };

  return (
    <OnboardingContext.Provider value={{
      state,
      updateState,
      shouldShowEmailCapture,
      shouldShowSignupPrompt,
      shouldShowExitIntent,
      trackAction,
      captureEmail,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useProgressiveOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useProgressiveOnboarding must be used within ProgressiveOnboardingProvider');
  }
  return context;
}
