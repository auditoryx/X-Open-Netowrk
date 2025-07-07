import React, { createContext, useContext, ReactNode } from 'react';
import XPNotificationSystem, { useXPNotifications } from '@/components/gamification/XPNotificationSystem';

interface XPNotificationContextType {
  notifyXPGained: (xpAmount: number, source: string) => void;
  notifyDailyCap: () => void;
  notifyTierUp: (newTier: string) => void;
  notifyBadgeEarned: (badgeName: string) => void;
  clearAllNotifications: () => void;
}

const XPNotificationContext = createContext<XPNotificationContextType | undefined>(undefined);

interface XPNotificationProviderProps {
  children: ReactNode;
}

export const XPNotificationProvider: React.FC<XPNotificationProviderProps> = ({ children }) => {
  const {
    notifications,
    dismissNotification,
    notifyXPGained,
    notifyDailyCap,
    notifyTierUp,
    notifyBadgeEarned,
    clearAllNotifications
  } = useXPNotifications();

  const contextValue: XPNotificationContextType = {
    notifyXPGained,
    notifyDailyCap,
    notifyTierUp,
    notifyBadgeEarned,
    clearAllNotifications
  };

  return (
    <XPNotificationContext.Provider value={contextValue}>
      {children}
      <XPNotificationSystem 
        notifications={notifications}
        onDismiss={dismissNotification}
        position="top-right"
      />
    </XPNotificationContext.Provider>
  );
};

export const useXPNotificationContext = (): XPNotificationContextType => {
  const context = useContext(XPNotificationContext);
  if (!context) {
    throw new Error('useXPNotificationContext must be used within XPNotificationProvider');
  }
  return context;
};
