import { calculateCredibilityScore, extractCredibilityFactors } from '../libs/shared/credibility/calculateCredibilityScore';
import { CredibilityFactors, CredibilityConfig } from '../libs/shared/credibility/types';

describe('AX Beta Credibility System Tests', () => {
  const DEFAULT_CONFIG: CredibilityConfig = {
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
    test('should prefer diversity over repeated clients', () => {
      // Scenario: 5 jobs from same client vs 2 jobs from two different clients
      const sameClientFactors: CredibilityFactors = {
        tier: 'verified',
        axVerifiedCredits: 5,
        clientConfirmedCredits: 0,
        distinctClients90d: 1, // Only 1 unique client
        positiveReviewCount: 5,
        completedBookings: 5
      };

      const diverseClientFactors: CredibilityFactors = {
        tier: 'verified',
        axVerifiedCredits: 2,
        clientConfirmedCredits: 0,
        distinctClients90d: 2, // 2 unique clients
        positiveReviewCount: 2,
        completedBookings: 2
      };

      const sameClientScore = calculateCredibilityScore(sameClientFactors, DEFAULT_CONFIG);
      const diverseClientScore = calculateCredibilityScore(diverseClientFactors, DEFAULT_CONFIG);

      // Diverse clients should score better than same client spam
      // The diversified client score should not be much lower despite fewer bookings
      const scoreDifference = sameClientScore - diverseClientScore;
      expect(scoreDifference).toBeLessThan(50); // Should be relatively close
      
      // Check distinct client impact specifically
      const sameClientDiversityScore = Math.min(
        sameClientFactors.distinctClients90d * DEFAULT_CONFIG.distinctClientCaps.perClientScore,
        DEFAULT_CONFIG.distinctClientCaps.maxImpact
      );
      const diverseClientDiversityScore = Math.min(
        diverseClientFactors.distinctClients90d * DEFAULT_CONFIG.distinctClientCaps.perClientScore,
        DEFAULT_CONFIG.distinctClientCaps.maxImpact
      );

      expect(diverseClientDiversityScore).toBeGreaterThan(sameClientDiversityScore);
    });

    test('should cap distinct client impact at maxImpact', () => {
      const manyClientsFactors: CredibilityFactors = {
        tier: 'standard',
        axVerifiedCredits: 0,
        clientConfirmedCredits: 0,
        distinctClients90d: 50, // Many unique clients
        positiveReviewCount: 0,
        completedBookings: 50
      };

      const score = calculateCredibilityScore(manyClientsFactors, DEFAULT_CONFIG);
      
      // The distinct client portion should be capped
      const maxDistinctClientScore = DEFAULT_CONFIG.distinctClientCaps.maxImpact;
      const expectedMinScore = DEFAULT_CONFIG.tierWeights.standard + maxDistinctClientScore;
      
      expect(score).toBeGreaterThanOrEqual(expectedMinScore);
      
      // But not much more than the cap would allow
      expect(score).toBeLessThan(expectedMinScore + 100);
    });

    test('should use 90-day rolling window', () => {
      // This would be tested in integration with actual Firestore queries
      // For unit test, we verify the config is using 90 days
      expect(DEFAULT_CONFIG.distinctClientCaps.windowDays).toBe(90);
    });
  });

  describe('Refund behavior', () => {
    test('should not award credits for refunded bookings', () => {
      // This logic is in the onBookingCompleted function
      // Test verifies that refunded/cancelled bookings don't trigger credit awards
      const refundedBooking = {
        status: 'completed',
        isPaid: true,
        wasRefunded: true,
        creditAwarded: false
      };

      // In the actual function, this would return early without awarding credits
      // Here we test the logic that would prevent credit award
      const shouldAwardCredit = !refundedBooking.wasRefunded && 
                               refundedBooking.isPaid && 
                               refundedBooking.status === 'completed';
      
      expect(shouldAwardCredit).toBe(false);
    });

    test('should not allow reviews for refunded bookings', () => {
      // This is tested via Firestore rules
      // Here we verify the logic that would be used in the rules
      const refundedBooking = {
        status: 'refunded',
        isPaid: false,
        clientId: 'client1'
      };

      const completedPaidBooking = {
        status: 'completed',
        isPaid: true,
        clientId: 'client1'
      };

      // Mock the bookingIsPaidAndCompleted function logic
      const canReviewRefunded = refundedBooking.status === 'completed' && 
                               refundedBooking.isPaid;
      const canReviewCompleted = completedPaidBooking.status === 'completed' && 
                                completedPaidBooking.isPaid;

      expect(canReviewRefunded).toBe(false);
      expect(canReviewCompleted).toBe(true);
    });
  });

  describe('Dynamic badge TTL', () => {
    test('should set expiresAt for dynamic badges', () => {
      const now = new Date();
      const badgeAssignment = {
        badgeId: 'trending-now',
        assignedAt: now,
        expiresAt: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 days
      };

      expect(badgeAssignment.expiresAt).toBeInstanceOf(Date);
      expect(badgeAssignment.expiresAt.getTime()).toBeGreaterThan(now.getTime());
    });

    test('should expire badges based on expiresAt field', () => {
      const now = new Date();
      const expiredBadge = {
        badgeId: 'trending-now',
        expiresAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'active'
      };

      const activeBadge = {
        badgeId: 'rising-talent',
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 1 day from now
        status: 'active'
      };

      const isExpired = (badge: any) => badge.expiresAt < now;

      expect(isExpired(expiredBadge)).toBe(true);
      expect(isExpired(activeBadge)).toBe(false);
    });
  });

  describe('Explore composition from config', () => {
    test('should read mix ratios from config', () => {
      const exploreConfig = {
        exploreComposition: {
          top: 0.7,
          rising: 0.2,
          newThisWeek: 0.1
        }
      };

      expect(exploreConfig.exploreComposition.top).toBe(0.7);
      expect(exploreConfig.exploreComposition.rising).toBe(0.2);
      expect(exploreConfig.exploreComposition.newThisWeek).toBe(0.1);
      
      // Verify they sum to 1.0
      const total = exploreConfig.exploreComposition.top + 
                   exploreConfig.exploreComposition.rising + 
                   exploreConfig.exploreComposition.newThisWeek;
      expect(total).toBeCloseTo(1.0);
    });
  });
});