import { xpService, XPEvent } from '@/lib/services/xpService';

/**
 * Enhanced XP service with automatic notifications
 * This wraps the core XP service to add notification triggers
 */
class XPServiceWithNotifications {
  private static instance: XPServiceWithNotifications;
  private notificationCallbacks: {
    onXPGained?: (xpAmount: number, source: string) => void;
    onDailyCap?: () => void;
    onTierUp?: (newTier: string) => void;
  } = {};

  private constructor() {}

  static getInstance(): XPServiceWithNotifications {
    if (!XPServiceWithNotifications.instance) {
      XPServiceWithNotifications.instance = new XPServiceWithNotifications();
    }
    return XPServiceWithNotifications.instance;
  }

  /**
   * Set notification callbacks
   */
  setNotificationCallbacks(callbacks: {
    onXPGained?: (xpAmount: number, source: string) => void;
    onDailyCap?: () => void;
    onTierUp?: (newTier: string) => void;
  }) {
    this.notificationCallbacks = callbacks;
  }

  /**
   * Award XP with automatic notifications
   */
  async awardXPWithNotifications(
    userId: string,
    event: XPEvent,
    options: {
      contextId?: string;
      metadata?: Record<string, any>;
      skipDuplicateCheck?: boolean;
      notificationSource?: string; // Custom source name for notification
    } = {}
  ) {
    try {
      // Get user's previous progress for tier comparison
      const previousProgress = await xpService.getUserProgress(userId);
      const previousTier = previousProgress?.tier || 'standard';

      // Award XP using core service
      const result = await xpService.awardXP(userId, event, options);

      if (result.success && result.xpAwarded > 0) {
        // Trigger XP gained notification
        const source = options.notificationSource || this.getEventDisplayName(event);
        this.notificationCallbacks.onXPGained?.(result.xpAwarded, source);

        // Check for tier upgrade
        const newProgress = await xpService.getUserProgress(userId);
        if (newProgress && newProgress.tier !== previousTier) {
          this.notificationCallbacks.onTierUp?.(newProgress.tier);
        }
      }

      // Trigger daily cap notification if reached
      if (result.dailyCapReached) {
        this.notificationCallbacks.onDailyCap?.();
      }

      return result;
    } catch (error) {
      console.error('Error in XP service with notifications:', error);
      return {
        success: false,
        xpAwarded: 0,
        dailyCapReached: false,
        message: 'Error awarding XP'
      };
    }
  }

  /**
   * Get display-friendly event names
   */
  private getEventDisplayName(event: XPEvent): string {
    const eventNames: Record<XPEvent, string> = {
      bookingCompleted: 'completing a booking',
      fiveStarReview: 'receiving a 5-star review',
      referralSignup: 'successful referral signup',
      referralFirstBooking: 'referral first booking',
      profileCompleted: 'completing your profile',
      // Legacy events
      bookingConfirmed: 'booking confirmation',
      onTimeDelivery: 'on-time delivery',
      sevenDayStreak: '7-day activity streak',
      creatorReferral: 'creator referral'
    };

    return eventNames[event] || event;
  }

  // Proxy other methods to core service
  async getUserProgress(userId: string) {
    return xpService.getUserProgress(userId);
  }

  async getUserXPHistory(userId: string, limit?: number) {
    return xpService.getUserXPHistory(userId, limit);
  }

  async getLeaderboard(limit?: number) {
    return xpService.getLeaderboard(limit);
  }

  async adminAdjustXP(userId: string, xpChange: number, reason: string, adminId: string) {
    return xpService.adminAdjustXP(userId, xpChange, reason, adminId);
  }
}

// Export singleton instance
export const xpServiceWithNotifications = XPServiceWithNotifications.getInstance();

/**
 * Hook to easily use XP service with notifications in components
 */
export const useXPServiceWithNotifications = () => {
  return {
    awardXP: xpServiceWithNotifications.awardXPWithNotifications.bind(xpServiceWithNotifications),
    getUserProgress: xpServiceWithNotifications.getUserProgress.bind(xpServiceWithNotifications),
    getUserXPHistory: xpServiceWithNotifications.getUserXPHistory.bind(xpServiceWithNotifications),
    getLeaderboard: xpServiceWithNotifications.getLeaderboard.bind(xpServiceWithNotifications),
    setNotificationCallbacks: xpServiceWithNotifications.setNotificationCallbacks.bind(xpServiceWithNotifications)
  };
};
