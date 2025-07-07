import { xpService, XPEvent } from './xpService';
import { xpValidationService } from './xpValidationService';
import { performanceMonitoringService } from './performanceMonitoringService';
import { badgeService } from './badgeService';

/**
 * Enhanced XP Service with validation, monitoring, and badge integration
 * Wraps core XP service with additional features for production use
 */
export class EnhancedXPService {
  private static instance: EnhancedXPService;

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
}

// Export singleton instance
export const enhancedXPService = EnhancedXPService.getInstance();
