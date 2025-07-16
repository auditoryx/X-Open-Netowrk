/**
 * Challenge Service Tests
 * Comprehensive test suite for the challenge system
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import ChallengeService, { 
  Challenge, 
  ChallengeParticipation, 
  ChallengeType,
  ChallengeDifficulty 
} from '../challengeService';
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
  increment: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 } as Timestamp)),
  writeBatch: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000 } as Timestamp)),
    fromDate: jest.fn((date: Date) => ({ seconds: date.getTime() / 1000 } as Timestamp))
  }
}));

describe('ChallengeService', () => {
  let challengeService: ChallengeService;
  let mockFirestore: any;

  beforeEach(() => {
    challengeService = ChallengeService.getInstance();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup common mocks
    mockFirestore = {
      setDoc: jest.fn().mockResolvedValue(undefined),
      updateDoc: jest.fn().mockResolvedValue(undefined),
      getDoc: jest.fn(),
      getDocs: jest.fn(),
      writeBatch: jest.fn(() => ({
        set: jest.fn(),
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      }))
    };
    
    const firestoreMock = require('firebase/firestore');
    Object.assign(firestoreMock, mockFirestore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Challenge Creation', () => {
    test('should create a basic challenge', async () => {
      const challengeData = {
        title: 'Test Challenge',
        description: 'A test challenge',
        type: 'xp_race' as ChallengeType,
        difficulty: 'bronze' as ChallengeDifficulty,
        targetValue: 1000
      };

      const challengeId = await challengeService.createChallenge(challengeData);

      expect(challengeId).toMatch(/^challenge_\d+_[a-z0-9]+$/);
      expect(mockFirestore.setDoc).toHaveBeenCalled();
      // Verify the document data structure instead of exact call
      const setDocCall = mockFirestore.setDoc.mock.calls[mockFirestore.setDoc.mock.calls.length - 1];
      const savedChallengeData = setDocCall[1];
      expect(savedChallengeData).toMatchObject({
        id: challengeId,
        title: 'Test Challenge',
        description: 'A test challenge',
        type: 'xp_race',
        difficulty: 'bronze',
        status: 'upcoming',
        targetValue: 1000,
        participantCount: 0,
        completionRate: 0,
        averageProgress: 0
      });
    });

    test('should create challenge with default values', async () => {
      const challengeId = await challengeService.createChallenge({});

      expect(mockFirestore.setDoc).toHaveBeenCalled();
      const setDocCall = mockFirestore.setDoc.mock.calls[mockFirestore.setDoc.mock.calls.length - 1];
      const defaultChallengeData = setDocCall[1];
      expect(defaultChallengeData).toMatchObject({
        title: 'Untitled Challenge',
        type: 'xp_race',
        difficulty: 'bronze',
        status: 'upcoming',
        targetMetric: SCHEMA_FIELDS.USER_PROGRESS.TOTAL_XP,
        targetValue: 1000,
        minimumParticipants: 5
      });
    });

    test('should create challenge with proper rewards structure', async () => {
      const challengeData = {
        type: 'project_completion' as ChallengeType,
        difficulty: 'gold' as ChallengeDifficulty
      };

      await challengeService.createChallenge(challengeData);

      expect(mockFirestore.setDoc).toHaveBeenCalled();
      const setDocCall = mockFirestore.setDoc.mock.calls[mockFirestore.setDoc.mock.calls.length - 1];
      const docData = setDocCall[1];
      expect(docData).toMatchObject({
        rewards: expect.objectContaining({
          winner: expect.objectContaining({
            xp: expect.any(Number),
            specialBadge: expect.any(String)
          }),
          top3: expect.objectContaining({
            xp: expect.any(Number)
          }),
          top10: expect.objectContaining({
            xp: expect.any(Number)
          }),
          participation: expect.objectContaining({
            xp: expect.any(Number)
          })
        })
      });
    });
  });

  describe('Monthly Challenge Generation', () => {
    test('should generate monthly challenges when none exist', async () => {
      // Mock no existing challenges
      mockFirestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: []
      });

      const challengeIds = await challengeService.generateMonthlyCharlenges();

      expect(challengeIds).toHaveLength(4); // project_completion, referral_champion, five_star_streak, xp_race
      expect(mockFirestore.setDoc).toHaveBeenCalledTimes(4);
      
      // Verify each challenge type was created
      const setDocCalls = mockFirestore.setDoc.mock.calls;
      const challengeTypes = setDocCalls.map(call => call[1].type);
      expect(challengeTypes).toContain('project_completion');
      expect(challengeTypes).toContain('referral_champion');
      expect(challengeTypes).toContain('five_star_streak');
      expect(challengeTypes).toContain('xp_race');
    });

    test('should not generate challenges if they already exist', async () => {
      // Mock existing challenges
      mockFirestore.getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [
          { id: 'existing_challenge_1' },
          { id: 'existing_challenge_2' }
        ]
      });

      const challengeIds = await challengeService.generateMonthlyCharlenges();

      expect(challengeIds).toEqual(['existing_challenge_1', 'existing_challenge_2']);
      expect(mockFirestore.setDoc).not.toHaveBeenCalled();
    });

    test('should create challenges with correct monthly timeframe', async () => {
      mockFirestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: []
      });

      await challengeService.generateMonthlyCharlenges();

      const setDocCall = mockFirestore.setDoc.mock.calls[0];
      const challenge = setDocCall[1];

      expect(challenge.isRecurring).toBe(true);
      expect(challenge.recurringPattern).toBe('monthly');
      expect(challenge.createdBy).toBe('system');
      expect(challenge.tags).toContain('monthly');
      expect(challenge.tags).toContain('auto_generated');
    });
  });

  describe('Challenge Participation', () => {
    test('should allow user to join active challenge', async () => {
      const challengeId = 'test_challenge';
      const userId = 'test_user';

      // Mock challenge exists and is active
      mockFirestore.getDoc
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({
            status: 'active',
            targetValue: 1000
          })
        })
        // Mock user not already joined
        .mockResolvedValueOnce({
          exists: () => false
        });

      const mockBatch = {
        set: jest.fn(),
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      mockFirestore.writeBatch.mockReturnValue(mockBatch);

      await challengeService.joinChallenge(challengeId, userId);

      expect(mockBatch.set).toHaveBeenCalled();
      const batchSetCall = mockBatch.set.mock.calls[0];
      const participationData = batchSetCall[1];
      expect(participationData).toMatchObject({
        challengeId,
        userId,
        currentValue: 0,
        targetValue: 1000,
        progressPercentage: 0,
        position: 0,
        isWinner: false,
        isTop3: false,
        isTop10: false
      });
      expect(mockBatch.update).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    test('should not allow joining non-existent challenge', async () => {
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => false
      });

      await expect(
        challengeService.joinChallenge('nonexistent', 'user')
      ).rejects.toThrow('Challenge not found');
    });

    test('should not allow joining completed challenge', async () => {
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'completed' })
      });

      await expect(
        challengeService.joinChallenge('completed_challenge', 'user')
      ).rejects.toThrow('Challenge is not available for joining');
    });

    test('should not allow duplicate participation', async () => {
      mockFirestore.getDoc
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ status: 'active', targetValue: 1000 })
        })
        .mockResolvedValueOnce({
          exists: () => true // User already joined
        });

      await expect(
        challengeService.joinChallenge('challenge', 'user')
      ).rejects.toThrow('User already joined this challenge');
    });
  });

  describe('Progress Tracking', () => {
    test('should update user progress in challenge', async () => {
      const challengeId = 'test_challenge';
      const userId = 'test_user';
      const newValue = 500;

      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          challengeId,
          userId,
          targetValue: 1000,
          currentValue: 0
        })
      });

      // Mock leaderboard update
      mockFirestore.getDocs.mockResolvedValueOnce({
        docs: [
          {
            data: () => ({ userId, currentValue: newValue }),
            ref: {}
          }
        ]
      });

      const mockBatch = {
        update: jest.fn(),
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      mockFirestore.writeBatch.mockReturnValue(mockBatch);

      await challengeService.updateChallengeProgress(challengeId, userId, newValue);

      expect(mockFirestore.updateDoc).toHaveBeenCalled();
      const updateCall = mockFirestore.updateDoc.mock.calls[mockFirestore.updateDoc.mock.calls.length - 1];
      const updateData = updateCall[1];
      expect(updateData).toMatchObject({
        currentValue: newValue,
        progressPercentage: 50 // 500/1000 * 100
      });
    });

    test('should cap progress percentage at 100%', async () => {
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          targetValue: 1000,
          currentValue: 0
        })
      });

      mockFirestore.getDocs.mockResolvedValueOnce({ docs: [] });
      const mockBatch = {
        update: jest.fn(),
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      mockFirestore.writeBatch.mockReturnValue(mockBatch);

      await challengeService.updateChallengeProgress('challenge', 'user', 1500);

      expect(mockFirestore.updateDoc).toHaveBeenCalled();
      const updateCall = mockFirestore.updateDoc.mock.calls[mockFirestore.updateDoc.mock.calls.length - 1];
      const updateData = updateCall[1];
      expect(updateData).toMatchObject({
        progressPercentage: 100 // Capped at 100%
      });
    });

    test('should handle non-participating user gracefully', async () => {
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => false
      });

      // Should not throw error, just log and return
      await expect(
        challengeService.updateChallengeProgress('challenge', 'non_participant', 100)
      ).resolves.toBeUndefined();

      expect(mockFirestore.updateDoc).not.toHaveBeenCalled();
    });
  });

  describe('Leaderboard Management', () => {
    test('should update challenge leaderboard with correct positions', async () => {
      const challengeId = 'test_challenge';
      const participants = [
        { userId: 'user1', currentValue: 1000 },
        { userId: 'user2', currentValue: 800 },
        { userId: 'user3', currentValue: 600 }
      ];

      mockFirestore.getDocs.mockResolvedValueOnce({
        docs: participants.map((p, index) => ({
          data: () => p,
          ref: { id: `participation_${index}` }
        }))
      });

      const mockBatch = {
        update: jest.fn(),
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      mockFirestore.writeBatch.mockReturnValue(mockBatch);

      await challengeService.updateChallengeLeaderboard(challengeId);

      // Verify position updates
      expect(mockBatch.update).toHaveBeenCalledWith(
        { id: 'participation_0' },
        expect.objectContaining({
          position: 1,
          isWinner: true,
          isTop3: true,
          isTop10: true
        })
      );

      expect(mockBatch.update).toHaveBeenCalledWith(
        { id: 'participation_1' },
        expect.objectContaining({
          position: 2,
          isWinner: false,
          isTop3: true,
          isTop10: true
        })
      );

      expect(mockBatch.update).toHaveBeenCalledWith(
        { id: 'participation_2' },
        expect.objectContaining({
          position: 3,
          isWinner: false,
          isTop3: true,
          isTop10: true
        })
      );

      // Verify leaderboard document creation
      expect(mockBatch.set).toHaveBeenCalled();
      const batchSetCall = mockBatch.set.mock.calls[0];
      const leaderboardData = batchSetCall[1];
      expect(leaderboardData).toMatchObject({
        challengeId,
        participants: expect.arrayContaining([
          expect.objectContaining({
            userId: 'user1',
            currentValue: 1000,
            position: 1
          }),
          expect.objectContaining({
            userId: 'user2',
            currentValue: 800,
            position: 2
          }),
          expect.objectContaining({
            userId: 'user3',
            currentValue: 600,
            position: 3
          })
        ])
      });
    });

    test('should limit leaderboard to top 50 participants', async () => {
      const manyParticipants = Array.from({ length: 100 }, (_, i) => ({
        userId: `user${i}`,
        currentValue: 1000 - i
      }));

      mockFirestore.getDocs.mockResolvedValueOnce({
        docs: manyParticipants.map((p, index) => ({
          data: () => p,
          ref: { id: `participation_${index}` }
        }))
      });

      const mockBatch = {
        update: jest.fn(),
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      mockFirestore.writeBatch.mockReturnValue(mockBatch);

      await challengeService.updateChallengeLeaderboard('test_challenge');

      const leaderboardCall = mockBatch.set.mock.calls.find(call => 
        call[1].participants
      );
      
      expect(leaderboardCall[1].participants).toHaveLength(50);
    });
  });

  describe('Challenge Completion', () => {
    test('should complete challenge and distribute rewards correctly', async () => {
      const challengeId = 'test_challenge';
      const challengeData = {
        rewards: {
          winner: { xp: 500, specialBadge: 'champion' },
          top3: { xp: 300, badge: 'top_performer' },
          top10: { xp: 150, badge: 'competitor' },
          participation: { xp: 50 }
        },
        participantCount: 15
      };

      const participants = [
        { userId: 'user1', currentValue: 1000 }, // Winner
        { userId: 'user2', currentValue: 900 },  // Top 3
        { userId: 'user3', currentValue: 800 },  // Top 3
        { userId: 'user4', currentValue: 700 },  // Top 10
        { userId: 'user5', currentValue: 600 }   // Participation
      ];

      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => challengeData
      });

      mockFirestore.getDocs.mockResolvedValueOnce({
        docs: participants.map((p, index) => ({
          data: () => p,
          ref: { id: `participation_${index}` }
        }))
      });

      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      mockFirestore.writeBatch.mockReturnValue(mockBatch);

      await challengeService.completeChallenge(challengeId);

      // Verify winner rewards
      expect(mockBatch.update).toHaveBeenCalledWith(
        { id: 'participation_0' },
        expect.objectContaining({
          rewardsAwarded: challengeData.rewards.winner,
          rewardsDistributed: true
        })
      );

      // Verify top 3 rewards
      expect(mockBatch.update).toHaveBeenCalledWith(
        { id: 'participation_1' },
        expect.objectContaining({
          rewardsAwarded: challengeData.rewards.top3
        })
      );

      // Verify challenge status update
      expect(mockBatch.update).toHaveBeenCalled();
      const updateCalls = mockBatch.update.mock.calls;
      const challengeUpdate = updateCalls.find(call => {
        const data = call[1];
        return data.status === 'completed';
      });
      expect(challengeUpdate).toBeTruthy();
      expect(challengeUpdate[1]).toMatchObject({
        status: 'completed',
        completionRate: expect.any(Number)
      });
    });

    test('should handle challenge completion with no participants', async () => {
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          rewards: {
            winner: { xp: 500 },
            top3: { xp: 300 },
            top10: { xp: 150 },
            participation: { xp: 50 }
          },
          participantCount: 0
        })
      });

      mockFirestore.getDocs.mockResolvedValueOnce({
        docs: []
      });

      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      mockFirestore.writeBatch.mockReturnValue(mockBatch);

      await challengeService.completeChallenge('empty_challenge');

      // Should still update challenge status
      expect(mockBatch.update).toHaveBeenCalled();
      const updateCall = mockBatch.update.mock.calls[0];
      const updateData = updateCall[1];
      expect(updateData).toMatchObject({
        status: 'completed',
        completionRate: expect.any(Number)
      });
    });
  });

  describe('Challenge Queries', () => {
    test('should fetch active challenges', async () => {
      const activeChallenges = [
        { id: 'challenge1', status: 'active' },
        { id: 'challenge2', status: 'active' }
      ];

      mockFirestore.getDocs.mockResolvedValueOnce({
        docs: activeChallenges.map(c => ({ data: () => c }))
      });

      const result = await challengeService.getActiveChallenges();

      expect(result).toEqual(activeChallenges);
      expect(mockFirestore.getDocs).toHaveBeenCalled();
    });

    test('should fetch user challenge participations', async () => {
      const userId = 'test_user';
      const participations = [
        { challengeId: 'challenge1', userId, currentValue: 500 },
        { challengeId: 'challenge2', userId, currentValue: 300 }
      ];

      mockFirestore.getDocs.mockResolvedValueOnce({
        docs: participations.map(p => ({ data: () => p }))
      });

      const result = await challengeService.getUserChallenges(userId);

      expect(result).toEqual(participations);
    });

    test('should fetch challenge leaderboard', async () => {
      const challengeId = 'test_challenge';
      const leaderboard = {
        challengeId,
        participants: [
          { userId: 'user1', position: 1, currentValue: 1000 }
        ]
      };

      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => leaderboard
      });

      const result = await challengeService.getChallengeLeaderboard(challengeId);

      expect(result).toEqual(leaderboard);
    });

    test('should return null for non-existent leaderboard', async () => {
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => false
      });

      const result = await challengeService.getChallengeLeaderboard('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('Automated Challenge Management', () => {
    test('should activate upcoming challenges that have started', async () => {
      const upcomingChallenges = [
        { id: 'challenge1', status: 'upcoming' },
        { id: 'challenge2', status: 'upcoming' }
      ];

      mockFirestore.getDocs.mockResolvedValueOnce({
        size: 2,
        docs: upcomingChallenges.map(c => ({
          data: () => c,
          ref: { id: c.id }
        }))
      });

      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      mockFirestore.writeBatch.mockReturnValue(mockBatch);

      await challengeService.activateUpcomingChallenges();

      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.update).toHaveBeenCalledWith(
        { id: 'challenge1' },
        { status: 'active' }
      );
      expect(mockBatch.update).toHaveBeenCalledWith(
        { id: 'challenge2' },
        { status: 'active' }
      );
    });

    test('should complete expired active challenges', async () => {
      const expiredChallenges = [
        { id: 'expired1' },
        { id: 'expired2' }
      ];

      mockFirestore.getDocs.mockResolvedValueOnce({
        size: 2,
        docs: expiredChallenges.map(c => ({ id: c.id }))
      });

      // Mock the complete challenge calls
      const originalCompleteChallenge = challengeService.completeChallenge;
      challengeService.completeChallenge = jest.fn().mockResolvedValue(undefined);

      await challengeService.completeExpiredChallenges();

      expect(challengeService.completeChallenge).toHaveBeenCalledTimes(2);
      expect(challengeService.completeChallenge).toHaveBeenCalledWith('expired1');
      expect(challengeService.completeChallenge).toHaveBeenCalledWith('expired2');

      // Restore original method
      challengeService.completeChallenge = originalCompleteChallenge;
    });
  });

  describe('Error Handling', () => {
    test('should handle Firestore errors gracefully', async () => {
      mockFirestore.setDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(
        challengeService.createChallenge({ title: 'Test' })
      ).rejects.toThrow('Firestore error');
    });

    test('should handle missing challenge data', async () => {
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => false
      });

      await expect(
        challengeService.completeChallenge('nonexistent')
      ).rejects.toThrow('Challenge not found');
    });

    test('should handle batch operation failures', async () => {
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'active', targetValue: 1000 })
      }).mockResolvedValueOnce({
        exists: () => false
      });

      const mockBatch = {
        set: jest.fn(),
        update: jest.fn(),
        commit: jest.fn().mockRejectedValueOnce(new Error('Batch error'))
      };
      mockFirestore.writeBatch.mockReturnValue(mockBatch);

      await expect(
        challengeService.joinChallenge('challenge', 'user')
      ).rejects.toThrow('Batch error');
    });
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = ChallengeService.getInstance();
      const instance2 = ChallengeService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});
