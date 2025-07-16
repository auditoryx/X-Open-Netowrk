/**
 * Seasonal Service
 * 
 * Manages seasonal features including:
 * - Seasonal badges and rewards
 * - Time-limited XP bonuses
 * - Special event framework
 * - Community engagement features
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { badgeService } from './badgeService';
import { enhancedXPService } from './enhancedXPService';

// Seasonal Types
export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  type: 'season' | 'holiday' | 'special_event' | 'community_challenge';
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'upcoming' | 'active' | 'completed';
  
  // Event configuration
  xpMultiplier?: number; // e.g., 1.5 for 50% bonus
  badgeIds?: string[]; // Special badges for this event
  challengeIds?: string[]; // Related challenges
  
  // Participation tracking
  participantCount: number;
  totalXPAwarded: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface SeasonalBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  eventId: string;
  
  // Unlock criteria
  requirements: {
    xpThreshold?: number;
    challengesCompleted?: number;
    activityDays?: number;
    specificActions?: string[];
  };
  
  // Availability
  availableFrom: Timestamp;
  availableUntil: Timestamp;
  maxAwards?: number; // Limit how many can be awarded
  currentAwards: number;
  
  // Rewards
  xpReward: number;
  specialReward?: string; // e.g., profile frame, title
  
  createdAt: Timestamp;
}

export interface UserSeasonalProgress {
  userId: string;
  eventId: string;
  
  // Progress tracking
  xpEarned: number;
  challengesCompleted: number;
  activeDays: number;
  lastActivity: Timestamp;
  
  // Rewards received
  badgesEarned: string[];
  bonusXPReceived: number;
  
  // Participation
  joinedAt: Timestamp;
  lastUpdated: Timestamp;
}

export interface SeasonalAnalytics {
  eventId: string;
  
  // Participation metrics
  totalParticipants: number;
  activeParticipants: number;
  completionRate: number;
  
  // Engagement metrics
  averageXPPerUser: number;
  averageActiveDays: number;
  totalBadgesAwarded: number;
  
  // Performance metrics
  xpBonusDistributed: number;
  challengeCompletionRate: number;
  
  // Time-based analytics
  dailyParticipation: Record<string, number>;
  peakActivity: {
    date: string;
    participants: number;
  };
  
  lastUpdated: Timestamp;
}

class SeasonalService {
  private static instance: SeasonalService;

  static getInstance(): SeasonalService {
    if (!SeasonalService.instance) {
      SeasonalService.instance = new SeasonalService();
    }
    return SeasonalService.instance;
  }

  /**
   * Create a new seasonal event
   */
  async createSeasonalEvent(eventData: Partial<SeasonalEvent>): Promise<string> {
    try {
      const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const event: SeasonalEvent = {
        id: eventId,
        name: eventData.name || 'Seasonal Event',
        description: eventData.description || 'A special seasonal event',
        type: eventData.type || 'season',
        startDate: eventData.startDate || Timestamp.now(),
        endDate: eventData.endDate || Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
        status: 'upcoming',
        xpMultiplier: eventData.xpMultiplier || 1.0,
        badgeIds: eventData.badgeIds || [],
        challengeIds: eventData.challengeIds || [],
        participantCount: 0,
        totalXPAwarded: 0,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        createdBy: eventData.createdBy || 'system'
      };

      await setDoc(doc(db, 'seasonalEvents', eventId), event);
      
      // Initialize analytics
      await this.initializeEventAnalytics(eventId);
      
      console.log(`Seasonal event created: ${eventId}`);
      return eventId;
      
    } catch (error) {
      console.error('Error creating seasonal event:', error);
      throw error;
    }
  }

  /**
   * Create seasonal badge
   */
  async createSeasonalBadge(badgeData: Partial<SeasonalBadge>): Promise<string> {
    try {
      const badgeId = `seasonal_badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const badge: SeasonalBadge = {
        id: badgeId,
        name: badgeData.name || 'Seasonal Badge',
        description: badgeData.description || 'A special seasonal badge',
        icon: badgeData.icon || '🎉',
        rarity: badgeData.rarity || 'common',
        eventId: badgeData.eventId!,
        requirements: badgeData.requirements || {},
        availableFrom: badgeData.availableFrom || Timestamp.now(),
        availableUntil: badgeData.availableUntil || Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        maxAwards: badgeData.maxAwards,
        currentAwards: 0,
        xpReward: badgeData.xpReward || 50,
        specialReward: badgeData.specialReward,
        createdAt: serverTimestamp() as Timestamp
      };

      await setDoc(doc(db, 'seasonalBadges', badgeId), badge);
      
      console.log(`Seasonal badge created: ${badgeId}`);
      return badgeId;
      
    } catch (error) {
      console.error('Error creating seasonal badge:', error);
      throw error;
    }
  }

  /**
   * Activate seasonal events that should be active
   */
  async activateSeasonalEvents(): Promise<void> {
    try {
      const now = Timestamp.now();
      const eventsQuery = query(
        collection(db, 'seasonalEvents'),
        where(SCHEMA_FIELDS.BOOKING.STATUS, '==', 'upcoming'),
        where('startDate', '<=', now)
      );

      const snapshot = await getDocs(eventsQuery);
      const batch = writeBatch(db);
      let activatedCount = 0;

      for (const docSnapshot of snapshot.docs) {
        const eventRef = doc(db, 'seasonalEvents', docSnapshot.id);
        batch.update(eventRef, {
          status: 'active',
          updatedAt: serverTimestamp()
        });
        activatedCount++;
      }

      if (activatedCount > 0) {
        await batch.commit();
        console.log(`Activated ${activatedCount} seasonal events`);
      }
    } catch (error) {
      console.error('Error activating seasonal events:', error);
      throw error;
    }
  }

  /**
   * Complete expired seasonal events
   */
  async completeExpiredEvents(): Promise<void> {
    try {
      const now = Timestamp.now();
      const eventsQuery = query(
        collection(db, 'seasonalEvents'),
        where(SCHEMA_FIELDS.BOOKING.STATUS, '==', 'active'),
        where('endDate', '<', now)
      );

      const snapshot = await getDocs(eventsQuery);
      const batch = writeBatch(db);
      let completedCount = 0;

      for (const docSnapshot of snapshot.docs) {
        const eventRef = doc(db, 'seasonalEvents', docSnapshot.id);
        batch.update(eventRef, {
          status: 'completed',
          updatedAt: serverTimestamp()
        });
        completedCount++;
      }

      if (completedCount > 0) {
        await batch.commit();
        console.log(`Completed ${completedCount} expired seasonal events`);
      }
    } catch (error) {
      console.error('Error completing expired events:', error);
      throw error;
    }
  }

  /**
   * Join user to seasonal event
   */
  async joinSeasonalEvent(userId: string, eventId: string): Promise<void> {
    try {
      const eventDoc = await getDoc(doc(db, 'seasonalEvents', eventId));
      if (!eventDoc.exists()) {
        throw new Error('Seasonal event not found');
      }

      const event = eventDoc.data() as SeasonalEvent;
      if (event.status !== 'active') {
        throw new Error('Seasonal event is not active');
      }

      const progressId = `${userId}_${eventId}`;
      const progressDoc = await getDoc(doc(db, 'userSeasonalProgress', progressId));
      
      if (progressDoc.exists()) {
        console.log(`User ${userId} already joined event ${eventId}`);
        return;
      }

      const progress: UserSeasonalProgress = {
        userId,
        eventId,
        xpEarned: 0,
        challengesCompleted: 0,
        activeDays: 0,
        lastActivity: serverTimestamp() as Timestamp,
        badgesEarned: [],
        bonusXPReceived: 0,
        joinedAt: serverTimestamp() as Timestamp,
        lastUpdated: serverTimestamp() as Timestamp
      };

      await setDoc(doc(db, 'userSeasonalProgress', progressId), progress);
      
      // Update event participant count
      await updateDoc(doc(db, 'seasonalEvents', eventId), {
        participantCount: event.participantCount + 1,
        updatedAt: serverTimestamp()
      });
      
      console.log(`User ${userId} joined seasonal event ${eventId}`);
      
    } catch (error) {
      console.error('Error joining seasonal event:', error);
      throw error;
    }
  }

  /**
   * Update user progress in seasonal event
   */
  async updateSeasonalProgress(
    userId: string, 
    eventId: string, 
    progressUpdate: {
      xpEarned?: number;
      challengesCompleted?: number;
      activeDays?: number;
    }
  ): Promise<void> {
    try {
      const progressId = `${userId}_${eventId}`;
      const progressDoc = await getDoc(doc(db, 'userSeasonalProgress', progressId));
      
      if (!progressDoc.exists()) {
        console.log(`User ${userId} not participating in event ${eventId}`);
        return;
      }

      const updateData: any = {
        lastActivity: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      if (progressUpdate.xpEarned !== undefined) {
        updateData.xpEarned = progressUpdate.xpEarned;
      }
      if (progressUpdate.challengesCompleted !== undefined) {
        updateData.challengesCompleted = progressUpdate.challengesCompleted;
      }
      if (progressUpdate.activeDays !== undefined) {
        updateData.activeDays = progressUpdate.activeDays;
      }

      await updateDoc(doc(db, 'userSeasonalProgress', progressId), updateData);
      
      // Check for badge eligibility
      await this.checkSeasonalBadgeEligibility(userId, eventId);
      
      console.log(`Updated seasonal progress for user ${userId} in event ${eventId}`);
      
    } catch (error) {
      console.error('Error updating seasonal progress:', error);
      throw error;
    }
  }

  /**
   * Check and award seasonal badges
   */
  async checkSeasonalBadgeEligibility(userId: string, eventId: string): Promise<string[]> {
    try {
      const progressId = `${userId}_${eventId}`;
      const progressDoc = await getDoc(doc(db, 'userSeasonalProgress', progressId));
      
      if (!progressDoc.exists()) {
        return [];
      }

      const progress = progressDoc.data() as UserSeasonalProgress;
      
      // Get available seasonal badges for this event
      const badgesQuery = query(
        collection(db, 'seasonalBadges'),
        where('eventId', '==', eventId),
        where('availableFrom', '<=', Timestamp.now()),
        where('availableUntil', '>=', Timestamp.now())
      );

      const badgesSnapshot = await getDocs(badgesQuery);
      const earnedBadges: string[] = [];

      for (const badgeDoc of badgesSnapshot.docs) {
        const badge = badgeDoc.data() as SeasonalBadge;
        
        // Skip if already earned
        if (progress.badgesEarned.includes(badge.id)) {
          continue;
        }
        
        // Skip if max awards reached
        if (badge.maxAwards && badge.currentAwards >= badge.maxAwards) {
          continue;
        }

        // Check eligibility
        let eligible = true;
        
        if (badge.requirements.xpThreshold && progress.xpEarned < badge.requirements.xpThreshold) {
          eligible = false;
        }
        
        if (badge.requirements.challengesCompleted && progress.challengesCompleted < badge.requirements.challengesCompleted) {
          eligible = false;
        }
        
        if (badge.requirements.activityDays && progress.activeDays < badge.requirements.activityDays) {
          eligible = false;
        }

        if (eligible) {
          // Award the badge
          await this.awardSeasonalBadge(userId, badge.id);
          earnedBadges.push(badge.id);
        }
      }

      return earnedBadges;
      
    } catch (error) {
      console.error('Error checking seasonal badge eligibility:', error);
      throw error;
    }
  }

  /**
   * Award seasonal badge to user
   */
  async awardSeasonalBadge(userId: string, badgeId: string): Promise<void> {
    try {
      const badgeDoc = await getDoc(doc(db, 'seasonalBadges', badgeId));
      if (!badgeDoc.exists()) {
        throw new Error('Seasonal badge not found');
      }

      const badge = badgeDoc.data() as SeasonalBadge;
      
      // Update user progress
      const progressId = `${userId}_${badge.eventId}`;
      const progressDoc = await getDoc(doc(db, 'userSeasonalProgress', progressId));
      
      if (progressDoc.exists()) {
        const progress = progressDoc.data() as UserSeasonalProgress;
        
        await updateDoc(doc(db, 'userSeasonalProgress', progressId), {
          badgesEarned: [...progress.badgesEarned, badgeId],
          bonusXPReceived: progress.bonusXPReceived + badge.xpReward,
          lastUpdated: serverTimestamp()
        });
      }

      // Update badge award count
      await updateDoc(doc(db, 'seasonalBadges', badgeId), {
        currentAwards: badge.currentAwards + 1
      });

      // Award XP through enhanced XP service
      if (badge.xpReward > 0) {
        await enhancedXPService.awardXP(userId, {
          action: 'seasonalBadgeEarned',
          amount: badge.xpReward,
          category: 'seasonal'
        }, {
          contextId: badgeId,
          metadata: { 
            badgeName: badge.name,
            eventId: badge.eventId,
            seasonal: true
          }
        });
      }

      console.log(`Awarded seasonal badge ${badgeId} to user ${userId}`);
      
    } catch (error) {
      console.error('Error awarding seasonal badge:', error);
      throw error;
    }
  }

  /**
   * Get active seasonal events
   */
  async getActiveSeasonalEvents(): Promise<SeasonalEvent[]> {
    try {
      const eventsQuery = query(
        collection(db, 'seasonalEvents'),
        where(SCHEMA_FIELDS.BOOKING.STATUS, '==', 'active'),
        orderBy('startDate', 'desc')
      );

      const snapshot = await getDocs(eventsQuery);
      return snapshot.docs.map(doc => doc.data() as SeasonalEvent);
      
    } catch (error) {
      console.error('Error getting active seasonal events:', error);
      throw error;
    }
  }

  /**
   * Get user's seasonal progress
   */
  async getUserSeasonalProgress(userId: string): Promise<UserSeasonalProgress[]> {
    try {
      const progressQuery = query(
        collection(db, 'userSeasonalProgress'),
        where(SCHEMA_FIELDS.NOTIFICATION.USER_ID, '==', userId),
        orderBy('joinedAt', 'desc')
      );

      const snapshot = await getDocs(progressQuery);
      return snapshot.docs.map(doc => doc.data() as UserSeasonalProgress);
      
    } catch (error) {
      console.error('Error getting user seasonal progress:', error);
      throw error;
    }
  }

  /**
   * Initialize analytics for an event
   */
  private async initializeEventAnalytics(eventId: string): Promise<void> {
    try {
      const analytics: SeasonalAnalytics = {
        eventId,
        totalParticipants: 0,
        activeParticipants: 0,
        completionRate: 0,
        averageXPPerUser: 0,
        averageActiveDays: 0,
        totalBadgesAwarded: 0,
        xpBonusDistributed: 0,
        challengeCompletionRate: 0,
        dailyParticipation: {},
        peakActivity: {
          date: new Date().toISOString().split('T')[0],
          participants: 0
        },
        lastUpdated: serverTimestamp() as Timestamp
      };

      await setDoc(doc(db, 'seasonalAnalytics', eventId), analytics);
      
    } catch (error) {
      console.error('Error initializing event analytics:', error);
      throw error;
    }
  }

  /**
   * Update event analytics
   */
  async updateEventAnalytics(eventId: string): Promise<void> {
    try {
      // Get all user progress for this event
      const progressQuery = query(
        collection(db, 'userSeasonalProgress'),
        where('eventId', '==', eventId)
      );

      const progressSnapshot = await getDocs(progressQuery);
      const progressData = progressSnapshot.docs.map(doc => doc.data() as UserSeasonalProgress);

      // Get seasonal badges for this event
      const badgesQuery = query(
        collection(db, 'seasonalBadges'),
        where('eventId', '==', eventId)
      );

      const badgesSnapshot = await getDocs(badgesQuery);
      const badgesData = badgesSnapshot.docs.map(doc => doc.data() as SeasonalBadge);

      // Calculate analytics
      const totalParticipants = progressData.length;
      const activeParticipants = progressData.filter(p => {
        const daysSinceLastActivity = (Date.now() - p.lastActivity.toMillis()) / (1000 * 60 * 60 * 24);
        return daysSinceLastActivity <= 7; // Active in last 7 days
      }).length;

      const totalXP = progressData.reduce((sum, p) => sum + p.xpEarned, 0);
      const averageXPPerUser = totalParticipants > 0 ? totalXP / totalParticipants : 0;
      
      const totalActiveDays = progressData.reduce((sum, p) => sum + p.activeDays, 0);
      const averageActiveDays = totalParticipants > 0 ? totalActiveDays / totalParticipants : 0;

      const totalBadgesAwarded = badgesData.reduce((sum, badge) => sum + badge.currentAwards, 0);
      const xpBonusDistributed = progressData.reduce((sum, p) => sum + p.bonusXPReceived, 0);

      const analytics: Partial<SeasonalAnalytics> = {
        totalParticipants,
        activeParticipants,
        completionRate: totalParticipants > 0 ? (activeParticipants / totalParticipants) * 100 : 0,
        averageXPPerUser,
        averageActiveDays,
        totalBadgesAwarded,
        xpBonusDistributed,
        lastUpdated: serverTimestamp() as Timestamp
      };

      await updateDoc(doc(db, 'seasonalAnalytics', eventId), analytics);
      
    } catch (error) {
      console.error('Error updating event analytics:', error);
      throw error;
    }
  }

  /**
   * Get seasonal analytics
   */
  async getSeasonalAnalytics(eventId: string): Promise<SeasonalAnalytics | null> {
    try {
      const analyticsDoc = await getDoc(doc(db, 'seasonalAnalytics', eventId));
      return analyticsDoc.exists() ? analyticsDoc.data() as SeasonalAnalytics : null;
      
    } catch (error) {
      console.error('Error getting seasonal analytics:', error);
      throw error;
    }
  }
}

export default SeasonalService;
export const seasonalService = SeasonalService.getInstance();
