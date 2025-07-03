'use client';

import React from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProgressiveOnboarding } from '@/components/onboarding/ProgressiveOnboarding';

interface CreatorNotificationButtonProps {
  creatorId: string;
  creatorName: string;
  className?: string;
}

export default function CreatorNotificationButton({ 
  creatorId, 
  creatorName, 
  className = '' 
}: CreatorNotificationButtonProps) {
  const { user } = useAuth();
  const { trackAction } = useProgressiveOnboarding();

  const handleNotificationRequest = () => {
    if (!user) {
      // Track the notification attempt
      trackAction('favorite_attempt');
      
      // Trigger email capture modal with creator-specific messaging
      window.dispatchEvent(new CustomEvent('show-email-capture', {
        detail: { 
          trigger: 'creator_notification',
          creatorName: creatorName 
        }
      }));
      return;
    }

    // If user is logged in, handle actual notification setup
    // TODO: Implement notification preferences
    console.log('Setting up notifications for:', creatorId);
  };

  return (
    <button
      onClick={handleNotificationRequest}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-500/30 hover:border-brand-500 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 hover:text-brand-200 transition-all ${className}`}
    >
      <Bell className="w-4 h-4" />
      <span className="text-sm font-medium">
        {user ? 'Get Notifications' : `Get notified when ${creatorName} posts`}
      </span>
    </button>
  );
}
