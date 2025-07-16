/**
 * Verification Notification Component
 * Displays notifications for verification status changes
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/Button";
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  X, 
  ArrowRight,
  Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VerificationNotificationProps {
  type: 'eligible' | 'applied' | 'approved' | 'rejected' | 'reminder';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
}

const notificationStyles = {
  eligible: {
    container: 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50',
    icon: Shield,
    iconClass: 'text-blue-600',
    iconBg: 'bg-blue-100'
  },
  applied: {
    container: 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50',
    icon: Clock,
    iconClass: 'text-yellow-600',
    iconBg: 'bg-yellow-100'
  },
  approved: {
    container: 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50',
    icon: CheckCircle,
    iconClass: 'text-green-600',
    iconBg: 'bg-green-100'
  },
  rejected: {
    container: 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50',
    icon: XCircle,
    iconClass: 'text-red-600',
    iconBg: 'bg-red-100'
  },
  reminder: {
    container: 'border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50',
    icon: Sparkles,
    iconClass: 'text-purple-600',
    iconBg: 'bg-purple-100'
  }
};

export function VerificationNotification({
  type,
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
  autoHide = false,
  autoHideDelay = 5000,
  className
}: VerificationNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const style = notificationStyles[type];
  const IconComponent = style.icon;

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay]);

  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <Card 
      className={cn(
        'shadow-md transition-all duration-200',
        style.container,
        isAnimating && 'opacity-0 translate-y-[-10px]',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn('p-2 rounded-full flex-shrink-0', style.iconBg)}>
            <IconComponent className={cn('h-5 w-5', style.iconClass)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
              </div>

              {/* Dismiss Button */}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Action Button */}
            {actionLabel && onAction && (
              <div className="mt-3">
                <Button
                  variant="default"
                  size="sm"
                  onClick={onAction}
                  className="text-xs"
                >
                  {actionLabel}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}

            {/* Status Badge for certain types */}
            {(type === 'applied' || type === 'approved') && (
              <div className="mt-2">
                <Badge 
                  variant={type === 'approved' ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs',
                    type === 'approved' && 'bg-green-600 hover:bg-green-700',
                    type === 'applied' && 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {type === 'approved' ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Under Review
                    </>
                  )}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-configured notification components for common scenarios
export const VerificationEligibleNotification = (props: Omit<VerificationNotificationProps, 'type' | 'title' | 'message'>) => (
  <VerificationNotification
    type="eligible"
    title="Ready for Verification!"
    message="Congratulations! You've met all requirements and can now apply for verification status."
    {...props}
  />
);

export const VerificationAppliedNotification = (props: Omit<VerificationNotificationProps, 'type' | 'title' | 'message'>) => (
  <VerificationNotification
    type="applied"
    title="Application Submitted"
    message="Your verification application has been submitted and is under review. We'll notify you once it's been processed."
    {...props}
  />
);

export const VerificationApprovedNotification = (props: Omit<VerificationNotificationProps, 'type' | 'title' | 'message'>) => (
  <VerificationNotification
    type="approved"
    title="Verification Approved!"
    message="🎉 Congratulations! You're now a verified creator on AuditoryX. Your profile will display the verified badge."
    {...props}
  />
);

export const VerificationRejectedNotification = (props: Omit<VerificationNotificationProps, 'type' | 'title' | 'message'>) => (
  <VerificationNotification
    type="rejected"
    title="Application Needs Improvement"
    message="Your verification application requires some improvements. Please review the feedback and requirements before reapplying."
    {...props}
  />
);

export const VerificationReminderNotification = (props: Omit<VerificationNotificationProps, 'type' | 'title' | 'message'>) => (
  <VerificationNotification
    type="reminder"
    title="Verification Available"
    message="You're close to meeting verification requirements! Complete a few more criteria to unlock verified status."
    {...props}
  />
);

export default VerificationNotification;
