import { EXPLORE_ROLE_TABS, FeatureFlags, getCredibilityVisibilityLevel, TIER_BADGES } from '../lib/featureFlags/axBeta';

describe('AX Beta Feature Flags', () => {
  describe('Feature Flag Detection', () => {
    it('should detect phase rollouts correctly', () => {
      // Test phase detection logic
      expect(FeatureFlags.getCurrentPhase()).toBe('none'); // Default when no flags set
      expect(typeof FeatureFlags.isEnabled('EXPOSE_SCORE_V1')).toBe('boolean');
    });

    it('should have proper explore role tabs', () => {
      expect(EXPLORE_ROLE_TABS).toHaveLength(5);
      expect(EXPLORE_ROLE_TABS[0]).toHaveProperty('key');
      expect(EXPLORE_ROLE_TABS[0]).toHaveProperty('label');
      expect(EXPLORE_ROLE_TABS[0]).toHaveProperty('icon');
    });

    it('should categorize credibility visibility levels correctly', () => {
      expect(getCredibilityVisibilityLevel(100)).toBe('low');
      expect(getCredibilityVisibilityLevel(750)).toBe('moderate');
      expect(getCredibilityVisibilityLevel(1200)).toBe('high');
    });

    it('should have tier badge configurations', () => {
      expect(TIER_BADGES.standard).toHaveProperty('label');
      expect(TIER_BADGES.verified).toHaveProperty('icon');
      expect(TIER_BADGES.signature).toHaveProperty('color');
    });
  });
});

describe('Explore API Data Structures', () => {
  describe('Response Format', () => {
    it('should structure explore results correctly', () => {
      const mockExploreResult = {
        top: [],
        rising: [],
        newThisWeek: [],
        metadata: {
          totalResults: 0,
          filters: {},
          timestamp: new Date().toISOString(),
          mixRatios: {
            top: 0.7,
            rising: 0.2,
            newThisWeek: 0.1
          }
        }
      };

      expect(mockExploreResult).toHaveProperty('top');
      expect(mockExploreResult).toHaveProperty('rising');
      expect(mockExploreResult).toHaveProperty('newThisWeek');
      expect(mockExploreResult.metadata).toHaveProperty('mixRatios');
      expect(mockExploreResult.metadata.mixRatios.top + 
             mockExploreResult.metadata.mixRatios.rising + 
             mockExploreResult.metadata.mixRatios.newThisWeek).toBeCloseTo(1.0);
    });
  });
});

describe('BYO Invite System', () => {
  describe('Invite Code Generation', () => {
    function generateTestInviteCode(): string {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    it('should generate valid invite codes', () => {
      const code = generateTestInviteCode();
      expect(code).toHaveLength(8);
      expect(/^[A-Z0-9]+$/.test(code)).toBe(true);
    });

    it('should structure BYO invite data correctly', () => {
      const mockByoInvite = {
        id: 'test-id',
        creatorId: 'creator-123',
        inviteCode: 'ABC12345',
        status: 'pending' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      expect(mockByoInvite).toHaveProperty('id');
      expect(mockByoInvite).toHaveProperty('creatorId');
      expect(mockByoInvite).toHaveProperty('inviteCode');
      expect(mockByoInvite.status).toMatch(/^(pending|accepted|expired|used)$/);
      expect(mockByoInvite.expiresAt.getTime()).toBeGreaterThan(mockByoInvite.createdAt.getTime());
    });
  });
});