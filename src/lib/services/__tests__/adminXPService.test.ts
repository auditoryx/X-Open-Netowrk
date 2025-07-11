import { adminXPService, AdminXPService } from '@/lib/services/adminXPService';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  writeBatch: jest.fn(),
  serverTimestamp: jest.fn(() => ({ timestamp: 'mock' })),
}));

describe('AdminXPService', () => {
  let service: AdminXPService;

  beforeEach(() => {
    service = AdminXPService.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AdminXPService.getInstance();
      const instance2 = AdminXPService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('awardXP', () => {
    it('should validate input parameters', async () => {
      await expect(service.awardXP('user123', 0, SCHEMA_FIELDS.DISPUTE.REASON, 'admin123', 'admin@test.com'))
        .rejects.toThrow('Amount must be positive');

      await expect(service.awardXP('user123', 100, '', 'admin123', 'admin@test.com'))
        .rejects.toThrow('Reason is required');

      await expect(service.awardXP('user123', 100, '   ', 'admin123', 'admin@test.com'))
        .rejects.toThrow('Reason is required');
    });

    it('should handle user progress not found', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({ exists: () => false });

      await expect(service.awardXP('user123', 100, 'Test award', 'admin123', 'admin@test.com'))
        .rejects.toThrow('User progress not found');
    });

    it('should award XP successfully', async () => {
      const { getDoc, writeBatch, doc, collection } = require('firebase/firestore');
      const mockBatch = {
        update: jest.fn(),
        set: jest.fn(),
        commit: jest.fn()
      };

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ totalXP: 500 })
      });
      writeBatch.mockReturnValue(mockBatch);
      doc.mockReturnValue({ id: 'mock-ref' });
      collection.mockReturnValue({ id: 'mock-collection' });

      await service.awardXP('user123', 100, 'Test award', 'admin123', 'admin@test.com');

      expect(mockBatch.update).toHaveBeenCalled();
      expect(mockBatch.set).toHaveBeenCalledTimes(2); // Admin operation + audit log
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe('deductXP', () => {
    it('should validate input parameters', async () => {
      await expect(service.deductXP('user123', -10, SCHEMA_FIELDS.DISPUTE.REASON, 'admin123', 'admin@test.com'))
        .rejects.toThrow('Amount must be positive');
    });

    it('should not allow negative XP', async () => {
      const { getDoc, writeBatch } = require('firebase/firestore');
      const mockBatch = {
        update: jest.fn(),
        set: jest.fn(),
        commit: jest.fn()
      };

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ totalXP: 50 })
      });
      writeBatch.mockReturnValue(mockBatch);

      await service.deductXP('user123', 100, 'Test deduct', 'admin123', 'admin@test.com');

      // Should update to 0, not negative
      expect(mockBatch.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          totalXP: 0
        })
      );
    });
  });

  describe('setXP', () => {
    it('should validate input parameters', async () => {
      await expect(service.setXP('user123', -10, SCHEMA_FIELDS.DISPUTE.REASON, 'admin123', 'admin@test.com'))
        .rejects.toThrow('Amount cannot be negative');
    });

    it('should set XP to specific value', async () => {
      const { getDoc, writeBatch } = require('firebase/firestore');
      const mockBatch = {
        update: jest.fn(),
        set: jest.fn(),
        commit: jest.fn()
      };

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ totalXP: 500 })
      });
      writeBatch.mockReturnValue(mockBatch);

      await service.setXP('user123', 1000, 'Test set', 'admin123', 'admin@test.com');

      expect(mockBatch.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          totalXP: 1000
        })
      );
    });
  });

  describe('searchUsers', () => {
    it('should return empty array for empty search term', async () => {
      const result = await service.searchUsers('');
      expect(result).toEqual([]);

      const result2 = await service.searchUsers('   ');
      expect(result2).toEqual([]);
    });

    it('should search users by email', async () => {
      const { getDocs, query } = require('firebase/firestore');
      const mockUsers = [
        { id: 'user1', data: () => ({ email: 'test@example.com', name: 'Test User' }) },
        { id: 'user2', data: () => ({ email: 'test2@example.com', name: 'Test User 2' }) }
      ];

      getDocs.mockResolvedValue({
        docs: mockUsers
      });
      query.mockReturnValue('mock-query');

      const result = await service.searchUsers('test@example.com');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        uid: 'user1',
        email: 'test@example.com',
        name: 'Test User'
      });
    });
  });

  describe('bulkAwardXP', () => {
    it('should validate bulk operation parameters', async () => {
      await expect(service.bulkAwardXP({
        userIds: [],
        amount: 100,
        reason: 'Test',
        operationType: 'award'
      }, 'admin123', 'admin@test.com'))
        .rejects.toThrow('No users selected');

      await expect(service.bulkAwardXP({
        userIds: ['user1'],
        amount: 0,
        reason: 'Test',
        operationType: 'award'
      }, 'admin123', 'admin@test.com'))
        .rejects.toThrow('Amount must be positive');

      await expect(service.bulkAwardXP({
        userIds: ['user1'],
        amount: 100,
        reason: '',
        operationType: 'award'
      }, 'admin123', 'admin@test.com'))
        .rejects.toThrow('Reason is required');
    });

    it('should process bulk operation for multiple users', async () => {
      const { getDoc, writeBatch } = require('firebase/firestore');
      const mockBatch = {
        update: jest.fn(),
        set: jest.fn(),
        commit: jest.fn()
      };

      // Mock user progress exists for all users
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ totalXP: 100 })
      });
      writeBatch.mockReturnValue(mockBatch);

      await service.bulkAwardXP({
        userIds: ['user1', 'user2', 'user3'],
        amount: 50,
        reason: 'Bulk test award',
        operationType: 'award'
      }, 'admin123', 'admin@test.com');

      // Should update each user's progress and log operations
      expect(mockBatch.update).toHaveBeenCalledTimes(3);
      expect(mockBatch.set).toHaveBeenCalledTimes(3); // Admin operations
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe('getXPStatistics', () => {
    it('should calculate statistics correctly', async () => {
      const { getDocs } = require('firebase/firestore');
      
      // Mock user progress data
      const mockUserProgress = [
        { id: 'user1', data: () => ({ totalXP: 100 }) },
        { id: 'user2', data: () => ({ totalXP: 200 }) },
        { id: 'user3', data: () => ({ totalXP: 300 }) }
      ];

      // Mock admin operations
      const mockOperations = [
        { id: 'op1', data: () => ({ operationType: 'award', amount: 50 }) }
      ];

      getDocs
        .mockResolvedValueOnce({ docs: mockUserProgress }) // userProgress collection
        .mockResolvedValueOnce({ docs: mockOperations });  // adminXPOperations collection

      const stats = await service.getXPStatistics();

      expect(stats.totalActiveUsers).toBe(3);
      expect(stats.totalXPAwarded).toBe(600); // 100 + 200 + 300
      expect(stats.averageXP).toBe(200); // 600 / 3
      expect(stats.topUsers).toHaveLength(3);
      expect(stats.recentOperations).toHaveLength(1);
    });

    it('should handle empty data gracefully', async () => {
      const { getDocs } = require('firebase/firestore');
      
      getDocs
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [] });

      const stats = await service.getXPStatistics();

      expect(stats.totalActiveUsers).toBe(0);
      expect(stats.totalXPAwarded).toBe(0);
      expect(stats.averageXP).toBe(0);
      expect(stats.topUsers).toEqual([]);
      expect(stats.recentOperations).toEqual([]);
    });
  });

  describe('getUserXPData', () => {
    it('should return null for non-existent user', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({ exists: () => false });

      const result = await service.getUserXPData('nonexistent');
      expect(result).toBeNull();
    });

    it('should return user XP data with operations', async () => {
      const { getDoc, getDocs } = require('firebase/firestore');
      
      // Mock user progress
      getDoc
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ totalXP: 500, dailyXP: 50, currentTier: 'Standard' })
        })
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ email: 'test@example.com', name: 'Test User' })
        });

      // Mock admin operations
      const mockOperations = [
        { id: 'op1', data: () => ({ operationType: 'award', amount: 100, reason: 'Test' }) }
      ];
      getDocs.mockResolvedValue({ docs: mockOperations });

      const result = await service.getUserXPData('user123');

      expect(result).toEqual({
        id: 'user123',
        userId: 'user123',
        userEmail: 'test@example.com',
        userName: 'Test User',
        totalXP: 500,
        dailyXP: 50,
        tier: 'Standard',
        lastUpdated: undefined,
        operations: [expect.objectContaining({
          id: 'op1',
          operationType: 'award',
          amount: 100,
          reason: 'Test'
        })]
      });
    });
  });
});
