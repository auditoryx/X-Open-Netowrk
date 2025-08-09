import { calculateCredibilityScore, extractCredibilityFactors } from '../lib/credibility';
import { CORE_BADGE_DEFINITIONS } from '../lib/badges/coreBadges';
import { UserProfile } from '../types/user';

describe('Credibility System', () => {
  describe('calculateCredibilityScore', () => {
    it('should calculate basic credibility score', () => {
      const factors = {
        tier: 'verified' as const,
        axVerifiedCredits: 10,
        clientConfirmedCredits: 5,
        distinctClients90d: 8,
        positiveReviewCount: 12,
        completedBookings: 15,
        responseRate: 90,
        avgResponseTimeHours: 2,
        daysSinceLastBooking: 3
      };

      const score = calculateCredibilityScore(factors);
      
      expect(score).toBeGreaterThan(0);
      expect(typeof score).toBe('number');
    });

    it('should give higher scores to verified tier', () => {
      const standardUser = {
        tier: 'standard' as const,
        axVerifiedCredits: 5,
        clientConfirmedCredits: 5,
        distinctClients90d: 5,
        positiveReviewCount: 5,
        completedBookings: 5
      };

      const verifiedUser = {
        ...standardUser,
        tier: 'verified' as const
      };

      const standardScore = calculateCredibilityScore(standardUser);
      const verifiedScore = calculateCredibilityScore(verifiedUser);
      
      expect(verifiedScore).toBeGreaterThan(standardScore);
    });

    it('should apply badge bonuses', () => {
      const baseFactor = {
        tier: 'standard' as const,
        axVerifiedCredits: 5,
        clientConfirmedCredits: 5,
        distinctClients90d: 5,
        positiveReviewCount: 5,
        completedBookings: 5
      };

      const badgedFactor = {
        ...baseFactor,
        activeBadges: [CORE_BADGE_DEFINITIONS[0]] // First booking badge
      };

      const baseScore = calculateCredibilityScore(baseFactor);
      const badgedScore = calculateCredibilityScore(badgedFactor);
      
      expect(badgedScore).toBeGreaterThan(baseScore);
    });
  });

  describe('extractCredibilityFactors', () => {
    it('should extract factors from user profile', () => {
      const profile: UserProfile = {
        uid: 'test-user',
        name: 'Test User',
        bio: 'Test bio',
        services: [],
        tags: [],
        media: [],
        availability: [],
        tier: 'verified',
        status: 'approved',
        createdAt: new Date(),
        timezone: 'UTC',
        xp: 1000,
        rankScore: 500,
        lateDeliveries: 0,
        tierFrozen: false,
        badgeIds: ['first-booking'],
        stats: {
          completedBookings: 10,
          positiveReviewCount: 8,
          responseRate: 85,
          avgResponseTimeHours: 3,
          distinctClients90d: 6
        },
        counts: {
          axVerifiedCredits: 8,
          clientConfirmedCredits: 2
        },
        socials: {}
      };

      const factors = extractCredibilityFactors(profile, 
        CORE_BADGE_DEFINITIONS.filter(badge => profile.badgeIds?.includes(badge.id))
      );
      
      expect(factors.tier).toBe('verified');
      expect(factors.axVerifiedCredits).toBe(8);
      expect(factors.completedBookings).toBe(10);
      expect(factors.activeBadges).toHaveLength(1);
    });
  });
});

describe('Badge System', () => {
  describe('Core Badge Definitions', () => {
    it('should have all required badge properties', () => {
      CORE_BADGE_DEFINITIONS.forEach(badge => {
        expect(badge).toHaveProperty('id');
        expect(badge).toHaveProperty('name');
        expect(badge).toHaveProperty('description');
        expect(badge).toHaveProperty('category');
        expect(badge).toHaveProperty('assignmentType');
        expect(badge).toHaveProperty('icon');
        expect(badge).toHaveProperty('scoreImpact');
        expect(badge).toHaveProperty('isActive');
      });
    });

    it('should have positive score impacts for achievement badges', () => {
      const achievementBadges = CORE_BADGE_DEFINITIONS.filter(
        badge => badge.category === 'milestone' || badge.category === 'performance'
      );

      achievementBadges.forEach(badge => {
        expect(badge.scoreImpact).toBeGreaterThan(0);
      });
    });

    it('should have proper TTL for dynamic badges', () => {
      const dynamicBadges = CORE_BADGE_DEFINITIONS.filter(
        badge => badge.category === 'dynamic'
      );

      dynamicBadges.forEach(badge => {
        expect(badge.criteria?.ttlDays).toBeDefined();
        expect(badge.criteria!.ttlDays!).toBeGreaterThan(0);
      });
    });
  });
});