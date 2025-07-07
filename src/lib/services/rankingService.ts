/**
 * Ranking Service for AuditoryX Gamification System
 * Integrates XP, verification status, and performance metrics for creator discovery
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { enhancedXPService } from './enhancedXPService';
import { verificationService } from './verificationService';

interface UserRankingData {
  userId: string;
  // XP metrics
  totalXP: number;
  weeklyXP: number;
  xpGrowthRate: number;
  lastXPEarned?: Timestamp;
  
  // Verification & tier status
  isVerified: boolean;
  tier: 'new' | 'verified' | 'signature';
  verificationDate?: Timestamp;
  
  // Performance metrics
  averageRating: number;
  completedBookings: number;
  responseTime: number; // Average response time in hours
  cancellationRate: number;
  
  // Engagement metrics
  profileViews: number;
  searchAppearances: number;
  conversionRate: number;
  
  // Calculated ranking score
  rankingScore: number;
  lastUpdated: Timestamp;
}

interface RankingWeights {
  xp: number;
  verification: number;
  tier: number;
  performance: number;
  engagement: number;
  recency: number;
}

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  profileImage?: string;
  score: number;
  rank: number;
  tier: string;
  isVerified: boolean;
  totalXP: number;
  weeklyXP?: number;
  badge?: string; // Special badge for top performers
}

class RankingService {
  private static instance: RankingService;
  
  // Ranking formula weights (can be A/B tested)
  private weights: RankingWeights = {
    xp: 0.4,
    verification: 0.15,
    tier: 0.1,
    performance: 0.25,
    engagement: 0.05,
    recency: 0.05
  };

  private tierMultipliers = {
    new: 1.0,
    verified: 1.25,
    signature: 1.5
  };

  private constructor() {}

  static getInstance(): RankingService {
    if (!RankingService.instance) {
      RankingService.instance = new RankingService();
    }
    return RankingService.instance;
  }

  /**
   * Calculate comprehensive ranking score for a user
   */
  async calculateUserRankingScore(userId: string): Promise<number> {
    try {
      // Gather all ranking data
      const [xpData, verificationData, performanceData, engagementData] = await Promise.all([
        this.getXPData(userId),
        this.getVerificationData(userId),
        this.getPerformanceData(userId),
        this.getEngagementData(userId)
      ]);

      // Calculate individual scores
      const xpScore = this.calculateXPScore(xpData);
      const verificationScore = this.calculateVerificationScore(verificationData);
      const tierScore = this.calculateTierScore(verificationData.tier);
      const performanceScore = this.calculatePerformanceScore(performanceData);
      const engagementScore = this.calculateEngagementScore(engagementData);
      const recencyScore = this.calculateRecencyScore(xpData.lastXPEarned);

      // Apply weights and calculate final score
      const finalScore = 
        (xpScore * this.weights.xp) +
        (verificationScore * this.weights.verification) +
        (tierScore * this.weights.tier) +
        (performanceScore * this.weights.performance) +
        (engagementScore * this.weights.engagement) +
        (recencyScore * this.weights.recency);

      return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Error calculating ranking score:', error);
      return 0;
    }
  }

  /**
   * Calculate XP-based score with logarithmic scaling to prevent dominance
   */
  private calculateXPScore(xpData: { totalXP: number; weeklyXP: number; xpGrowthRate: number }): number {
    const { totalXP, weeklyXP, xpGrowthRate } = xpData;
    
    // Logarithmic scaling for total XP (prevents high-XP users from dominating)
    const totalXPScore = Math.log(totalXP + 1) * 15;
    
    // Recent activity bonus (weekly XP)
    const weeklyXPScore = Math.min(weeklyXP * 0.5, 50); // Cap at 50 points
    
    // Growth rate bonus (encourages consistent activity)
    const growthScore = Math.min(xpGrowthRate * 10, 25); // Cap at 25 points
    
    return totalXPScore + weeklyXPScore + growthScore;
  }

  /**
   * Calculate verification status score
   */
  private calculateVerificationScore(verificationData: { isVerified: boolean; verificationDate?: Timestamp }): number {
    if (!verificationData.isVerified) return 0;
    
    // Base verification bonus
    let score = 25;
    
    // Recency bonus for recently verified users (within 30 days)
    if (verificationData.verificationDate) {
      const daysSinceVerification = (Date.now() - verificationData.verificationDate.toMillis()) / (1000 * 60 * 60 * 24);
      if (daysSinceVerification <= 30) {
        score += 10; // New verification boost
      }
    }
    
    return score;
  }

  /**
   * Calculate tier-based score multiplier
   */
  private calculateTierScore(tier: string): number {
    const multiplier = this.tierMultipliers[tier as keyof typeof this.tierMultipliers] || 1.0;
    return (multiplier - 1.0) * 50; // Convert multiplier to additive score
  }

  /**
   * Calculate performance-based score
   */
  private calculatePerformanceScore(performanceData: {
    averageRating: number;
    completedBookings: number;
    responseTime: number;
    cancellationRate: number;
  }): number {
    const { averageRating, completedBookings, responseTime, cancellationRate } = performanceData;
    
    // Rating score (0-50 points)
    const ratingScore = (averageRating - 3.0) * 25; // 3.0 = neutral, 5.0 = max 50 points
    
    // Booking count score with diminishing returns
    const bookingScore = Math.min(Math.log(completedBookings + 1) * 10, 30);
    
    // Response time score (faster = better)
    const responseScore = Math.max(20 - responseTime, 0); // 20 points for instant, decreases
    
    // Cancellation penalty
    const cancellationPenalty = cancellationRate * -30; // Up to -30 points for 100% cancellation
    
    return Math.max(ratingScore + bookingScore + responseScore + cancellationPenalty, 0);
  }

  /**
   * Calculate engagement-based score
   */
  private calculateEngagementScore(engagementData: {
    profileViews: number;
    searchAppearances: number;
    conversionRate: number;
  }): number {
    const { profileViews, searchAppearances, conversionRate } = engagementData;
    
    // Profile view score with logarithmic scaling
    const viewScore = Math.min(Math.log(profileViews + 1) * 5, 20);
    
    // Search appearance score
    const searchScore = Math.min(Math.log(searchAppearances + 1) * 3, 15);
    
    // Conversion rate bonus
    const conversionScore = conversionRate * 15; // Up to 15 points for 100% conversion
    
    return viewScore + searchScore + conversionScore;
  }

  /**
   * Calculate recency score based on last XP earned
   */
  private calculateRecencyScore(lastXPEarned?: Timestamp): number {
    if (!lastXPEarned) return 0;
    
    const daysSinceLastActivity = (Date.now() - lastXPEarned.toMillis()) / (1000 * 60 * 60 * 24);
    
    // Full score for activity within 7 days, decreasing to 0 over 30 days
    if (daysSinceLastActivity <= 7) return 10;
    if (daysSinceLastActivity <= 30) return 10 * (1 - (daysSinceLastActivity - 7) / 23);
    return 0;
  }

  /**
   * Get XP data for ranking calculation
   */
  private async getXPData(userId: string): Promise<{ totalXP: number; weeklyXP: number; xpGrowthRate: number; lastXPEarned?: Timestamp }> {
    try {
      const userProgress = await enhancedXPService.getUserProgress(userId);
      const xpHistory = await enhancedXPService.getXPHistory(userId, 30); // Last 30 days
      
      // Calculate weekly XP
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyXP = xpHistory
        .filter(entry => entry.timestamp.toMillis() >= weekAgo.getTime())
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      // Calculate growth rate (XP per day over last week)
      const xpGrowthRate = weeklyXP / 7;
      
      // Find last XP earned timestamp
      const lastXPEarned = xpHistory.length > 0 ? xpHistory[0].timestamp : undefined;
      
      return {
        totalXP: userProgress?.totalXP || 0,
        weeklyXP,
        xpGrowthRate,
        lastXPEarned
      };
    } catch (error) {
      console.error('Error getting XP data:', error);
      return { totalXP: 0, weeklyXP: 0, xpGrowthRate: 0 };
    }
  }

  /**
   * Get verification data for ranking calculation
   */
  private async getVerificationData(userId: string): Promise<{ isVerified: boolean; tier: string; verificationDate?: Timestamp }> {
    try {
      const status = await verificationService.getUserVerificationStatus(userId);
      
      return {
        isVerified: status.isVerified,
        tier: status.currentTier || 'new',
        verificationDate: status.currentApplication?.reviewedAt
      };
    } catch (error) {
      console.error('Error getting verification data:', error);
      return { isVerified: false, tier: 'new' };
    }
  }

  /**
   * Get performance data for ranking calculation
   */
  private async getPerformanceData(userId: string): Promise<{
    averageRating: number;
    completedBookings: number;
    responseTime: number;
    cancellationRate: number;
  }> {
    try {
      // Query user's booking and review data
      const [bookingsSnapshot, reviewsSnapshot] = await Promise.all([
        getDocs(query(
          collection(db, 'bookings'),
          where('creatorId', '==', userId),
          where('status', '==', 'completed'),
          orderBy('completedAt', 'desc'),
          limit(50) // Last 50 bookings for performance calculation
        )),
        getDocs(query(
          collection(db, 'reviews'),
          where('creatorId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(50) // Last 50 reviews
        ))
      ]);

      const bookings = bookingsSnapshot.docs.map(doc => doc.data());
      const reviews = reviewsSnapshot.docs.map(doc => doc.data());

      // Calculate metrics
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 3.0; // Default neutral rating

      const completedBookings = bookings.length;

      // Calculate average response time
      const responseTimes = bookings
        .filter(booking => booking.firstResponseAt && booking.createdAt)
        .map(booking => {
          const responseTime = (booking.firstResponseAt.toMillis() - booking.createdAt.toMillis()) / (1000 * 60 * 60);
          return responseTime;
        });
      
      const responseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 24; // Default 24 hours

      // Calculate cancellation rate
      const totalBookings = await getDocs(query(
        collection(db, 'bookings'),
        where('creatorId', '==', userId)
      ));
      
      const cancelledBookings = await getDocs(query(
        collection(db, 'bookings'),
        where('creatorId', '==', userId),
        where('status', '==', 'cancelled')
      ));

      const cancellationRate = totalBookings.size > 0 
        ? cancelledBookings.size / totalBookings.size 
        : 0;

      return {
        averageRating,
        completedBookings,
        responseTime,
        cancellationRate
      };
    } catch (error) {
      console.error('Error getting performance data:', error);
      return {
        averageRating: 3.0,
        completedBookings: 0,
        responseTime: 24,
        cancellationRate: 0
      };
    }
  }

  /**
   * Get engagement data for ranking calculation
   */
  private async getEngagementData(userId: string): Promise<{
    profileViews: number;
    searchAppearances: number;
    conversionRate: number;
  }> {
    try {
      // Query analytics data (placeholder - would integrate with actual analytics)
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      return {
        profileViews: userData?.analytics?.profileViews || 0,
        searchAppearances: userData?.analytics?.searchAppearances || 0,
        conversionRate: userData?.analytics?.conversionRate || 0
      };
    } catch (error) {
      console.error('Error getting engagement data:', error);
      return {
        profileViews: 0,
        searchAppearances: 0,
        conversionRate: 0
      };
    }
  }

  /**
   * Update ranking scores for all users (batch operation)
   */
  async updateAllRankingScores(): Promise<void> {
    try {
      console.log('Starting batch ranking score update...');
      
      // Get all users with XP
      const usersSnapshot = await getDocs(query(
        collection(db, 'userProgress'),
        where('totalXP', '>', 0)
      ));

      const batchSize = 20; // Process in batches to avoid timeout
      const users = usersSnapshot.docs.map(doc => doc.id);
      
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        await this.processBatchRankingUpdate(batch);
        console.log(`Processed ${Math.min(i + batchSize, users.length)} of ${users.length} users`);
      }

      console.log('Batch ranking score update completed');
    } catch (error) {
      console.error('Error updating ranking scores:', error);
      throw error;
    }
  }

  /**
   * Process a batch of users for ranking score updates
   */
  private async processBatchRankingUpdate(userIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    
    for (const userId of userIds) {
      try {
        const rankingScore = await this.calculateUserRankingScore(userId);
        
        const rankingRef = doc(db, 'userRankings', userId);
        batch.set(rankingRef, {
          userId,
          rankingScore,
          lastUpdated: Timestamp.now()
        }, { merge: true });
      } catch (error) {
        console.error(`Error calculating score for user ${userId}:`, error);
      }
    }
    
    await batch.commit();
  }

  /**
   * Get leaderboard for a specific category
   */
  async getLeaderboard(
    category: 'global' | 'weekly' | 'verified' | 'new' = 'global',
    limit_count: number = 50
  ): Promise<LeaderboardEntry[]> {
    try {
      let baseQuery = query(
        collection(db, 'userRankings'),
        orderBy('rankingScore', 'desc'),
        limit(limit_count)
      );

      // Add category-specific filters
      if (category === 'verified') {
        // This would need a composite index
        // For now, we'll filter in memory
      }

      const snapshot = await getDocs(baseQuery);
      const rankings = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          userId: data.userId,
          displayName: data.displayName || 'Anonymous',
          profileImage: data.profileImage,
          score: data.rankingScore,
          rank: index + 1,
          tier: data.tier || 'new',
          isVerified: data.isVerified || false,
          totalXP: data.totalXP || 0,
          weeklyXP: data.weeklyXP,
          badge: this.getLeaderboardBadge(index + 1)
        };
      });

      return rankings;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  /**
   * Get special badge for leaderboard position
   */
  private getLeaderboardBadge(rank: number): string | undefined {
    if (rank === 1) return '👑'; // Crown for #1
    if (rank === 2) return '🥈'; // Silver for #2
    if (rank === 3) return '🥉'; // Bronze for #3
    if (rank <= 10) return '⭐'; // Star for top 10
    return undefined;
  }

  /**
   * Get user's current ranking position
   */
  async getUserRanking(userId: string): Promise<{ rank: number; score: number; totalUsers: number } | null> {
    try {
      const userRankingDoc = await getDoc(doc(db, 'userRankings', userId));
      if (!userRankingDoc.exists()) return null;

      const userScore = userRankingDoc.data().rankingScore;

      // Count users with higher scores
      const higherScoresSnapshot = await getDocs(query(
        collection(db, 'userRankings'),
        where('rankingScore', '>', userScore)
      ));

      // Count total ranked users
      const totalUsersSnapshot = await getDocs(collection(db, 'userRankings'));

      return {
        rank: higherScoresSnapshot.size + 1,
        score: userScore,
        totalUsers: totalUsersSnapshot.size
      };
    } catch (error) {
      console.error('Error getting user ranking:', error);
      return null;
    }
  }

  /**
   * Update ranking weights for A/B testing
   */
  updateRankingWeights(newWeights: Partial<RankingWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
    console.log('Updated ranking weights:', this.weights);
  }

  /**
   * Get current ranking weights
   */
  getRankingWeights(): RankingWeights {
    return { ...this.weights };
  }
}

export const rankingService = RankingService.getInstance();
export type { UserRankingData, LeaderboardEntry, RankingWeights };
