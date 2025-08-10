/**
 * Badge Service - Core badge management and awarding system
 * Handles badge definitions, criteria checking, and automatic awarding
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  runTransaction 
} from 'firebase/firestore';
import { xpService } from './xpService';
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS';

// Badge metadata and criteria definitions
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'milestone' | 'achievement' | 'tier' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: {
    type: 'xp_threshold' | 'booking_count' | 'review_rating' | 'tier_reached' | 'streak' | 'custom';
    value: number | string;
    additionalRequirements?: Record<string, any>;
  };
  rewards?: {
    xpBonus?: number;
    description?: string;
  };
  isActive: boolean;
  createdAt: Timestamp;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  awardedAt: Timestamp;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
  metadata?: Record<string, any>;
}

export interface BadgeProgress {
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string;
  category: string;
  rarity: string;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  isEarned: boolean;
  awardedAt?: Timestamp;
}

export class BadgeService {
  private static instance: BadgeService;
  private badgeDefinitions: Map<string, BadgeDefinition> = new Map();
  private definitionsLoaded = false;

  private constructor() {}

  static getInstance(): BadgeService {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }
    return BadgeService.instance;
  }

  /**
   * Initialize badge definitions (essential badges for Phase 2)
   */
  async initializeBadgeDefinitions(): Promise<void> {
    if (this.definitionsLoaded) return;

    const essentialBadges: BadgeDefinition[] = [
      {
        id: 'session_starter',
        name: 'Session Starter',
        description: 'Complete your first booking session',
        iconUrl: '/badges/session-starter.svg',
        category: 'milestone',
        rarity: 'common',
        criteria: {
          type: 'booking_count',
          value: 1
        },
        rewards: {
          xpBonus: 50,
          description: 'Welcome bonus XP!'
        },
        isActive: true,
        createdAt: Timestamp.now()
      },
      {
        id: 'certified_mix',
        name: 'Certified Mix',
        description: 'Receive your first 5-star review',
        iconUrl: '/badges/certified-mix.svg',
        category: 'achievement',
        rarity: 'rare',
        criteria: {
          type: 'review_rating',
          value: 5,
          additionalRequirements: { count: 1 }
        },
        rewards: {
          xpBonus: 75,
          description: 'Quality work recognized!'
        },
        isActive: true,
        createdAt: Timestamp.now()
      },
      {
        id: 'studio_regular',
        name: 'Studio Regular',
        description: 'Complete 10 projects',
        iconUrl: '/badges/studio-regular.svg',
        category: 'milestone',
        rarity: 'epic',
        criteria: {
          type: 'booking_count',
          value: 10
        },
        rewards: {
          xpBonus: 150,
          description: 'Experienced creator bonus!'
        },
        isActive: true,
        createdAt: Timestamp.now()
      },
      {
        id: 'verified_pro',
        name: 'Verified Pro',
        description: 'Achieve Verified tier status',
        iconUrl: '/badges/verified-pro.svg',
        category: SCHEMA_FIELDS.USER.TIER,
        rarity: 'legendary',
        criteria: {
          type: 'tier_reached',
          value: 'verified'
        },
        rewards: {
          xpBonus: 200,
          description: 'Elite status achieved!'
        },
        isActive: true,
        createdAt: Timestamp.now()
      }
    ];

    // Store definitions in memory and Firestore
    for (const badge of essentialBadges) {
      this.badgeDefinitions.set(badge.id, badge);
      
      // Store in Firestore for persistence
      const badgeRef = doc(db, 'badgeDefinitions', badge.id);
      try {
        await setDoc(badgeRef, badge, { merge: true });
      } catch (error) {
        console.error(`Error storing badge definition ${badge.id}:`, error);
      }
    }

    this.definitionsLoaded = true;
    console.log(`Initialized ${essentialBadges.length} badge definitions`);
  }

  /**
   * Load badge definitions from Firestore
   */
  async loadBadgeDefinitions(): Promise<void> {
    if (this.definitionsLoaded) return;

    try {
      const badgesSnap = await getDocs(collection(db, 'badgeDefinitions'));
      
      if (badgesSnap.empty) {
        // No definitions exist, initialize with essential badges
        await this.initializeBadgeDefinitions();
        return;
      }

      badgesSnap.forEach(doc => {
        const badge = doc.data() as BadgeDefinition;
        if (badge.isActive) {
          this.badgeDefinitions.set(badge.id, badge);
        }
      });

      this.definitionsLoaded = true;
      console.log(`Loaded ${this.badgeDefinitions.size} badge definitions`);
    } catch (error) {
      console.error('Error loading badge definitions:', error);
      // Fallback to initialization if loading fails
      await this.initializeBadgeDefinitions();
    }
  }

  /**
   * Check and award badges for a user based on their current progress
   */
  async checkAndAwardBadges(
    userId: string, 
    triggerEvent?: string,
    eventMetadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    badgesAwarded: string[];
    message: string;
  }> {
    try {
      await this.loadBadgeDefinitions();

      const userProgress = await xpService.getUserProgress(userId);
      if (!userProgress) {
        return {
          success: false,
          badgesAwarded: [],
          message: 'User progress not found'
        };
      }

      const badgesAwarded: string[] = [];

      // Check each badge definition for eligibility
      for (const [badgeId, badge] of this.badgeDefinitions) {
        const hasEarned = await this.hasUserEarnedBadge(userId, badgeId);
        if (hasEarned) continue;

        const isEligible = await this.checkBadgeEligibility(userId, badge, userProgress);
        if (isEligible) {
          const awarded = await this.awardBadge(userId, badgeId, eventMetadata);
          if (awarded) {
            badgesAwarded.push(badgeId);
          }
        }
      }

      return {
        success: true,
        badgesAwarded,
        message: badgesAwarded.length > 0 
          ? `Awarded ${badgesAwarded.length} badge(s)` 
          : 'No new badges earned'
      };
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
      return {
        success: false,
        badgesAwarded: [],
        message: 'Error checking badges'
      };
    }
  }

  /**
   * Check if user meets criteria for a specific badge
   */
  private async checkBadgeEligibility(
    userId: string, 
    badge: BadgeDefinition, 
    userProgress: any
  ): Promise<boolean> {
    const { criteria } = badge;

    switch (criteria.type) {
      case 'xp_threshold':
        return userProgress.totalXP >= criteria.value;

      case 'booking_count':
        const bookingCount = await this.getUserBookingCount(userId);
        return bookingCount >= criteria.value;

      case 'review_rating':
        const hasHighRating = await this.hasUserReceivedRating(
          userId, 
          criteria.value as number,
          criteria.additionalRequirements?.count || 1
        );
        return hasHighRating;

      case 'tier_reached':
        return userProgress.tier === criteria.value;

      case 'streak':
        // For future implementation
        return false;

      case 'custom':
        // For future custom badge logic
        return false;

      default:
        console.warn(`Unknown badge criteria type: ${criteria.type}`);
        return false;
    }
  }

  /**
   * Award a badge to a user
   */
  private async awardBadge(
    userId: string, 
    badgeId: string, 
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      return await runTransaction(db, async (transaction) => {
        // Check if badge already awarded (double-check)
        const userBadgeRef = doc(db, 'userBadges', `${userId}_${badgeId}`);
        const existingBadge = await transaction.get(userBadgeRef);
        
        if (existingBadge.exists()) {
          return false; // Already awarded
        }

        // Award the badge
        const userBadge: UserBadge = {
          userId,
          badgeId,
          awardedAt: Timestamp.now(),
          metadata: {
            ...metadata,
            awardedBySystem: true
          }
        };

        transaction.set(userBadgeRef, userBadge);

        // Award bonus XP if applicable
        const badge = this.badgeDefinitions.get(badgeId);
        if (badge?.rewards?.xpBonus) {
          // Note: This would use enhanced XP service in production
          // For now, we'll log it for manual processing
          console.log(`Badge ${badgeId} awarded to ${userId} with ${badge.rewards.xpBonus} bonus XP`);
        }

        return true;
      });
    } catch (error) {
      console.error(`Error awarding badge ${badgeId} to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Check if user has already earned a badge
   */
  async hasUserEarnedBadge(userId: string, badgeId: string): Promise<boolean> {
    try {
      const userBadgeRef = doc(db, 'userBadges', `${userId}_${badgeId}`);
      const badgeSnap = await getDoc(userBadgeRef);
      return badgeSnap.exists();
    } catch (error) {
      console.error(`Error checking if user has badge ${badgeId}:`, error);
      return false;
    }
  }

  /**
   * Get user's earned badges
   */
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const badgesQuery = query(
        collection(db, 'userBadges'),
        where(SCHEMA_FIELDS.NOTIFICATION.USER_ID, '==', userId)
      );
      
      const badgesSnap = await getDocs(badgesQuery);
      return badgesSnap.docs.map(doc => doc.data() as UserBadge);
    } catch (error) {
      console.error(`Error getting user badges for ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get user's badge progress for all available badges
   */
  async getUserBadgeProgress(userId: string): Promise<BadgeProgress[]> {
    try {
      await this.loadBadgeDefinitions();
      
      const userProgress = await xpService.getUserProgress(userId);
      const earnedBadges = await this.getUserBadges(userId);
      const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId));

      const progress: BadgeProgress[] = [];

      for (const [badgeId, badge] of this.badgeDefinitions) {
        const isEarned = earnedBadgeIds.has(badgeId);
        const currentProgress = await this.getBadgeCurrentProgress(userId, badge, userProgress);
        
        progress.push({
          badgeId,
          name: badge.name,
          description: badge.description,
          iconUrl: badge.iconUrl,
          category: badge.category,
          rarity: badge.rarity,
          progress: currentProgress,
          isEarned,
          awardedAt: isEarned ? earnedBadges.find(b => b.badgeId === badgeId)?.awardedAt : undefined
        });
      }

      return progress;
    } catch (error) {
      console.error(`Error getting badge progress for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get current progress for a specific badge
   */
  private async getBadgeCurrentProgress(
    userId: string, 
    badge: BadgeDefinition, 
    userProgress: any
  ): Promise<{ current: number; target: number; percentage: number }> {
    const { criteria } = badge;
    let current = 0;
    const target = criteria.value as number;

    switch (criteria.type) {
      case 'xp_threshold':
        current = userProgress?.totalXP || 0;
        break;

      case 'booking_count':
        current = await this.getUserBookingCount(userId);
        break;

      case 'review_rating':
        current = await this.getUserHighRatingCount(userId, criteria.value as number);
        break;

      case 'tier_reached':
        // Binary: either reached or not
        current = userProgress?.tier === criteria.value ? 1 : 0;
        break;

      default:
        current = 0;
    }

    const percentage = Math.min(100, Math.floor((current / target) * 100));

    return {
      current: Math.min(current, target),
      target,
      percentage
    };
  }

  /**
   * Helper: Get user's total booking count
   */
  private async getUserBookingCount(userId: string): Promise<number> {
    try {
      // This would query the actual bookings collection
      // For now, we'll estimate from XP transactions
      const xpHistory = await xpService.getUserXPHistory(userId, 1000);
      const bookingCompletions = xpHistory.filter(tx => tx.event === 'bookingCompleted');
      return bookingCompletions.length;
    } catch (error) {
      console.error(`Error getting booking count for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Helper: Check if user has received a specific rating
   */
  private async hasUserReceivedRating(
    userId: string, 
    rating: number, 
    minCount: number = 1
  ): Promise<boolean> {
    try {
      // This would query the reviews collection
      // For now, we'll check XP transactions for five-star reviews
      if (rating === 5) {
        const xpHistory = await xpService.getUserXPHistory(userId, 1000);
        const fiveStarReviews = xpHistory.filter(tx => tx.event === 'fiveStarReview');
        return fiveStarReviews.length >= minCount;
      }
      return false;
    } catch (error) {
      console.error(`Error checking rating history for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Helper: Get count of high ratings for progress tracking
   */
  private async getUserHighRatingCount(userId: string, rating: number): Promise<number> {
    try {
      if (rating === 5) {
        const xpHistory = await xpService.getUserXPHistory(userId, 1000);
        const fiveStarReviews = xpHistory.filter(tx => tx.event === 'fiveStarReview');
        return fiveStarReviews.length;
      }
      return 0;
    } catch (error) {
      console.error(`Error getting high rating count for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Admin: Get all badge definitions
   */
  async getAllBadgeDefinitions(): Promise<BadgeDefinition[]> {
    await this.loadBadgeDefinitions();
    return Array.from(this.badgeDefinitions.values());
  }

  /**
   * Admin: Get badge statistics
   */
  async getBadgeStatistics(): Promise<{
    totalBadges: number;
    totalAwarded: number;
    awardsByBadge: Record<string, number>;
    recentAwards: UserBadge[];
  }> {
    try {
      await this.loadBadgeDefinitions();
      
      const allUserBadges = await getDocs(collection(db, 'userBadges'));
      const badges = allUserBadges.docs.map(doc => doc.data() as UserBadge);

      const awardsByBadge: Record<string, number> = {};
      for (const badge of badges) {
        awardsByBadge[badge.badgeId] = (awardsByBadge[badge.badgeId] || 0) + 1;
      }

      // Get recent awards (last 10)
      const recentAwards = badges
        .sort((a, b) => b.awardedAt.toMillis() - a.awardedAt.toMillis())
        .slice(0, 10);

      return {
        totalBadges: this.badgeDefinitions.size,
        totalAwarded: badges.length,
        awardsByBadge,
        recentAwards
      };
    } catch (error) {
      console.error('Error getting badge statistics:', error);
      return {
        totalBadges: 0,
        totalAwarded: 0,
        awardsByBadge: {},
        recentAwards: []
      };
    }
  }
}

// Export singleton instance
export const badgeService = BadgeService.getInstance();
