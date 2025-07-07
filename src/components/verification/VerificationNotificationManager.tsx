/**
 * Verification Notification Manager
 * Manages verification-related notifications in the app shell
 */

'use client';

import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { useVerificationData } from '@/lib/hooks/useVerificationData';
import VerificationNotification from '@/components/verification/VerificationNotification';

export default function VerificationNotificationManager() {
  const { user } = useAuth();
  const { status, loading } = useVerificationData();

  useEffect(() => {
    if (!user || loading || !status) return;

    // Show notification when user becomes eligible
    if (status.isEligible && !status.currentApplication && !status.isVerified) {
      // Check if we've already shown this notification
      const notificationKey = `verification-eligible-${user.uid}`;
      const lastShown = localStorage.getItem(notificationKey);
      const now = Date.now();
      
      // Show every 3 days if not applied
      if (!lastShown || (now - parseInt(lastShown)) > 3 * 24 * 60 * 60 * 1000) {
        toast.custom((t) => (
          <VerificationNotification
            type="eligible"
            onClose={() => {
              toast.dismiss(t.id);
              localStorage.setItem(notificationKey, now.toString());
            }}
            onAction={() => {
              toast.dismiss(t.id);
              localStorage.setItem(notificationKey, now.toString());
              // Navigate to verification page
              window.location.href = '/dashboard/verification';
            }}
          />
        ), {
          duration: 8000,
          position: 'top-right',
        });
      }
    }

    // Show notification when application status changes
    if (status.currentApplication) {
      const app = status.currentApplication;
      const notificationKey = `verification-status-${app.id}-${app.status}`;
      const hasShown = sessionStorage.getItem(notificationKey);

      if (!hasShown) {
        if (app.status === 'approved') {
          toast.custom((t) => (
            <VerificationNotification
              type="approved"
              onClose={() => {
                toast.dismiss(t.id);
                sessionStorage.setItem(notificationKey, 'true');
              }}
            />
          ), {
            duration: 10000,
            position: 'top-right',
          });
        } else if (app.status === 'rejected') {
          toast.custom((t) => (
            <VerificationNotification
              type="rejected"
              message={app.reviewNotes}
              onClose={() => {
                toast.dismiss(t.id);
                sessionStorage.setItem(notificationKey, 'true');
              }}
            />
          ), {
            duration: 12000,
            position: 'top-right',
          });
        }
      }
    }
  }, [user, status, loading]);

  // This component doesn't render anything visible
  return null;
}
