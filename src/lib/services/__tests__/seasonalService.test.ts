/**
 * Seasonal Service Tests
 * Comprehensive test suite for the seasonal feature system
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import SeasonalService, { SeasonalEvent, SeasonalBadge, UserSeasonalProgress } from '../seasonalService';
import { Timestamp } from 'firebase/firestore';

// Mock Firebase
jest.mock('@/firebase/firebaseConfig', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 } as Timestamp)),
  writeBatch: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000 } as Timestamp)),
    fromDate: jest.fn((date: Date) => ({ seconds: date.getTime() / 1000 } as Timestamp))
  }
}));

// Mock dependencies
jest.mock('../badgeService', () => ({
  badgeService: {
    awardBadge: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('../enhancedXPService', () => ({
  enhancedXPService: {
    awardXP: jest.fn().mockResolvedValue({
      success: true,
      xpAwarded: 50,
      message: 'XP awarded'
    })
  }
}));

describe('SeasonalService', () => {
  let seasonalService: SeasonalService;
  let mockFirestore: any;

  beforeEach(() => {
    seasonalService = SeasonalService.getInstance();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup Firestore mocks
    const { 
      collection, 
      doc, 
      getDoc, 
      getDocs, 
      setDoc, 
      updateDoc, 
      query, 
      where, 
      orderBy, 
      writeBatch,
      serverTimestamp,
      Timestamp
    } = require('firebase/firestore');

    mockFirestore = {
      collection,
      doc,
      getDoc,
      getDocs,
      setDoc,
      updateDoc,
      query,
      where,
      orderBy,
      writeBatch,
      serverTimestamp,
      Timestamp
    };

    // Mock basic Firestore operations
    mockFirestore.doc.mockReturnValue({ id: 'mock-doc' });
    mockFirestore.collection.mockReturnValue({ id: 'mock-collection' });
    mockFirestore.query.mockReturnValue({ id: 'mock-query' });
    mockFirestore.where.mockReturnValue({ id: 'mock-where' });
    mockFirestore.orderBy.mockReturnValue({ id: 'mock-orderBy' });
    
    // Mock batch operations
    const mockBatch = {
      update: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined)
    };
    mockFirestore.writeBatch.mockReturnValue(mockBatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Seasonal Event Creation', () => {
    test('should create a basic seasonal event', async () => {
      mockFirestore.setDoc.mockResolvedValue(undefined);

      const eventData = {
        name: 'Spring Festival',
        description: 'Celebrate the arrival of spring',
        type: 'season' as const,
        xpMultiplier: 1.5,
        createdBy: 'admin'
      };

      const eventId = await seasonalService.createSeasonalEvent(eventData);

      expect(eventId).toMatch(/^event_\d+_[a-z0-9]+$/);
      expect(mockFirestore.setDoc).toHaveBeenCalledTimes(2); // Event + analytics
    });

    test('should create event with default values', async () => {
      mockFirestore.setDoc.mockResolvedValue(undefined);

      const eventId = await seasonalService.createSeasonalEvent({});

      expect(eventId).toBeDefined();
      expect(mockFirestore.setDoc).toHaveBeenCalledTimes(2);
    });

    test('should handle creation errors', async () => {
      mockFirestore.setDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(seasonalService.createSeasonalEvent({})).rejects.toThrow('Firestore error');
    });
  });

  describe('Seasonal Badge Creation', () => {
    test('should create a seasonal badge', async () => {
      mockFirestore.setDoc.mockResolvedValue(undefined);

      const badgeData = {
        name: 'Spring Champion',
        description: 'Earned during spring festival',
        eventId: 'event_123',
        rarity: 'epic' as const,
        xpReward: 100,
        requirements: {
          xpThreshold: 1000,
          challengesCompleted: 5
        }
      };

      const badgeId = await seasonalService.createSeasonalBadge(badgeData);

      expect(badgeId).toMatch(/^seasonal_badge_\d+_[a-z0-9]+$/);
      expect(mockFirestore.setDoc).toHaveBeenCalledTimes(1);
    });

    test('should create badge with default values', async () => {
      mockFirestore.setDoc.mockResolvedValue(undefined);

      const badgeId = await seasonalService.createSeasonalBadge({
        eventId: 'event_123'
      });

      expect(badgeId).toBeDefined();
      expect(mockFirestore.setDoc).toHaveBeenCalled();
    });
  });

  describe('Event Management', () => {
    test('should activate upcoming events', async () => {
      const mockEvents = [
        { id: 'event1', status: 'upcoming' },
        { id: 'event2', status: 'upcoming' }
      ];

      mockFirestore.getDocs.mockResolvedValue({
        docs: mockEvents.map(event => ({ id: event.id, data: () => event }))
      });

      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      mockFirestore.writeBatch.mockReturnValue(mockBatch);

      await seasonalService.activateSeasonalEvents();

      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });

    test('should complete expired events', async () => {
      const mockEvents = [
        { id: 'event1', status: 'active' },
        { id: 'event2', status: 'active' }
      ];

      mockFirestore.getDocs.mockResolvedValue({
        docs: mockEvents.map(event => ({ id: event.id, data: () => event }))
      });

      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      mockFirestore.writeBatch.mockReturnValue(mockBatch);

      await seasonalService.completeExpiredEvents();

      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Participation', () => {
    test('should allow user to join active event', async () => {
      // Mock event exists and is active
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          id: 'event_123',
          status: 'active',
          participantCount: 5
        })
      });

      // Mock user hasn't joined yet
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => false
      });

      mockFirestore.setDoc.mockResolvedValue(undefined);
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await seasonalService.joinSeasonalEvent('user123', 'event_123');

      expect(mockFirestore.setDoc).toHaveBeenCalledTimes(1);
      expect(mockFirestore.updateDoc).toHaveBeenCalledTimes(1);
    });

    test('should not allow joining non-existent event', async () => {
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => false
      });

      await expect(
        seasonalService.joinSeasonalEvent('user123', 'invalid_event')
      ).rejects.toThrow('Seasonal event not found');
    });

    test('should not allow joining inactive event', async () => {
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          id: 'event_123',
          status: 'completed'
        })
      });

      await expect(
        seasonalService.joinSeasonalEvent('user123', 'event_123')
      ).rejects.toThrow('Seasonal event is not active');
    });
  });

  describe('Progress Tracking', () => {
    test('should update user seasonal progress', async () => {
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          userId: 'user123',
          eventId: 'event_123',
          xpEarned: 100,
          challengesCompleted: 2
        })
      });

      mockFirestore.updateDoc.mockResolvedValue(undefined);

      // Mock badge eligibility check
      jest.spyOn(seasonalService, 'checkSeasonalBadgeEligibility').mockResolvedValue([]);

      await seasonalService.updateSeasonalProgress('user123', 'event_123', {
        xpEarned: 200,
        challengesCompleted: 3
      });

      expect(mockFirestore.updateDoc).toHaveBeenCalledTimes(1);
      expect(seasonalService.checkSeasonalBadgeEligibility).toHaveBeenCalledWith('user123', 'event_123');
    });

    test('should handle non-participating user gracefully', async () => {
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => false
      });

      await seasonalService.updateSeasonalProgress('user123', 'event_123', {
        xpEarned: 200
      });

      expect(mockFirestore.updateDoc).not.toHaveBeenCalled();
    });
  });

  describe('Badge Eligibility and Awarding', () => {
    test('should check and award eligible badges', async () => {
      // Mock user progress
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          userId: 'user123',
          eventId: 'event_123',
          xpEarned: 1500,
          challengesCompleted: 6,
          activeDays: 10,
          badgesEarned: []
        })
      });

      // Mock available badges
      const mockBadges = [
        {
          id: 'badge1',
          eventId: 'event_123',
          requirements: { xpThreshold: 1000, challengesCompleted: 5 },
          currentAwards: 0,
          maxAwards: undefined,
          xpReward: 100
        },
        {
          id: 'badge2',
          eventId: 'event_123',
          requirements: { xpThreshold: 2000 }, // Too high
          currentAwards: 0,
          maxAwards: undefined,
          xpReward: 200
        }
      ];

      mockFirestore.getDocs.mockResolvedValue({
        docs: mockBadges.map(badge => ({ id: badge.id, data: () => badge }))
      });

      // Mock badge awarding
      jest.spyOn(seasonalService, 'awardSeasonalBadge').mockResolvedValue(undefined);

      const earnedBadges = await seasonalService.checkSeasonalBadgeEligibility('user123', 'event_123');

      expect(earnedBadges).toEqual(['badge1']);
      expect(seasonalService.awardSeasonalBadge).toHaveBeenCalledWith('user123', 'badge1');
    });

    test('should not award badges that are at max limit', async () => {
      // Mock user progress
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          userId: 'user123',
          eventId: 'event_123',
          xpEarned: 1500,
          challengesCompleted: 6,
          badgesEarned: []
        })
      });

      // Mock badge at max awards
      const mockBadges = [
        {
          id: 'badge1',
          eventId: 'event_123',
          requirements: { xpThreshold: 1000 },
          currentAwards: 100,
          maxAwards: 100, // At limit
          xpReward: 100
        }
      ];

      mockFirestore.getDocs.mockResolvedValue({
        docs: mockBadges.map(badge => ({ id: badge.id, data: () => badge }))
      });

      const earnedBadges = await seasonalService.checkSeasonalBadgeEligibility('user123', 'event_123');

      expect(earnedBadges).toEqual([]);
    });

    test('should award seasonal badge correctly', async () => {
      // Mock badge data
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          id: 'badge1',
          eventId: 'event_123',
          xpReward: 100,
          name: 'Spring Badge',
          currentAwards: 5
        })
      });

      // Mock user progress
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          userId: 'user123',
          eventId: 'event_123',
          badgesEarned: [],
          bonusXPReceived: 50
        })
      });

      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await seasonalService.awardSeasonalBadge('user123', 'badge1');

      expect(mockFirestore.updateDoc).toHaveBeenCalledTimes(2); // Progress + badge count
    });
  });

  describe('Data Retrieval', () => {
    test('should get active seasonal events', async () => {
      const mockEvents = [
        { id: 'event1', status: 'active', name: 'Spring Festival' },
        { id: 'event2', status: 'active', name: 'Summer Party' }
      ];

      mockFirestore.getDocs.mockResolvedValue({
        docs: mockEvents.map(event => ({ data: () => event }))
      });

      const events = await seasonalService.getActiveSeasonalEvents();

      expect(events).toHaveLength(2);
      expect(events[0].name).toBe('Spring Festival');
    });

    test('should get user seasonal progress', async () => {
      const mockProgress = [
        { userId: 'user123', eventId: 'event1', xpEarned: 100 },
        { userId: 'user123', eventId: 'event2', xpEarned: 200 }
      ];

      mockFirestore.getDocs.mockResolvedValue({
        docs: mockProgress.map(progress => ({ data: () => progress }))
      });

      const userProgress = await seasonalService.getUserSeasonalProgress('user123');

      expect(userProgress).toHaveLength(2);
      expect(userProgress[0].xpEarned).toBe(100);
    });
  });

  describe('Analytics', () => {
    test('should update event analytics correctly', async () => {
      // Mock progress data
      const mockProgress = [
        { 
          userId: 'user1', 
          eventId: 'event_123', 
          xpEarned: 100, 
          activeDays: 5, 
          bonusXPReceived: 50,
          lastActivity: { toMillis: () => Date.now() - 3 * 24 * 60 * 60 * 1000 } // 3 days ago
        },
        { 
          userId: 'user2', 
          eventId: 'event_123', 
          xpEarned: 200, 
          activeDays: 8, 
          bonusXPReceived: 100,
          lastActivity: { toMillis: () => Date.now() - 10 * 24 * 60 * 60 * 1000 } // 10 days ago
        }
      ];

      mockFirestore.getDocs.mockResolvedValueOnce({
        docs: mockProgress.map(progress => ({ data: () => progress }))
      });

      // Mock badges data
      const mockBadges = [
        { currentAwards: 5 },
        { currentAwards: 3 }
      ];

      mockFirestore.getDocs.mockResolvedValueOnce({
        docs: mockBadges.map(badge => ({ data: () => badge }))
      });

      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await seasonalService.updateEventAnalytics('event_123');

      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          totalParticipants: 2,
          activeParticipants: 1, // Only user1 active in last 7 days
          averageXPPerUser: 150,
          averageActiveDays: 6.5,
          totalBadgesAwarded: 8,
          xpBonusDistributed: 150
        })
      );
    });

    test('should get seasonal analytics', async () => {
      const mockAnalytics = {
        eventId: 'event_123',
        totalParticipants: 10,
        activeParticipants: 8,
        averageXPPerUser: 150
      };

      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockAnalytics
      });

      const analytics = await seasonalService.getSeasonalAnalytics('event_123');

      expect(analytics).toEqual(mockAnalytics);
    });

    test('should return null for non-existent analytics', async () => {
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => false
      });

      const analytics = await seasonalService.getSeasonalAnalytics('invalid_event');

      expect(analytics).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle Firestore errors gracefully', async () => {
      mockFirestore.setDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(seasonalService.createSeasonalEvent({})).rejects.toThrow('Firestore error');
    });

    test('should handle missing event when joining', async () => {
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => false
      });

      await expect(
        seasonalService.joinSeasonalEvent('user123', 'invalid_event')
      ).rejects.toThrow('Seasonal event not found');
    });

    test('should handle missing badge when awarding', async () => {
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => false
      });

      await expect(
        seasonalService.awardSeasonalBadge('user123', 'invalid_badge')
      ).rejects.toThrow('Seasonal badge not found');
    });
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = SeasonalService.getInstance();
      const instance2 = SeasonalService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});
