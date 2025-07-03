'use client';

import React, { useEffect, useState } from 'react';
import { useProgressiveOnboarding } from './ProgressiveOnboarding';
import EmailCaptureModal from './EmailCaptureModal';
import SignupPromptModal from './SignupPromptModal';
import { useAuth } from '@/lib/hooks/useAuth';

export default function OnboardingManager() {
  const { user } = useAuth();
  const { shouldShowEmailCapture, shouldShowExitIntent, updateState, state } = useProgressiveOnboarding();
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupPromptAction, setSignupPromptAction] = useState<'contact' | 'booking'>('contact');
  const [creatorName, setCreatorName] = useState<string>();
  const [emailCaptureType, setEmailCaptureType] = useState<'profile_views' | 'save_attempt' | 'exit_intent' | 'creator_notification'>('profile_views');

  // Check if we should show email capture modal
  useEffect(() => {
    if (!user && shouldShowEmailCapture()) {
      // Add a small delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setEmailCaptureType('profile_views');
        setShowEmailCapture(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user, shouldShowEmailCapture]);

  // Exit intent detection
  useEffect(() => {
    if (!user && shouldShowExitIntent()) {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0 && !state.exitIntentShown) {
          setEmailCaptureType('exit_intent');
          setShowEmailCapture(true);
          updateState({ exitIntentShown: true });
        }
      };

      document.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        document.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [user, shouldShowExitIntent, state.exitIntentShown, updateState]);

  // Listen for email capture events
  useEffect(() => {
    const handleEmailCapture = (event: CustomEvent) => {
      if (!user) {
        setEmailCaptureType(event.detail.trigger);
        setCreatorName(event.detail.creatorName);
        setShowEmailCapture(true);
      }
    };

    window.addEventListener('show-email-capture', handleEmailCapture as EventListener);
    
    return () => {
      window.removeEventListener('show-email-capture', handleEmailCapture as EventListener);
    };
  }, [user]);

  // Listen for signup prompt events
  useEffect(() => {
    const handleSignupPrompt = (event: CustomEvent) => {
      if (!user) {
        setSignupPromptAction(event.detail.action);
        setCreatorName(event.detail.creatorName);
        setShowSignupPrompt(true);
      }
    };

    window.addEventListener('show-signup-prompt', handleSignupPrompt as EventListener);
    
    return () => {
      window.removeEventListener('show-signup-prompt', handleSignupPrompt as EventListener);
    };
  }, [user]);

  return (
    <>
      <EmailCaptureModal
        isOpen={showEmailCapture}
        onClose={() => setShowEmailCapture(false)}
        trigger={emailCaptureType}
        creatorName={creatorName}
      />
      
      <SignupPromptModal
        isOpen={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        action={signupPromptAction}
        creatorName={creatorName}
      />
    </>
  );
}
