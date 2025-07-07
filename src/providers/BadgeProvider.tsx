/**
 * Badge Management Provider
 * Handles badge notifications, state management, and real-time updates
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useBadgeData } from '@/lib/hooks/useBadgeData';
import { badgeService } from '@/lib/services/badgeService';
import BadgeNotification from '@/components/gamification/BadgeNotification';

interface BadgeNotificationData {
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpBonus?: number;
  timestamp: number;
}

interface BadgeContextType {
  // Notification state
  showNotification: (badge: BadgeNotificationData) => void;
  dismissNotification: () => void;
  
  // Badge checking
  checkForNewBadges: () => Promise<void>;
  
  // State
  isCheckingBadges: boolean;
  lastBadgeCheck: number;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

interface BadgeProviderProps {
  children: ReactNode;
}

export function BadgeProvider({ children }: BadgeProviderProps) {
  const { user } = useAuthContext();
  const { badges, refreshBadgeData } = useBadgeData();
  
  const [currentNotification, setCurrentNotification] = useState<BadgeNotificationData | null>(null);
  const [isCheckingBadges, setIsCheckingBadges] = useState(false);
  const [lastBadgeCheck, setLastBadgeCheck] = useState(0);
  const [previousBadgeIds, setPreviousBadgeIds] = useState<Set<string>>(new Set());

  // Track earned badges to detect new ones
  useEffect(() => {
    if (badges.length > 0) {
      const earnedBadgeIds = new Set(
        badges.filter(badge => badge.isEarned).map(badge => badge.badgeId)
      );
      
      // Check for newly earned badges
      if (previousBadgeIds.size > 0) {
        const newBadgeIds = [...earnedBadgeIds].filter(id => !previousBadgeIds.has(id));
        
        if (newBadgeIds.length > 0) {
          // Show notification for the most recent badge
          const newBadge = badges.find(badge => 
            newBadgeIds.includes(badge.badgeId) && badge.isEarned
          );
          
          if (newBadge) {
            showNotification({
              badgeId: newBadge.badgeId,
              name: newBadge.name,
              description: newBadge.description,
              iconUrl: newBadge.iconUrl,
              rarity: newBadge.rarity as any,
              xpBonus: getBadgeXPBonus(newBadge.badgeId),
              timestamp: Date.now()
            });
          }
        }
      }
      
      setPreviousBadgeIds(earnedBadgeIds);
    }
  }, [badges, previousBadgeIds]);

  // Show badge notification
  const showNotification = useCallback((badge: BadgeNotificationData) => {
    setCurrentNotification(badge);
    
    // Play sound effect (optional)
    if (typeof window !== 'undefined' && 'Audio' in window) {
      try {
        const audio = new Audio('/sounds/badge-earned.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore audio errors (user hasn't interacted with page yet)
        });
      } catch (error) {
        // Ignore audio errors
      }
    }
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  // Check for new badges manually
  const checkForNewBadges = useCallback(async () => {
    if (!user || isCheckingBadges) return;
    
    setIsCheckingBadges(true);
    setLastBadgeCheck(Date.now());
    
    try {
      // Refresh badge data to get latest status
      await refreshBadgeData();
    } catch (error) {
      console.error('Error checking for new badges:', error);
    } finally {
      setIsCheckingBadges(false);
    }
  }, [user, isCheckingBadges, refreshBadgeData]);

  // Auto-check for badges after XP-earning events
  useEffect(() => {
    if (!user) return;

    // Listen for custom events that might trigger badge awards
    const handleXPAwarded = () => {
      // Delay badge check to allow XP processing to complete
      setTimeout(() => {
        checkForNewBadges();
      }, 1000);
    };

    window.addEventListener('xp-awarded', handleXPAwarded);
    return () => window.removeEventListener('xp-awarded', handleXPAwarded);
  }, [user, checkForNewBadges]);

  // Periodic badge check (every 10 minutes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkForNewBadges();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [user, checkForNewBadges]);

  const contextValue: BadgeContextType = {
    showNotification,
    dismissNotification,
    checkForNewBadges,
    isCheckingBadges,
    lastBadgeCheck
  };

  return (
    <BadgeContext.Provider value={contextValue}>
      {children}
      
      {/* Badge Notification Overlay */}
      {currentNotification && (
        <BadgeNotification
          badgeId={currentNotification.badgeId}
          name={currentNotification.name}
          description={currentNotification.description}
          iconUrl={currentNotification.iconUrl}
          rarity={currentNotification.rarity}
          xpBonus={currentNotification.xpBonus}
          isVisible={true}
          onClose={dismissNotification}
        />
      )}
    </BadgeContext.Provider>
  );
}

// Hook to use badge context
export function useBadgeContext() {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error('useBadgeContext must be used within a BadgeProvider');
  }
  return context;
}

// Helper function to get XP bonus for badge
function getBadgeXPBonus(badgeId: string): number {
  const bonusMap: Record<string, number> = {
    session_starter: 50,
    certified_mix: 75,
    studio_regular: 150,
    verified_pro: 200
  };

  return bonusMap[badgeId] || 0;
}

// Utility function to trigger badge check from components
export function triggerBadgeCheck() {
  window.dispatchEvent(new CustomEvent('xp-awarded'));
}
