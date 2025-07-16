/**
 * Challenge Service - Gamification Challenge System
 * 
 * Manages monthly challenges, auto-challenge creation, and reward distribution
 * for long-term user engagement and retention.
 * 
 * Features:
 * - Monthly challenge framework
 * - Auto-challenge creation and management
 * - Progress tracking and leaderboards
 * - Automated reward distribution
 * - Challenge analytics and insights
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
  increment,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

// Challenge Types
export type ChallengeType = 
  | 'project_completion'    // Most projects completed
  | 'referral_champion'     // Most successful referrals
  | 'five_star_streak'      // Consecutive 5-star reviews
  | 'xp_race'              // Most XP gained in period
  | 'response_speed'        // Fastest average response time
  | 'profile_perfection'    // Profile completion improvements
  | 'community_builder'     // Most helpful reviews/feedback
  | 'consistency_master';   // Most consistent daily activity

export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'archived';

export type ChallengeDifficulty = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  
  // Timeline
  startDate: Timestamp;
  endDate: Timestamp;
  
  // Requirements & Goals
  targetMetric: string;
  targetValue: number;
  minimumParticipants: number;
  
  // Rewards
  rewards: {
    winner: ChallengeReward;
    top3: ChallengeReward;
    top10: ChallengeReward;
    participation: ChallengeReward;
  };
  
  // Analytics
  participantCount: number;
  completionRate: number;
  averageProgress: number;
  
  // Metadata
  createdAt: Timestamp;
  createdBy: string; // 'system' for auto-generated
  tags: string[];
  isRecurring: boolean;
  recurringPattern?: 'monthly' | 'weekly' | 'seasonal';
}

export interface ChallengeReward {
  xp: number;
  badge?: string;
  specialBadge?: string;
  title?: string;
  perks?: string[];
}

export interface ChallengeParticipation {
  challengeId: string;
  userId: string;
  
  // Progress
  currentValue: number;
  targetValue: number;
  progressPercentage: number;
  
  // Ranking
  position: number;
  isWinner: boolean;
  isTop3: boolean;
  isTop10: boolean;
  
  // Timeline
  joinedAt: Timestamp;
  lastUpdated: Timestamp;
  completedAt?: Timestamp;
  
  // Rewards
  rewardsAwarded: ChallengeReward;
  rewardsDistributed: boolean;
}

export interface ChallengeLeaderboard {
  challengeId: string;
  participants: Array<{
    userId: string;
    displayName: string;
    profileImage?: string;
    currentValue: number;
    position: number;
    tier: string;
    isVerified: boolean;
  }>;
  lastUpdated: Timestamp;
}

export interface ChallengeAnalytics {
  challengeId: string;
  totalParticipants: number;
  activeParticipants: number;
  completionRate: number;
  averageProgress: number;
  topPerformers: string[];
  engagementMetrics: {
    dailyActiveParticipants: number;
    peakParticipationDay: string;
    dropOffRate: number;
  };
  impactMetrics: {
    xpGenerated: number;
    badgesAwarded: number;
    platformActivityIncrease: number;
  };
}

class ChallengeService {
  private static instance: ChallengeService;

  public static getInstance(): ChallengeService {
    if (!ChallengeService.instance) {
      ChallengeService.instance = new ChallengeService();
    }
    return ChallengeService.instance;
  }

  // Challenge Templates for Auto-Generation
  private challengeTemplates: Record<ChallengeType, Partial<Challenge>> = {
    project_completion: {
      title: "Project Powerhouse",
      description: "Complete the most projects this month and dominate the leaderboard!",
      targetMetric: "projectsCompleted",
      difficulty: 'gold',
      rewards: {
        winner: { xp: 500, specialBadge: 'monthly_champion', title: 'Project Champion', perks: ['featured_profile'] },
        top3: { xp: 300, badge: 'top_performer' },
        top10: { xp: 150, badge: 'dedicated_creator' },
        participation: { xp: 50 }
      }
    },
    referral_champion: {
      title: "Referral Royalty",
      description: "Bring the most new creators to AuditoryX this month!",
      targetMetric: "successfulReferrals",
      difficulty: 'platinum',
      rewards: {
        winner: { xp: 750, specialBadge: 'referral_king', title: 'Community Builder', perks: ['priority_support', 'featured_profile'] },
        top3: { xp: 400, badge: 'community_champion' },
        top10: { xp: 200, badge: 'network_builder' },
        participation: { xp: 75 }
      }
    },
    five_star_streak: {
      title: "Five-Star Streak",
      description: "Maintain the longest streak of consecutive 5-star reviews!",
      targetMetric: "fiveStarStreak",
      difficulty: 'silver',
      rewards: {
        winner: { xp: 400, specialBadge: 'quality_master', title: 'Excellence Expert' },
        top3: { xp: 250, badge: 'quality_champion' },
        top10: { xp: 125, badge: 'quality_focused' },
        participation: { xp: 40 }
      }
    },
    xp_race: {
      title: "XP Sprint",
      description: "Gain the most XP this month through all activities!",
      targetMetric: "monthlyXP",
      difficulty: 'gold',
      rewards: {
        winner: { xp: 600, specialBadge: 'xp_champion', title: 'XP Master' },
        top3: { xp: 350, badge: 'xp_powerhouse' },
        top10: { xp: 175, badge: 'xp_enthusiast' },
        participation: { xp: 60 }
      }
    },
    response_speed: {
      title: "Lightning Response",
      description: "Maintain the fastest average response time to client messages!",
      targetMetric: "averageResponseTime",
      difficulty: 'bronze',
      rewards: {
        winner: { xp: 300, specialBadge: 'speed_demon', title: 'Quick Responder' },
        top3: { xp: 200, badge: 'swift_communicator' },
        top10: { xp: 100, badge: 'responsive_creator' },
        participation: { xp: 30 }
      }
    },
    profile_perfection: {
      title: "Profile Perfectionist",
      description: "Achieve the highest profile completion score improvements!",
      targetMetric: "profileImprovementScore",
      difficulty: 'bronze',
      rewards: {
        winner: { xp: 250, specialBadge: 'profile_perfectionist', title: 'Detail Master' },
        top3: { xp: 150, badge: 'profile_champion' },
        top10: { xp: 75, badge: 'detail_focused' },
        participation: { xp: 25 }
      }
    },
    community_builder: {
      title: "Community Champion",
      description: "Provide the most helpful reviews and feedback to fellow creators!",
      targetMetric: "helpfulReviewsGiven",
      difficulty: 'silver',
      rewards: {
        winner: { xp: 400, specialBadge: 'community_champion', title: 'Mentor' },
        top3: { xp: 250, badge: 'helpful_reviewer' },
        top10: { xp: 125, badge: 'supportive_creator' },
        participation: { xp: 40 }
      }
    },
    consistency_master: {
      title: "Consistency Crown",
      description: "Maintain the most consistent daily activity on the platform!",
      targetMetric: "dailyActivityStreak",
      difficulty: 'gold',
      rewards: {
        winner: { xp: 500, specialBadge: 'consistency_king', title: 'Daily Champion' },
        top3: { xp: 300, badge: 'consistent_creator' },
        top10: { xp: 150, badge: 'regular_contributor' },
        participation: { xp: 50 }
      }
    }
  };

  /**
   * Create a new challenge
   */
  async createChallenge(challengeData: Partial<Challenge>): Promise<string> {
    try {
      const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const challenge: Challenge = {
        id: challengeId,
        title: challengeData.title || 'Untitled Challenge',
        description: challengeData.description || '',
        type: challengeData.type || 'xp_race',
        difficulty: challengeData.difficulty || 'bronze',
        status: 'upcoming',
        
        startDate: challengeData.startDate || Timestamp.now(),
        endDate: challengeData.endDate || Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        
        targetMetric: challengeData.targetMetric || 'totalXP',
        targetValue: challengeData.targetValue || 1000,
        minimumParticipants: challengeData.minimumParticipants || 5,
        
        rewards: challengeData.rewards || this.challengeTemplates.xp_race.rewards!,
        
        participantCount: 0,
        completionRate: 0,
        averageProgress: 0,
        
        createdAt: serverTimestamp() as Timestamp,
        createdBy: challengeData.createdBy || 'system',
        tags: challengeData.tags || [],
        isRecurring: challengeData.isRecurring || false,
        recurringPattern: challengeData.recurringPattern,
        ...challengeData
      };

      await setDoc(doc(db, 'challenges', challengeId), challenge);
      
      console.log(`Challenge created: ${challengeId}`);
      return challengeId;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  /**
   * Auto-generate monthly challenges
   */
  async generateMonthlyChallenges(): Promise<string[]> {
    try {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Check if challenges already exist for this month
      const existingChallenges = await getDocs(
        query(
          collection(db, 'challenges'),
          where('startDate', '>=', Timestamp.fromDate(startOfMonth)),
          where('startDate', '<=', Timestamp.fromDate(endOfMonth)),
          where('createdBy', '==', 'system')
        )
      );

      if (!existingChallenges.empty) {
        console.log('Monthly challenges already exist for this period');
        return existingChallenges.docs.map(doc => doc.id);
      }

      // Generate 3-4 diverse challenges for the month
      const challengeTypes: ChallengeType[] = ['project_completion', 'referral_champion', 'five_star_streak', 'xp_race'];
      const createdChallenges: string[] = [];

      for (const type of challengeTypes) {
        const template = this.challengeTemplates[type];
        const challengeId = await this.createChallenge({
          ...template,
          type,
          startDate: Timestamp.fromDate(startOfMonth),
          endDate: Timestamp.fromDate(endOfMonth),
          createdBy: 'system',
          isRecurring: true,
          recurringPattern: 'monthly',
          tags: ['monthly', 'auto_generated', type]
        });
        createdChallenges.push(challengeId);
      }

      console.log(`Generated ${createdChallenges.length} monthly challenges`);
      return createdChallenges;
    } catch (error) {
      console.error('Error generating monthly challenges:', error);
      throw error;
    }
  }

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId: string, userId: string): Promise<void> {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const challenge = await getDoc(challengeRef);
      
      if (!challenge.exists()) {
        throw new Error('Challenge not found');
      }

      const challengeData = challenge.data() as Challenge;
      
      if (challengeData.status !== 'active' && challengeData.status !== 'upcoming') {
        throw new Error('Challenge is not available for joining');
      }

      // Check if user already joined
      const existingParticipation = await getDoc(
        doc(db, 'challengeParticipations', `${challengeId}_${userId}`)
      );

      if (existingParticipation.exists()) {
        throw new Error('User already joined this challenge');
      }

      // Create participation record
      const participation: ChallengeParticipation = {
        challengeId,
        userId,
        currentValue: 0,
        targetValue: challengeData.targetValue,
        progressPercentage: 0,
        position: 0,
        isWinner: false,
        isTop3: false,
        isTop10: false,
        joinedAt: serverTimestamp() as Timestamp,
        lastUpdated: serverTimestamp() as Timestamp,
        rewardsAwarded: { xp: 0 },
        rewardsDistributed: false
      };

      const batch = writeBatch(db);
      
      // Add participation record
      batch.set(
        doc(db, 'challengeParticipations', `${challengeId}_${userId}`),
        participation
      );
      
      // Update challenge participant count
      batch.update(challengeRef, {
        participantCount: increment(1)
      });

      await batch.commit();
      
      console.log(`User ${userId} joined challenge ${challengeId}`);
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  }

  /**
   * Update user progress in a challenge
   */
  async updateChallengeProgress(
    challengeId: string, 
    userId: string, 
    newValue: number
  ): Promise<void> {
    try {
      const participationRef = doc(db, 'challengeParticipations', `${challengeId}_${userId}`);
      const participation = await getDoc(participationRef);
      
      if (!participation.exists()) {
        console.log(`User ${userId} not participating in challenge ${challengeId}`);
        return;
      }

      const participationData = participation.data() as ChallengeParticipation;
      const progressPercentage = Math.min((newValue / participationData.targetValue) * 100, 100);

      await updateDoc(participationRef, {
        currentValue: newValue,
        progressPercentage,
        lastUpdated: serverTimestamp()
      });

      // Update leaderboard position
      await this.updateChallengeLeaderboard(challengeId);
      
      console.log(`Updated challenge progress for user ${userId}: ${newValue}/${participationData.targetValue}`);
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      throw error;
    }
  }

  /**
   * Update challenge leaderboard
   */
  async updateChallengeLeaderboard(challengeId: string): Promise<void> {
    try {
      // Get all participants for this challenge
      const participationsSnapshot = await getDocs(
        query(
          collection(db, 'challengeParticipations'),
          where('challengeId', '==', challengeId),
          orderBy('currentValue', 'desc')
        )
      );

      const participants: ChallengeLeaderboard['participants'] = [];
      const batch = writeBatch(db);

      // Update positions and collect leaderboard data
      participationsSnapshot.docs.forEach((doc, index) => {
        const participation = doc.data() as ChallengeParticipation;
        const position = index + 1;

        // Update participation with new position
        batch.update(doc.ref, {
          position,
          isWinner: position === 1,
          isTop3: position <= 3,
          isTop10: position <= 10
        });

        // Add to leaderboard (we'll need to fetch user data separately)
        participants.push({
          userId: participation.userId,
          displayName: `User ${participation.userId.substring(0, 8)}`, // Placeholder
          currentValue: participation.currentValue,
          position,
          tier: 'standard', // Placeholder
          isVerified: false // Placeholder
        });
      });

      // Update leaderboard document
      const leaderboard: ChallengeLeaderboard = {
        challengeId,
        participants: participants.slice(0, 50), // Top 50 for performance
        lastUpdated: serverTimestamp() as Timestamp
      };

      batch.set(doc(db, 'challengeLeaderboards', challengeId), leaderboard);
      
      await batch.commit();
      
      console.log(`Updated leaderboard for challenge ${challengeId}`);
    } catch (error) {
      console.error('Error updating challenge leaderboard:', error);
      throw error;
    }
  }

  /**
   * Complete a challenge and distribute rewards
   */
  async completeChallenge(challengeId: string): Promise<void> {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const challenge = await getDoc(challengeRef);
      
      if (!challenge.exists()) {
        throw new Error('Challenge not found');
      }

      const challengeData = challenge.data() as Challenge;
      
      // Get all participants
      const participationsSnapshot = await getDocs(
        query(
          collection(db, 'challengeParticipations'),
          where('challengeId', '==', challengeId),
          orderBy('currentValue', 'desc')
        )
      );

      const batch = writeBatch(db);
      let rewardsDistributed = 0;

      // Distribute rewards based on ranking
      participationsSnapshot.docs.forEach((doc, index) => {
        const participation = doc.data() as ChallengeParticipation;
        const position = index + 1;
        let reward: ChallengeReward;

        if (position === 1) {
          reward = challengeData.rewards.winner;
        } else if (position <= 3) {
          reward = challengeData.rewards.top3;
        } else if (position <= 10) {
          reward = challengeData.rewards.top10;
        } else {
          reward = challengeData.rewards.participation;
        }

        // Update participation with rewards
        batch.update(doc.ref, {
          rewardsAwarded: reward,
          rewardsDistributed: true,
          completedAt: serverTimestamp()
        });

        rewardsDistributed++;
      });

      // Update challenge status
      batch.update(challengeRef, {
        status: 'completed',
        completionRate: (rewardsDistributed / challengeData.participantCount) * 100
      });

      await batch.commit();
      
      console.log(`Challenge ${challengeId} completed with ${rewardsDistributed} rewards distributed`);
      
      // Generate analytics
      await this.generateChallengeAnalytics(challengeId);
      
    } catch (error) {
      console.error('Error completing challenge:', error);
      throw error;
    }
  }

  /**
   * Get active challenges
   */
  async getActiveChallenges(): Promise<Challenge[]> {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'challenges'),
          where(SCHEMA_FIELDS.BOOKING.STATUS, '==', 'active'),
          orderBy('endDate', 'asc')
        )
      );

      return snapshot.docs.map(doc => doc.data() as Challenge);
    } catch (error) {
      console.error('Error fetching active challenges:', error);
      throw error;
    }
  }

  /**
   * Get user's challenge participations
   */
  async getUserChallenges(userId: string): Promise<ChallengeParticipation[]> {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'challengeParticipations'),
          where(SCHEMA_FIELDS.NOTIFICATION.USER_ID, '==', userId),
          orderBy('joinedAt', 'desc')
        )
      );

      return snapshot.docs.map(doc => doc.data() as ChallengeParticipation);
    } catch (error) {
      console.error('Error fetching user challenges:', error);
      throw error;
    }
  }

  /**
   * Get challenge leaderboard
   */
  async getChallengeLeaderboard(challengeId: string): Promise<ChallengeLeaderboard | null> {
    try {
      const docRef = doc(db, 'challengeLeaderboards', challengeId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as ChallengeLeaderboard : null;
    } catch (error) {
      console.error('Error fetching challenge leaderboard:', error);
      throw error;
    }
  }

  /**
   * Generate challenge analytics
   */
  async generateChallengeAnalytics(challengeId: string): Promise<ChallengeAnalytics> {
    try {
      // This would typically involve more complex analytics calculations
      // For now, returning basic structure
      
      const analytics: ChallengeAnalytics = {
        challengeId,
        totalParticipants: 0,
        activeParticipants: 0,
        completionRate: 0,
        averageProgress: 0,
        topPerformers: [],
        engagementMetrics: {
          dailyActiveParticipants: 0,
          peakParticipationDay: '',
          dropOffRate: 0
        },
        impactMetrics: {
          xpGenerated: 0,
          badgesAwarded: 0,
          platformActivityIncrease: 0
        }
      };

      // Store analytics
      await setDoc(doc(db, 'challengeAnalytics', challengeId), analytics);
      
      return analytics;
    } catch (error) {
      console.error('Error generating challenge analytics:', error);
      throw error;
    }
  }

  /**
   * Auto-activate upcoming challenges
   */
  async activateUpcomingChallenges(): Promise<void> {
    try {
      const now = Timestamp.now();
      const snapshot = await getDocs(
        query(
          collection(db, 'challenges'),
          where(SCHEMA_FIELDS.BOOKING.STATUS, '==', 'upcoming'),
          where('startDate', '<=', now)
        )
      );

      const batch = writeBatch(db);
      
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { status: 'active' });
      });

      await batch.commit();
      
      console.log(`Activated ${snapshot.size} challenges`);
    } catch (error) {
      console.error('Error activating challenges:', error);
      throw error;
    }
  }

  /**
   * Auto-complete expired challenges
   */
  async completeExpiredChallenges(): Promise<void> {
    try {
      const now = Timestamp.now();
      const snapshot = await getDocs(
        query(
          collection(db, 'challenges'),
          where(SCHEMA_FIELDS.BOOKING.STATUS, '==', 'active'),
          where('endDate', '<=', now)
        )
      );

      for (const doc of snapshot.docs) {
        await this.completeChallenge(doc.id);
      }
      
      console.log(`Completed ${snapshot.size} expired challenges`);
    } catch (error) {
      console.error('Error completing expired challenges:', error);
      throw error;
    }
  }
}

export default ChallengeService;
