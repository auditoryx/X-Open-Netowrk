/**
 * Badge Service Tests
 * Tests for badge definitions, criteria checking, and auto-awarding
 */

import { badgeService } from '../badgeService';
import { xpService } from '../xpService';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toMillis: () => Date.now() }))
  },
  runTransaction: jest.fn()
}));

// Mock XP Service
jest.mock('../xpService', () => ({
  xpService: {
    getUserProgress: jest.fn(),
    getUserXPHistory: jest.fn()
  }
}));

describe('BadgeService', () => {
  const mockUserId = 'test-user-123';
  const mockUserProgress = {
    totalXP: 500,
    tier: 'standard',
    level: 5
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset badge service state
    (badgeService as any).definitionsLoaded = false;
    (badgeService as any).badgeDefinitions.clear();
  });

  describe('Badge Definitions', () => {
    it('should initialize essential badge definitions', async () => {
      const setDocMock = require('firebase/firestore').setDoc;
      setDocMock.mockResolvedValue(undefined);

      await badgeService.initializeBadgeDefinitions();
      
      const definitions = await badgeService.getAllBadgeDefinitions();
      
      expect(definitions).toHaveLength(4);
      expect(definitions.map(b => b.id)).toEqual([
        'session_starter',
        'certified_mix',
        'studio_regular',
        'verified_pro'
      ]);
    });

    it('should load badge definitions from Firestore', async () => {
      const getDocs = require('firebase/firestore').getDocs;
      const mockBadgeData = {
        id: 'test_badge',
        name: 'Test Badge',
        isActive: true
      };
      
      getDocs.mockResolvedValue({
        empty: false,
        docs: [{
          data: () => mockBadgeData
        }]
      });

      await badgeService.loadBadgeDefinitions();
      
      expect(getDocs).toHaveBeenCalled();
    });
  });

  describe('Badge Eligibility Checking', () => {
    beforeEach(async () => {
      // Initialize badge definitions
      const setDocMock = require('firebase/firestore').setDoc;
      setDocMock.mockResolvedValue(undefined);
      await badgeService.initializeBadgeDefinitions();
    });

    it('should check XP threshold badges correctly', async () => {
      (xpService.getUserProgress as jest.Mock).mockResolvedValue({
        totalXP: 150
      });
      
      (xpService.getUserXPHistory as jest.Mock).mockResolvedValue([
        { event: 'bookingCompleted', xp: 100 },
        { event: 'fiveStarReview', xp: 30 }
      ]);

      const getDoc = require('firebase/firestore').getDoc;
      getDoc.mockResolvedValue({ exists: () => false });

      const result = await badgeService.checkAndAwardBadges(mockUserId, 'bookingCompleted');
      
      expect(result.success).toBe(true);
      expect(xpService.getUserProgress).toHaveBeenCalledWith(mockUserId);
    });

    it('should award Session Starter badge on first booking', async () => {
      (xpService.getUserProgress as jest.Mock).mockResolvedValue(mockUserProgress);
      (xpService.getUserXPHistory as jest.Mock).mockResolvedValue([
        { event: 'bookingCompleted', xp: 100 }
      ]);

      const getDoc = require('firebase/firestore').getDoc;
      getDoc.mockResolvedValue({ exists: () => false });

      const runTransaction = require('firebase/firestore').runTransaction;
      runTransaction.mockImplementation(async (db, callback) => {
        return await callback({
          get: jest.fn().mockResolvedValue({ exists: () => false }),
          set: jest.fn()
        });
      });

      const result = await badgeService.checkAndAwardBadges(mockUserId, 'bookingCompleted');
      
      expect(result.success).toBe(true);
      expect(result.badgesAwarded).toContain('session_starter');
    });

    it('should award Certified Mix badge on first 5-star review', async () => {
      (xpService.getUserProgress as jest.Mock).mockResolvedValue(mockUserProgress);
      (xpService.getUserXPHistory as jest.Mock).mockResolvedValue([
        { event: 'fiveStarReview', xp: 30 }
      ]);

      const getDoc = require('firebase/firestore').getDoc;
      getDoc.mockResolvedValue({ exists: () => false });

      const runTransaction = require('firebase/firestore').runTransaction;
      runTransaction.mockImplementation(async (db, callback) => {
        return await callback({
          get: jest.fn().mockResolvedValue({ exists: () => false }),
          set: jest.fn()
        });
      });

      const result = await badgeService.checkAndAwardBadges(mockUserId, 'fiveStarReview');
      
      expect(result.success).toBe(true);
      expect(result.badgesAwarded).toContain('certified_mix');
    });

    it('should not award duplicate badges', async () => {
      (xpService.getUserProgress as jest.Mock).mockResolvedValue(mockUserProgress);
      (xpService.getUserXPHistory as jest.Mock).mockResolvedValue([
        { event: 'bookingCompleted', xp: 100 }
      ]);

      const getDoc = require('firebase/firestore').getDoc;
      getDoc.mockResolvedValue({ exists: () => true }); // Badge already exists

      const result = await badgeService.checkAndAwardBadges(mockUserId, 'bookingCompleted');
      
      expect(result.success).toBe(true);
      expect(result.badgesAwarded).toHaveLength(0);
      expect(result.message).toBe('No new badges earned');
    });
  });

  describe('Badge Progress Tracking', () => {
    beforeEach(async () => {
      const setDocMock = require('firebase/firestore').setDoc;
      setDocMock.mockResolvedValue(undefined);
      await badgeService.initializeBadgeDefinitions();
    });

    it('should calculate correct progress for XP threshold badges', async () => {
      (xpService.getUserProgress as jest.Mock).mockResolvedValue({
        totalXP: 500
      });
      (xpService.getUserXPHistory as jest.Mock).mockResolvedValue([]);

      const getDocs = require('firebase/firestore').getDocs;
      getDocs.mockResolvedValue({ docs: [] });

      const progress = await badgeService.getUserBadgeProgress(mockUserId);
      
      expect(progress).toHaveLength(4);
      
      // Find Studio Regular badge (requires 10 bookings)
      const studioRegular = progress.find(p => p.badgeId === 'studio_regular');
      expect(studioRegular).toBeDefined();
      expect(studioRegular?.progress.target).toBe(10);
    });

    it('should calculate correct progress for booking count badges', async () => {
      (xpService.getUserProgress as jest.Mock).mockResolvedValue(mockUserProgress);
      (xpService.getUserXPHistory as jest.Mock).mockResolvedValue([
        { event: 'bookingCompleted', xp: 100 },
        { event: 'bookingCompleted', xp: 100 },
        { event: 'bookingCompleted', xp: 100 }
      ]);

      const getDocs = require('firebase/firestore').getDocs;
      getDocs.mockResolvedValue({ docs: [] });

      const progress = await badgeService.getUserBadgeProgress(mockUserId);
      
      const sessionStarter = progress.find(p => p.badgeId === 'session_starter');
      expect(sessionStarter?.progress.current).toBe(1); // Target is 1, so current is capped
      expect(sessionStarter?.progress.percentage).toBe(100);
    });
  });

  describe('Badge Statistics', () => {
    beforeEach(async () => {
      const setDocMock = require('firebase/firestore').setDoc;
      setDocMock.mockResolvedValue(undefined);
      await badgeService.initializeBadgeDefinitions();
    });

    it('should calculate badge statistics correctly', async () => {
      const getDocs = require('firebase/firestore').getDocs;
      getDocs.mockResolvedValue({
        docs: [
          { data: () => ({ badgeId: 'session_starter', userId: 'user1', awardedAt: { toMillis: () => Date.now() } }) },
          { data: () => ({ badgeId: 'session_starter', userId: 'user2', awardedAt: { toMillis: () => Date.now() } }) },
          { data: () => ({ badgeId: 'certified_mix', userId: 'user1', awardedAt: { toMillis: () => Date.now() } }) }
        ]
      });

      const stats = await badgeService.getBadgeStatistics();
      
      expect(stats.totalBadges).toBe(4);
      expect(stats.totalAwarded).toBe(3);
      expect(stats.awardsByBadge['session_starter']).toBe(2);
      expect(stats.awardsByBadge['certified_mix']).toBe(1);
      expect(stats.recentAwards).toHaveLength(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle Firebase errors gracefully', async () => {
      (xpService.getUserProgress as jest.Mock).mockRejectedValue(new Error('Firebase error'));

      const result = await badgeService.checkAndAwardBadges(mockUserId);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Error checking badges');
      expect(result.badgesAwarded).toHaveLength(0);
    });

    it('should handle missing user progress gracefully', async () => {
      (xpService.getUserProgress as jest.Mock).mockResolvedValue(null);

      const result = await badgeService.checkAndAwardBadges(mockUserId);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('User progress not found');
      expect(result.badgesAwarded).toHaveLength(0);
    });
  });
});
