'use client';

import React, { useEffect, useState } from 'react';
import { useProgressiveOnboarding } from './ProgressiveOnboarding';
import EmailCaptureModal from './EmailCaptureModal';
import SignupPromptModal from './SignupPromptModal';
import { useAuth } from '@/lib/hooks/useAuth';

export default function OnboardingManager() {
  const { user } = useAuth();
  const { shouldShowEmailCapture } = useProgressiveOnboarding();
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupPromptAction, setSignupPromptAction] = useState<'contact' | 'booking'>('contact');
  const [creatorName, setCreatorName] = useState<string>();

  // Check if we should show email capture modal
  useEffect(() => {
    if (!user && shouldShowEmailCapture()) {
      // Add a small delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setShowEmailCapture(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user, shouldShowEmailCapture]);

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
