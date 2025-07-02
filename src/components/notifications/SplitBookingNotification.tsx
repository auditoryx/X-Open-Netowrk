import React from 'react';
import { BookingNotification } from '@/src/lib/types/Booking';
import { Users, Music, Headphones, Mic, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SplitBookingNotificationProps {
  notification: BookingNotification;
  onMarkAsRead?: (notificationId: string) => void;
  onAcceptInvite?: (bookingId: string) => void;
  onDeclineInvite?: (bookingId: string) => void;
}

const NOTIFICATION_ICONS = {
  split_booking_invite: Users,
  split_booking_confirmed: CheckCircle,
  split_booking_cancelled: XCircle,
  talent_request: Music,
  talent_response: CheckCircle,
  payment_required: DollarSign,
  session_reminder: Clock
};

const TALENT_ICONS = {
  artist: Music,
  producer: Headphones,
  engineer: Mic
};

export function SplitBookingNotification({ 
  notification, 
  onMarkAsRead, 
  onAcceptInvite, 
  onDeclineInvite 
}: SplitBookingNotificationProps) {
  const Icon = NOTIFICATION_ICONS[notification.type] || Users;
  
  const formatTimeAgo = (timestamp: any) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getNotificationContent = () => {
    switch (notification.type) {
      case 'split_booking_invite':
        return {
          title: 'Split Session Invitation',
          message: `${notification.data?.inviterName} invited you to join a split studio session`,
          actions: (
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => onAcceptInvite?.(notification.bookingId)}
                className="flex items-center space-x-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded text-xs font-medium"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => onDeclineInvite?.(notification.bookingId)}
                className="flex items-center space-x-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded text-xs font-medium"
              >
                <XCircle className="w-3 h-3" />
                <span>Decline</span>
              </button>
            </div>
          )
        };

      case 'split_booking_confirmed':
        return {
          title: 'Session Confirmed',
          message: `Your split studio session has been confirmed and is ready for payment`
        };

      case 'split_booking_cancelled':
        return {
          title: 'Session Cancelled',
          message: `Your split studio session has been cancelled`
        };

      case 'talent_request':
        const talentRole = notification.data?.talentRole;
        const TalentIcon = talentRole ? TALENT_ICONS[talentRole as keyof typeof TALENT_ICONS] : Music;
        return {
          title: 'Talent Request',
          message: `You've been requested to join a studio session as ${talentRole}`,
          icon: TalentIcon,
          actions: (
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => onAcceptInvite?.(notification.bookingId)}
                className="flex items-center space-x-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded text-xs font-medium"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => onDeclineInvite?.(notification.bookingId)}
                className="flex items-center space-x-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded text-xs font-medium"
              >
                <XCircle className="w-3 h-3" />
                <span>Decline</span>
              </button>
            </div>
          )
        };

      case 'talent_response':
        const responseStatus = notification.data?.response;
        const responderName = notification.data?.responderName;
        const responderRole = notification.data?.talentRole;
        return {
          title: 'Talent Response',
          message: `${responderName} has ${responseStatus} your request to join as ${responderRole}`
        };

      case 'payment_required':
        return {
          title: 'Payment Required',
          message: `Your payment is required to confirm the split studio session`,
          icon: DollarSign
        };

      case 'session_reminder':
        return {
          title: 'Session Reminder',
          message: `Your split studio session starts in ${notification.data?.timeUntil}`,
          icon: Clock
        };

      default:
        return {
          title: 'Split Session Update',
          message: notification.message || 'You have a new update for your split session'
        };
    }
  };

  const content = getNotificationContent();
  const NotificationIcon = content.icon || Icon;

  return (
    <div 
      className={`p-4 border-l-4 ${
        notification.read 
          ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600' 
          : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
      } rounded-r-lg`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${
          notification.read 
            ? 'bg-gray-200 dark:bg-gray-700' 
            : 'bg-blue-100 dark:bg-blue-900/30'
        }`}>
          <NotificationIcon className={`w-5 h-5 ${
            notification.read 
              ? 'text-gray-500 dark:text-gray-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium ${
              notification.read 
                ? 'text-gray-700 dark:text-gray-300' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {content.title}
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimeAgo(notification.createdAt)}
              </span>
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead?.(notification.id!)}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
          
          <p className={`text-sm mt-1 ${
            notification.read 
              ? 'text-gray-600 dark:text-gray-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            {content.message}
          </p>

          {/* Session Details */}
          {notification.data?.sessionTitle && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Session:</span> {notification.data.sessionTitle}
            </div>
          )}

          {notification.data?.studioName && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Studio:</span> {notification.data.studioName}
            </div>
          )}

          {/* Actions */}
          {content.actions}
        </div>
      </div>
    </div>
  );
}
