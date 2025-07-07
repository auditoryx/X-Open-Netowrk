import React, { useState, useEffect } from 'react';
import { Zap, X, TrendingUp, Award, CheckCircle } from 'lucide-react';

interface XPNotification {
  id: string;
  type: 'xp_gained' | 'daily_cap' | 'tier_up' | 'badge_earned';
  title: string;
  message: string;
  xpAmount?: number;
  duration?: number;
  icon?: React.ReactNode;
}

interface XPNotificationSystemProps {
  notifications: XPNotification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const XPNotificationToast: React.FC<{
  notification: XPNotification;
  onDismiss: (id: string) => void;
  isVisible: boolean;
}> = ({ notification, onDismiss, isVisible }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const getIcon = () => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'xp_gained':
        return <Zap className="h-5 w-5 text-yellow-400" />;
      case 'daily_cap':
        return <TrendingUp className="h-5 w-5 text-orange-400" />;
      case 'tier_up':
        return <Award className="h-5 w-5 text-purple-400" />;
      case 'badge_earned':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      default:
        return <Zap className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'xp_gained':
        return 'bg-yellow-900/20 border-yellow-500/30';
      case 'daily_cap':
        return 'bg-orange-900/20 border-orange-500/30';
      case 'tier_up':
        return 'bg-purple-900/20 border-purple-500/30';
      case 'badge_earned':
        return 'bg-green-900/20 border-green-500/30';
      default:
        return 'bg-blue-900/20 border-blue-500/30';
    }
  };

  const handleDismiss = () => {
    setIsRemoving(true);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isRemoving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        ${getBackgroundColor()}
        border rounded-lg p-4 shadow-lg backdrop-blur-sm
        max-w-sm w-full
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-white truncate">
              {notification.title}
            </h4>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-300 mb-2">
            {notification.message}
          </p>
          
          {notification.xpAmount && (
            <div className="flex items-center gap-1 text-xs">
              <Zap className="h-3 w-3 text-yellow-400" />
              <span className="text-yellow-400 font-medium">
                +{notification.xpAmount} XP
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const XPNotificationSystem: React.FC<XPNotificationSystemProps> = ({
  notifications,
  onDismiss,
  position = 'top-right'
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    notifications.forEach(notification => {
      if (!visibleNotifications.has(notification.id)) {
        setTimeout(() => {
          setVisibleNotifications(prev => new Set([...prev, notification.id]));
        }, 100);
      }
    });
  }, [notifications]);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-3 pointer-events-none`}>
      {notifications.map(notification => (
        <div key={notification.id} className="pointer-events-auto">
          <XPNotificationToast
            notification={notification}
            onDismiss={onDismiss}
            isVisible={visibleNotifications.has(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};

// Hook for managing XP notifications
export const useXPNotifications = () => {
  const [notifications, setNotifications] = useState<XPNotification[]>([]);

  const addNotification = (notification: Omit<XPNotification, 'id'>) => {
    const id = `xp-notification-${Date.now()}-${Math.random()}`;
    const newNotification: XPNotification = {
      ...notification,
      id,
      duration: notification.duration || 5000 // 5 seconds default
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Helper functions for common notification types
  const notifyXPGained = (xpAmount: number, source: string) => {
    addNotification({
      type: 'xp_gained',
      title: 'XP Earned!',
      message: `You earned XP from ${source}`,
      xpAmount
    });
  };

  const notifyDailyCap = () => {
    addNotification({
      type: 'daily_cap',
      title: 'Daily XP Cap Reached',
      message: 'You\'ve reached your daily XP limit. Come back tomorrow for more!',
      duration: 7000
    });
  };

  const notifyTierUp = (newTier: string) => {
    addNotification({
      type: 'tier_up',
      title: 'Tier Upgrade!',
      message: `Congratulations! You've reached ${newTier} tier!`,
      duration: 8000
    });
  };

  const notifyBadgeEarned = (badgeName: string) => {
    addNotification({
      type: 'badge_earned',
      title: 'Badge Earned!',
      message: `You've earned the "${badgeName}" badge!`,
      duration: 6000
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    notifyXPGained,
    notifyDailyCap,
    notifyTierUp,
    notifyBadgeEarned
  };
};

export default XPNotificationSystem;
