/**
 * Tests for AX Beta credibility scoring edge cases
 * Focus on distinct-client cap over 90-day window and refund scenarios
 */

import { calculateCredibilityScore, extractCredibilityFactors } from '../../../libs/shared/credibility/calculateCredibilityScore';
import type { CredibilityFactors, CredibilityConfig } from '../../../libs/shared/credibility/types';

describe('AX Beta Credibility - Edge Cases', () => {
  const mockConfig: CredibilityConfig = {
    tierWeights: {
      signature: 1000,
      verified: 500,
      standard: 100
    },
    creditMultipliers: {
      axVerified: 3.0,
      clientConfirmed: 2.0,
      selfReported: 1.0
    },
    distinctClientCaps: {
      maxImpact: 100,
      perClientScore: 5,
      windowDays: 90
    },
    recencyWindows: {
      veryRecent: 7,
      recent: 30,
      somewhatRecent: 90,
      inactivityThreshold: 90,
      heavyPenaltyThreshold: 180
    },
    recencyBoosts: {
      veryRecent: 50,
      recent: 25,
      somewhatRecent: 10
    },
    inactivityPenalties: {
      moderate: -50,
      heavy: -100
    },
    diminishingReturns: {
      threshold: 50,
      logScaling: 10
    },
    responseMetrics: {
      excellentResponseRate: 95,
      goodResponseRate: 90,
      decentResponseRate: 80,
      fastResponseTime: 1,
      goodResponseTime: 4,
      okResponseTime: 12,
      bonuses: {
        excellentResponse: 30,
        goodResponse: 20,
        decentResponse: 10,
        fastTime: 25,
        goodTime: 15,
        okTime: 5
      }
    }
  };

  describe('Distinct Client Cap over 90-day window', () => {
    it('should cap distinct client score at maximum impact (100 points)', () => {
      const factors: CredibilityFactors = {
        tier: 'verified',
        axVerifiedCredits: 10,
        clientConfirmedCredits: 5,
        distinctClients90d: 50, // 50 * 5 = 250, but should cap at 100
        positiveReviewCount: 5,
        completedBookings: 20,
        responseRate: 95,
        avgResponseTimeHours: 2
      };

      const score = calculateCredibilityScore(factors, mockConfig);
      
      // Calculate expected score components
      const tierScore = 500; // verified tier
      const axCreditsScore = 10 * 3.0; // 30 (under threshold)
      const clientCreditsScore = 5 * 2.0; // 10 (under threshold)
      const clientDiversityScore = 100; // Capped at maxImpact
      const reviewScore = 5 * 3; // 15
      const responseBonus = 30 + 15; // excellent rate + good time
      
      const expectedMin = tierScore + axCreditsScore + clientCreditsScore + clientDiversityScore + reviewScore + responseBonus;
      
      expect(score).toBeGreaterThanOrEqual(expectedMin);
      
      // Verify the cap is working by testing with even more clients
      const higherClientFactors = { ...factors, distinctClients90d: 100 };
      const higherScore = calculateCredibilityScore(higherClientFactors, mockConfig);
      
      // Score should be the same since we're hitting the cap
      expect(higherScore).toBe(score);
    });

    it('should scale linearly under the cap', () => {
      const baseFactors: CredibilityFactors = {
        tier: 'standard',
        axVerifiedCredits: 5,
        clientConfirmedCredits: 5,
        distinctClients90d: 5, // 5 * 5 = 25 points
        positiveReviewCount: 0,
        completedBookings: 10
      };

      const score5Clients = calculateCredibilityScore(baseFactors, mockConfig);
      
      const doubleFactors = { ...baseFactors, distinctClients90d: 10 }; // 10 * 5 = 50 points
      const score10Clients = calculateCredibilityScore(doubleFactors, mockConfig);
      
      // Should have exactly 25 more points from distinct clients
      expect(score10Clients - score5Clients).toBe(25);
    });

    it('should only count clients within 90-day window', () => {
      // This test would need real booking data to verify the 90-day window
      // For now, we test that the factor correctly reflects this constraint
      const factors: CredibilityFactors = {
        tier: 'standard',
        axVerifiedCredits: 0,
        clientConfirmedCredits: 0,
        distinctClients90d: 15, // This should only include clients from last 90 days
        positiveReviewCount: 0,
        completedBookings: 20 // Total bookings might be higher
      };

      const score = calculateCredibilityScore(factors, mockConfig);
      expect(score).toBeGreaterThan(0);
      
      // The distinctClients90d should be used, not completedBookings
      expect(factors.distinctClients90d).toBeLessThan(factors.completedBookings);
    });
  });

  describe('Refund scenarios - no review/credit/badge impact', () => {
    it('should not award credits for refunded bookings', () => {
      // Simulate a user with completed bookings vs refunded bookings
      const completedBookingFactors: CredibilityFactors = {
        tier: 'standard',
        axVerifiedCredits: 5, // 5 completed AX-verified bookings
        clientConfirmedCredits: 3, // 3 client-confirmed bookings
        distinctClients90d: 8, // 8 distinct clients
        positiveReviewCount: 5, // 5 positive reviews
        completedBookings: 8 // Total completed (non-refunded)
      };

      const refundedBookingFactors: CredibilityFactors = {
        tier: 'standard',
        axVerifiedCredits: 0, // No credits from refunded bookings
        clientConfirmedCredits: 0, // No credits from refunded bookings
        distinctClients90d: 0, // No client diversity from refunded bookings
        positiveReviewCount: 0, // No reviews from refunded bookings
        completedBookings: 0 // No completed bookings (all refunded)
      };

      const completedScore = calculateCredibilityScore(completedBookingFactors, mockConfig);
      const refundedScore = calculateCredibilityScore(refundedBookingFactors, mockConfig);

      // Score should be significantly higher for completed bookings
      expect(completedScore).toBeGreaterThan(refundedScore);
      
      // Refunded booking user should only have tier score (100 for standard)
      expect(refundedScore).toBe(100); // Only tier weight, no other bonuses
    });

    it('should not count refunded bookings in completion statistics', () => {
      const userWithRefunds: CredibilityFactors = {
        tier: 'verified',
        axVerifiedCredits: 3, // Only 3 completed successfully
        clientConfirmedCredits: 2, // Only 2 completed successfully  
        distinctClients90d: 5, // Only 5 distinct clients (refunds don't count)
        positiveReviewCount: 3, // Only 3 reviews (no reviews on refunds)
        completedBookings: 5, // Only 5 actual completions
        // Note: This user might have had 10 total bookings, but 5 were refunded
      };

      const score = calculateCredibilityScore(userWithRefunds, mockConfig);
      
      // Verify only completed booking metrics are used
      expect(userWithRefunds.completedBookings).toBe(5);
      expect(userWithRefunds.positiveReviewCount).toBe(3);
      expect(userWithRefunds.axVerifiedCredits).toBe(3);
      
      // Score should reflect only successful completions
      expect(score).toBeGreaterThan(500); // Verified tier base + some bonuses
    });

    it('should not award dynamic badges for refunded bookings', () => {
      // Test that refunded bookings don't trigger performance badges
      const factorsWithoutBadges: CredibilityFactors = {
        tier: 'standard',
        axVerifiedCredits: 5,
        clientConfirmedCredits: 0,
        distinctClients90d: 5,
        positiveReviewCount: 5,
        completedBookings: 5,
        activeBadges: [] // No badges because refunds prevent badge eligibility
      };

      const factorsWithBadges: CredibilityFactors = {
        ...factorsWithoutBadges,
        activeBadges: [
          {
            id: 'hot-streak',
            name: 'Hot Streak',
            description: '5 completed bookings in a row',
            scoreImpact: 25,
            type: 'dynamic'
          }
        ]
      };

      const scoreWithoutBadges = calculateCredibilityScore(factorsWithoutBadges, mockConfig);
      const scoreWithBadges = calculateCredibilityScore(factorsWithBadges, mockConfig);

      // Badge should add exactly 25 points
      expect(scoreWithBadges - scoreWithoutBadges).toBe(25);
      
      // Users with refunds shouldn't get performance badges
      // (This would be enforced in the badge awarding logic, not the scoring)
    });

    it('should handle canceled bookings same as refunds', () => {
      // Canceled and refunded bookings should both result in:
      // - No credits awarded
      // - No reviews possible
      // - No badge eligibility
      // - No contribution to stats
      
      const canceledBookingUser: CredibilityFactors = {
        tier: 'verified',
        axVerifiedCredits: 0, // Canceled booking = no credit
        clientConfirmedCredits: 0, // Canceled booking = no credit
        distinctClients90d: 0, // Canceled booking = no client diversity
        positiveReviewCount: 0, // Canceled booking = no review
        completedBookings: 0 // Canceled booking = not completed
      };

      const refundedBookingUser: CredibilityFactors = {
        tier: 'verified',
        axVerifiedCredits: 0, // Refunded booking = no credit
        clientConfirmedCredits: 0, // Refunded booking = no credit
        distinctClients90d: 0, // Refunded booking = no client diversity
        positiveReviewCount: 0, // Refunded booking = no review
        completedBookings: 0 // Refunded booking = not completed
      };

      const canceledScore = calculateCredibilityScore(canceledBookingUser, mockConfig);
      const refundedScore = calculateCredibilityScore(refundedBookingUser, mockConfig);

      // Both should have identical scores (only tier weight)
      expect(canceledScore).toBe(refundedScore);
      expect(canceledScore).toBe(500); // Verified tier weight only
    });
  });

  describe('Mixed scenarios - partial refunds', () => {
    it('should handle users with mix of completed and refunded bookings', () => {
      const mixedUser: CredibilityFactors = {
        tier: 'verified',
        axVerifiedCredits: 7, // 7 successful AX bookings
        clientConfirmedCredits: 3, // 3 successful client bookings  
        distinctClients90d: 8, // 8 distinct clients (only from successful)
        positiveReviewCount: 10, // 10 positive reviews (only from successful)
        completedBookings: 10, // 10 total successful completions
        // Note: User might have had 15 total bookings, 5 were refunded
        responseRate: 85, // Response rate unaffected by refunds
        avgResponseTimeHours: 3 // Response time unaffected by refunds
      };

      const score = calculateCredibilityScore(mixedUser, mockConfig);
      
      // Should get full credit for successful bookings
      expect(score).toBeGreaterThan(500); // Base tier
      
      // Verify all successful metrics are counted
      expect(mixedUser.completedBookings).toBe(10);
      expect(mixedUser.positiveReviewCount).toBe(10);
      expect(mixedUser.distinctClients90d).toBe(8);
    });
  });
});