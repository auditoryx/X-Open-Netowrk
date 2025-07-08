import { xpService, XPEvent } from './xpService';
import { xpValidationService } from './xpValidationService';
import { performanceMonitoringService } from './performanceMonitoringService';
import { badgeService } from './badgeService';
import { verificationService } from './verificationService';
import ChallengeService from './challengeService';

/**
 * Enhanced XP Service with validation, monitoring, badge integration, and challenge tracking
 * Wraps core XP service with additional features for production use
 */
export class EnhancedXPService {
  private static instance: EnhancedXPService;
  private challengeService: ChallengeService;

  constructor() {
    this.challengeService = ChallengeService.getInstance();
  }

  static getInstance(): EnhancedXPService {
    if (!EnhancedXPService.instance) {
      EnhancedXPService.instance = new EnhancedXPService();
    }
    return EnhancedXPService.instance;
  }

  /**
   * Award XP with validation, monitoring, and badge checking
   */
  async awardXP(
    userId: string,
    event: XPEvent,
    options: {
      contextId?: string;
      metadata?: Record<string, any>;
      skipDuplicateCheck?: boolean;
      skipValidation?: boolean; // For admin operations
    } = {}
  ): Promise<{
    success: boolean;
    xpAwarded: number;
    dailyCapReached: boolean;
    message: string;
    validationBypass?: boolean;
    badges?: string[];
  }> {
    return await performanceMonitoringService.measureXPOperation(
      'enhanced_xp_award',
      async () => {
        // Skip validation for admin operations or if explicitly requested
        if (!options.skipValidation) {
          const validationResult = await performanceMonitoringService.measureValidation(
            'xp_validation',
            () => xpValidationService.validateXPAward(userId, event, options.contextId),
            userId
          );

          if (!validationResult.isValid) {
            return {
              success: false,
              xpAwarded: 0,
              dailyCapReached: false,
              message: validationResult.reason || 'Validation failed'
            };
          }
        }

        // Award XP using core service
        const result = await xpService.awardXP(userId, event, options);

        // Check and award badges after successful XP award
        if (result.success && result.xpAwarded > 0) {
          try {
            const badgeResult = await badgeService.checkAndAwardBadges(
              userId,
              event,
              { ...options.metadata, xpAwarded: result.xpAwarded }
            );

            // Auto-trigger verification application if user might be eligible
            try {
              await verificationService.autoTriggerApplication(userId);
            } catch (verificationError) {
              console.error('Error auto-triggering verification:', verificationError);
              // Don't fail the XP award if verification check fails
            }

            // Update challenge progress after successful XP award
            try {
              await this.updateChallengeProgress(userId, event, result.xpAwarded, options);
            } catch (challengeError) {
              console.error('Error updating challenge progress:', challengeError);
              // Don't fail the XP award if challenge update fails
            }

            if (badgeResult.success && badgeResult.badgesAwarded.length > 0) {
              // Trigger badge notification event for UI
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('badges-awarded', {
                  detail: {
                    userId,
                    badges: badgeResult.badgesAwarded,
                    event
                  }
                }));
              }

              return {
                ...result,
                badges: badgeResult.badgesAwarded
              };
            }
          } catch (error) {
            console.error('Error checking badges after XP award:', error);
            // Don't fail the XP award if badge checking fails
          }
        }

        return {
          ...result,
          validationBypass: options.skipValidation || false
        };
      },
      userId,
      { event, contextId: options.contextId, skipValidation: options.skipValidation }
    );
  }

  /**
   * Get user progress with performance monitoring
   */
  async getUserProgress(userId: string) {
    return await performanceMonitoringService.measureXPOperation(
      'get_user_progress',
      () => xpService.getUserProgress(userId),
      userId
    );
  }

  /**
   * Get user XP history with performance monitoring
   */
  async getUserXPHistory(userId: string, limit?: number) {
    return await performanceMonitoringService.measureXPOperation(
      'get_user_xp_history',
      () => xpService.getUserXPHistory(userId, limit),
      userId
    );
  }

  /**
   * Admin XP adjustment with validation bypass
   */
  async adminAdjustXP(userId: string, xpChange: number, reason: string, adminId: string) {
    return await performanceMonitoringService.measureXPOperation(
      'admin_xp_adjustment',
      () => xpService.adminAdjustXP(userId, xpChange, reason, adminId),
      userId,
      { adminId, xpChange, reason }
    );
  }

  /**
   * Get leaderboard with performance monitoring
   */
  async getLeaderboard(limit?: number) {
    return await performanceMonitoringService.measureXPOperation(
      'get_leaderboard',
      () => xpService.getLeaderboard(limit)
    );
  }

  /**
   * Get validation alerts for admin dashboard
   */
  async getValidationAlerts(limit?: number) {
    return await xpValidationService.getValidationAlerts(limit);
  }

  /**
   * Resolve validation alert
   */
  async resolveValidationAlert(alertId: string, adminId: string) {
    return await xpValidationService.resolveAlert(alertId, adminId);
  }

  /**
   * Get user behavior analysis
   */
  async getUserBehaviorAnalysis(userId: string) {
    return await xpValidationService.getUserBehaviorSummary(userId);
  }

  /**
   * Get performance statistics
   */
  async getPerformanceStats(timeframeHours?: number) {
    return await performanceMonitoringService.getPerformanceStats(timeframeHours);
  }

  /**
   * Perform system health check
   */
  async performHealthCheck() {
    return await performanceMonitoringService.performHealthCheck();
  }

  /**
   * Get slow operations for optimization
   */
  async getSlowOperations(limit?: number) {
    return await performanceMonitoringService.getSlowOperations(limit);
  }

  /**
   * Test booking data integration
   * This method validates XP tracking with real booking data
   */
  async testWithRealBookingData(userId: string, bookingId: string): Promise<{
    success: boolean;
    xpAwarded: number;
    validationPassed: boolean;
    performanceMs: number;
  }> {
    const startTime = Date.now();
    
    try {
      // Simulate real booking completion
      const result = await this.awardXP(userId, 'bookingCompleted', {
        contextId: `booking-${bookingId}`,
        metadata: {
          bookingId,
          testMode: true,
          timestamp: new Date().toISOString()
        }
      });

      const performanceMs = Date.now() - startTime;

      return {
        success: result.success,
        xpAwarded: result.xpAwarded,
        validationPassed: !result.validationBypass,
        performanceMs
      };
    } catch (error) {
      console.error('Error testing with real booking data:', error);
      return {
        success: false,
        xpAwarded: 0,
        validationPassed: false,
        performanceMs: Date.now() - startTime
      };
    }
  }

  /**
   * Get user verification status
   */
  async getUserVerificationStatus(userId: string) {
    return await performanceMonitoringService.measureXPOperation(
      'get_verification_status',
      () => verificationService.getUserVerificationStatus(userId),
      userId
    );
  }

  /**
   * Check verification eligibility
   */
  async checkVerificationEligibility(userId: string) {
    return await performanceMonitoringService.measureXPOperation(
      'check_verification_eligibility',
      () => verificationService.checkEligibility(userId),
      userId
    );
  }

  /**
   * Get verification statistics for admin
   */
  async getVerificationStatistics() {
    return await verificationService.getVerificationStatistics();
  }

  /**
   * Update challenge progress based on XP event
   * This method automatically updates relevant challenge metrics when users earn XP
   */
  private async updateChallengeProgress(
    userId: string, 
    event: XPEvent, 
    xpAwarded: number, 
    options: { contextId?: string; metadata?: Record<string, any> } = {}
  ): Promise<void> {
    try {
      // Get user's active challenge participations
      const userChallenges = await this.challengeService.getUserChallenges(userId);
      
      // Filter to only active challenges (not completed)
      const activeChallenges = userChallenges.filter(participation => {
        // We'd need to check challenge status, but for now assume active
        return !participation.completedAt;
      });

      // Update relevant challenges based on the XP event
      for (const participation of activeChallenges) {
        let shouldUpdate = false;
        let newValue = participation.currentValue;

        // Get the challenge details to determine what metric to track
        // For now, we'll implement common challenge types
        
        // XP Race challenges - track total XP gained in the challenge period
        if (event === 'bookingCompleted' || event === 'fiveStarReview' || event === 'referralSignup' || event === 'profileCompleted') {
          // For XP race challenges, increment by XP awarded
          newValue = participation.currentValue + xpAwarded;
          shouldUpdate = true;
        }

        // Project completion challenges
        if (event === 'bookingCompleted') {
          // For project completion challenges, increment by 1 project
          newValue = participation.currentValue + 1;
          shouldUpdate = true;
        }

        // Five-star streak challenges
        if (event === 'fiveStarReview') {
          // For five-star streak challenges, increment streak
          newValue = participation.currentValue + 1;
          shouldUpdate = true;
        }

        // Referral challenges
        if (event === 'referralSignup' || event === 'referralFirstBooking') {
          // For referral challenges, increment successful referrals
          newValue = participation.currentValue + 1;
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          await this.challengeService.updateChallengeProgress(
            participation.challengeId,
            userId,
            newValue
          );
        }
      }
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      // Don't throw - this is a background operation that shouldn't fail the main XP award
    }
  }

  /**
   * Force update all challenge progress for a user
   * Useful for recalculating progress after data corrections
   */
  async recalculateUserChallengeProgress(userId: string): Promise<void> {
    try {
      const userProgress = await this.getUserProgress(userId);
      const userChallenges = await this.challengeService.getUserChallenges(userId);
      
      // For each active challenge, recalculate progress based on current user data
      for (const participation of userChallenges) {
        if (participation.completedAt) continue; // Skip completed challenges

        // This would need to be implemented based on challenge type and metrics
        // For now, we'll leave this as a placeholder for future enhancement
        console.log(`Recalculating progress for challenge ${participation.challengeId}`);
      }
    } catch (error) {
      console.error('Error recalculating challenge progress:', error);
      throw error;
    }
  }

  /**
   * Get user's challenge statistics
   */
  async getUserChallengeStats(userId: string): Promise<{
    totalChallengesJoined: number;
    activeChallenges: number;
    completedChallenges: number;
    totalXPFromChallenges: number;
    bestPosition: number | null;
    winCount: number;
  }> {
    try {
      const userChallenges = await this.challengeService.getUserChallenges(userId);
      
      const activeChallenges = userChallenges.filter(p => !p.completedAt).length;
      const completedChallenges = userChallenges.filter(p => p.completedAt).length;
      const totalXPFromChallenges = userChallenges.reduce((sum, p) => sum + (p.rewardsAwarded?.xp || 0), 0);
      const positions = userChallenges.map(p => p.position).filter(p => p > 0);
      const bestPosition = positions.length > 0 ? Math.min(...positions) : null;
      const winCount = userChallenges.filter(p => p.isWinner).length;

      return {
        totalChallengesJoined: userChallenges.length,
        activeChallenges,
        completedChallenges,
        totalXPFromChallenges,
        bestPosition,
        winCount
      };
    } catch (error) {
      console.error('Error getting user challenge stats:', error);
      return {
        totalChallengesJoined: 0,
        activeChallenges: 0,
        completedChallenges: 0,
        totalXPFromChallenges: 0,
        bestPosition: null,
        winCount: 0
      };
    }
  }

  /**
   * Admin method to manage challenge lifecycle
   */
  async adminManageChallenges(): Promise<{
    activated: number;
    completed: number;
    generated: number;
  }> {
    try {
      // Activate upcoming challenges that should be active
      await this.challengeService.activateUpcomingChallenges();
      
      // Complete expired challenges
      await this.challengeService.completeExpiredChallenges();
      
      // Generate monthly challenges if needed
      const newChallenges = await this.challengeService.generateMonthlyCharlenges();

      return {
        activated: 0, // Would need to track this
        completed: 0, // Would need to track this
        generated: newChallenges.length
      };
    } catch (error) {
      console.error('Error managing challenges:', error);
      throw error;
    }
  }

  /**
   * Update challenge progress with specific metrics
   */
  async updateSpecificChallengeProgress(
    userId: string,
    challengeType: string,
    value: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const userChallenges = await this.challengeService.getUserChallenges(userId);
      
      for (const participation of userChallenges) {
        if (participation.completedAt) continue;
        
        // Get challenge details to check type
        // This would require extending the challenge service to get individual challenges
        // For now, we'll update based on the challenge type pattern matching
        
        if (challengeType === 'project_completion' && participation.challengeId.includes('project')) {
          await this.challengeService.updateChallengeProgress(
            participation.challengeId,
            userId,
            value
          );
        } else if (challengeType === 'xp_race' && participation.challengeId.includes('xp')) {
          await this.challengeService.updateChallengeProgress(
            participation.challengeId,
            userId,
            participation.currentValue + value
          );
        }
        // Add more challenge type mappings as needed
      }
    } catch (error) {
      console.error('Error updating specific challenge progress:', error);
    }
  }

}

// Export singleton instance
export const enhancedXPService = EnhancedXPService.getInstance();
