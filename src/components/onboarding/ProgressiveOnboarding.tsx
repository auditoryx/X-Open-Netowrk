'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

interface OnboardingState {
  hasVisited: boolean;
  emailCaptured: boolean;
  interestsSelected: boolean;
  profileViewed: number;
  searchPerformed: number;
  lastVisit: string;
}

interface OnboardingContextType {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
  shouldShowEmailCapture: () => boolean;
  shouldShowSignupPrompt: () => boolean;
  trackAction: (action: 'profile_view' | 'search' | 'contact_attempt' | 'booking_attempt') => void;
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
    
    // Show after user has viewed 2+ profiles or performed 1+ search
    return state.profileViewed >= 2 || state.searchPerformed >= 1;
  };

  const shouldShowSignupPrompt = () => {
    // Don't show if user is already logged in
    if (user) return false;
    
    // Show if user tries to contact/book (handled by trackAction)
    return false;
  };

  const trackAction = (action: 'profile_view' | 'search' | 'contact_attempt' | 'booking_attempt') => {
    switch (action) {
      case 'profile_view':
        updateState({ profileViewed: state.profileViewed + 1 });
        break;
      case 'search':
        updateState({ searchPerformed: state.searchPerformed + 1 });
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
      trackAction,
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
