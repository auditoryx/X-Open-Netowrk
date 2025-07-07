/**
 * Verification Service Tests
 * Comprehensive test suite for the verification system
 */

import { verificationService, VerificationService } from '../verificationService';
import { xpService } from '../xpService';
import { badgeService } from '../badgeService';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  deleteDoc,
  runTransaction
} from 'firebase/firestore';

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
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toMillis: () => Date.now() })),
    fromDate: jest.fn()
  },
  runTransaction: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn()
}));

const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockRunTransaction = runTransaction as jest.MockedFunction<typeof runTransaction>;

// Mock services
jest.mock('../xpService');
jest.mock('../badgeService');

const mockXpService = xpService as jest.Mocked<typeof xpService>;
const mockBadgeService = badgeService as jest.Mocked<typeof badgeService>;

describe('VerificationService', () => {
  let service: VerificationService;
  const testUserId = 'test-user-123';
  const testAdminId = 'admin-456';
  
  const mockApplication = {
    id: 'app-123',
    userId: testUserId,
    status: 'pending',
    appliedAt: { toMillis: () => Date.now() }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = VerificationService.getInstance();
    
    // Reset mocks to default success states
    mockSetDoc.mockResolvedValue(undefined);
    mockDeleteDoc.mockResolvedValue(undefined);
    mockRunTransaction.mockImplementation(async (db, updateFunction) => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => true,
          data: () => mockApplication
        }),
        update: jest.fn()
      };
      return await updateFunction(mockTransaction);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = VerificationService.getInstance();
      const instance2 = VerificationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('checkEligibility', () => {
    const mockUserProgress = {
      userId: testUserId,
      totalXP: 1200,
      dailyXP: 150,
      currentRank: 'advanced',
      xpToNextRank: 300,
      lastXPDate: new Date()
    };

    const mockUserData = {
      name: 'Test User',
      bio: 'Test bio',
      profilePicture: 'test.jpg',
      location: 'Test City',
      skills: ['skill1', 'skill2'],
      portfolio: ['work1'],
      pricing: '$50/hour',
      averageRating: 4.5
    };

    beforeEach(() => {
      mockXpService.getUserProgress.mockResolvedValue(mockUserProgress);
      mockXpService.getUserXPHistory.mockResolvedValue([
        {
          id: '1',
          userId: testUserId,
          amount: 100,
          event: 'bookingCompleted',
          timestamp: Timestamp.now(),
          metadata: {}
        },
        {
          id: '2',
          userId: testUserId,
          amount: 100,
          event: 'bookingCompleted',
          timestamp: Timestamp.now(),
          metadata: {}
        },
        {
          id: '3',
          userId: testUserId,
          amount: 100,
          event: 'bookingCompleted',
          timestamp: Timestamp.now(),
          metadata: {}
        }
      ]);

      // Mock user document
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData
      } as any);

      // Mock violations query (no violations)
      mockGetDocs.mockResolvedValue({
        size: 0
      } as any);
    });

    it('should return eligible result for qualified user', async () => {
      const result = await service.checkEligibility(testUserId);

      expect(result.isEligible).toBe(true);
      expect(result.criteria.xp.met).toBe(true);
      expect(result.criteria.profileCompleteness.met).toBe(true);
      expect(result.criteria.completedBookings.met).toBe(true);
      expect(result.criteria.averageRating.met).toBe(true);
      expect(result.criteria.violations.met).toBe(true);
      expect(result.overallScore).toBe(100);
      expect(result.nextSteps).toBeUndefined();
    });

    it('should return ineligible result for user with insufficient XP', async () => {
      mockXpService.getUserProgress.mockResolvedValue({
        ...mockUserProgress,
        totalXP: 500 // Below requirement
      });

      const result = await service.checkEligibility(testUserId);

      expect(result.isEligible).toBe(false);
      expect(result.criteria.xp.met).toBe(false);
      expect(result.criteria.xp.current).toBe(500);
      expect(result.criteria.xp.required).toBe(1000);
      expect(result.nextSteps).toContain('Earn 500 more XP (complete 5 more bookings)');
    });

    it('should return ineligible result for incomplete profile', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockUserData,
          bio: '', // Missing bio
          skills: [] // No skills
        })
      } as any);

      const result = await service.checkEligibility(testUserId);

      expect(result.isEligible).toBe(false);
      expect(result.criteria.profileCompleteness.met).toBe(false);
      expect(result.nextSteps).toContain('Complete your profile (add bio, skills, portfolio)');
    });

    it('should return ineligible result for insufficient bookings', async () => {
      mockXpService.getUserXPHistory.mockResolvedValue([
        {
          id: '1',
          userId: testUserId,
          amount: 100,
          event: 'bookingCompleted',
          timestamp: Timestamp.now(),
          metadata: {}
        }
      ]); // Only 1 booking

      const result = await service.checkEligibility(testUserId);

      expect(result.isEligible).toBe(false);
      expect(result.criteria.completedBookings.met).toBe(false);
      expect(result.nextSteps).toContain('Complete 2 more bookings');
    });

    it('should return ineligible result for low rating', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockUserData,
          averageRating: 3.5 // Below requirement
        })
      } as any);

      const result = await service.checkEligibility(testUserId);

      expect(result.isEligible).toBe(false);
      expect(result.criteria.averageRating.met).toBe(false);
      expect(result.nextSteps).toContain('Improve your average rating by delivering high-quality work');
    });

    it('should return ineligible result for recent violations', async () => {
      mockGetDocs.mockResolvedValue({
        size: 2 // Has violations
      } as any);

      const result = await service.checkEligibility(testUserId);

      expect(result.isEligible).toBe(false);
      expect(result.criteria.violations.met).toBe(false);
      expect(result.nextSteps).toContain('Resolve any recent violations and maintain good standing');
    });

    it('should handle user not found', async () => {
      mockXpService.getUserProgress.mockResolvedValue(null);

      await expect(service.checkEligibility(testUserId)).rejects.toThrow('User progress not found');
    });

    it('should handle user document not found', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      } as any);

      await expect(service.checkEligibility(testUserId)).rejects.toThrow('User not found');
    });
  });

  describe('submitApplication', () => {
    beforeEach(() => {
      // Mock eligible user
      jest.spyOn(service, 'checkEligibility').mockResolvedValue({
        isEligible: true,
        criteria: {
          xp: { met: true, current: 1200, required: 1000 },
          profileCompleteness: { met: true, current: 100, required: 90 },
          completedBookings: { met: true, current: 5, required: 3 },
          averageRating: { met: true, current: 4.5, required: 4.0 },
          violations: { met: true, current: 0, allowed: 0 }
        },
        overallScore: 100
      });

      // Mock no pending application
      jest.spyOn(service as any, 'getUserPendingApplication').mockResolvedValue(null);
    });

    it('should successfully submit application for eligible user', async () => {
      const result = await service.submitApplication(testUserId);

      expect(result.success).toBe(true);
      expect(result.applicationId).toBeDefined();
      expect(result.message).toBe('Verification application submitted successfully');
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: testUserId,
          status: 'pending',
          eligibilitySnapshot: expect.objectContaining({
            totalXP: 1200,
            profileCompleteness: 100,
            completedBookings: 5,
            averageRating: 4.5,
            hasViolations: false,
            meetsAllCriteria: true
          })
        })
      );
    });

    it('should reject application for ineligible user', async () => {
      jest.spyOn(service, 'checkEligibility').mockResolvedValue({
        isEligible: false,
        criteria: {
          xp: { met: false, current: 500, required: 1000 },
          profileCompleteness: { met: true, current: 100, required: 90 },
          completedBookings: { met: true, current: 5, required: 3 },
          averageRating: { met: true, current: 4.5, required: 4.0 },
          violations: { met: true, current: 0, allowed: 0 }
        },
        overallScore: 80
      });

      const result = await service.submitApplication(testUserId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('You do not meet all verification criteria yet');
      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it('should reject duplicate application', async () => {
      jest.spyOn(service as any, 'getUserPendingApplication').mockResolvedValue({
        id: 'existing-app',
        userId: testUserId,
        status: 'pending'
      });

      const result = await service.submitApplication(testUserId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('You already have a pending verification application');
    });
  });

  describe('autoTriggerApplication', () => {
    it('should auto-trigger for eligible user without pending application', async () => {
      jest.spyOn(service as any, 'getUserPendingApplication').mockResolvedValue(null);
      jest.spyOn(service, 'checkEligibility').mockResolvedValue({ isEligible: true } as any);
      jest.spyOn(service, 'submitApplication').mockResolvedValue({ success: true } as any);

      const result = await service.autoTriggerApplication(testUserId);

      expect(result).toBe(true);
      expect(service.submitApplication).toHaveBeenCalledWith(testUserId);
    });

    it('should not auto-trigger for user with pending application', async () => {
      jest.spyOn(service as any, 'getUserPendingApplication').mockResolvedValue({
        id: 'pending-app'
      });

      const result = await service.autoTriggerApplication(testUserId);

      expect(result).toBe(false);
    });

    it('should not auto-trigger for ineligible user', async () => {
      jest.spyOn(service as any, 'getUserPendingApplication').mockResolvedValue(null);
      jest.spyOn(service, 'checkEligibility').mockResolvedValue({ isEligible: false } as any);

      const result = await service.autoTriggerApplication(testUserId);

      expect(result).toBe(false);
    });
  });

  describe('getUserVerificationStatus', () => {
    it('should return status for verified user', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ tier: 'verified' })
      } as any);

      jest.spyOn(service as any, 'getUserPendingApplication').mockResolvedValue(null);
      jest.spyOn(service, 'checkEligibility').mockResolvedValue({ isEligible: true } as any);

      const status = await service.getUserVerificationStatus(testUserId);

      expect(status.isVerified).toBe(true);
      expect(status.currentApplication).toBeNull();
      expect(status.eligibility).toBeDefined();
    });

    it('should return status for unverified user with pending application', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ tier: 'standard' })
      } as any);

      const mockApplication = { id: 'app-123', status: 'pending' };
      jest.spyOn(service as any, 'getUserPendingApplication').mockResolvedValue(mockApplication);
      jest.spyOn(service, 'checkEligibility').mockResolvedValue({ isEligible: true } as any);

      const status = await service.getUserVerificationStatus(testUserId);

      expect(status.isVerified).toBe(false);
      expect(status.currentApplication).toEqual(mockApplication);
    });
  });

  describe('reviewApplication', () => {
    const mockApplicationId = 'app-123';

    it('should approve application and update user tier', async () => {
      mockRunTransaction.mockImplementation(async (db, updateFunction) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => mockApplication
          }),
          update: jest.fn()
        };
        await updateFunction(mockTransaction);
        return { success: true, message: 'Application approved successfully' };
      });

      const result = await service.reviewApplication(
        mockApplicationId,
        testAdminId,
        'approve',
        'Looks good!'
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Application approved successfully');
    });

    it('should reject application', async () => {
      mockRunTransaction.mockImplementation(async (db, updateFunction) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => mockApplication
          }),
          update: jest.fn()
        };
        await updateFunction(mockTransaction);
        return { success: true, message: 'Application rejected successfully' };
      });

      const result = await service.reviewApplication(
        mockApplicationId,
        testAdminId,
        'reject',
        'Needs improvement'
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Application rejected successfully');
    });
  });

  describe('getPendingApplications', () => {
    it('should return pending applications', async () => {
      const mockApplications = [
        { id: 'app-1', status: 'pending', userId: 'user-1' },
        { id: 'app-2', status: 'pending', userId: 'user-2' }
      ];

      mockGetDocs.mockResolvedValue({
        docs: mockApplications.map(app => ({
          data: () => app
        }))
      } as any);

      const applications = await service.getPendingApplications();

      expect(applications).toEqual(mockApplications);
      expect(applications).toHaveLength(2);
    });

    it('should handle empty results', async () => {
      mockGetDocs.mockResolvedValue({
        docs: []
      } as any);

      const applications = await service.getPendingApplications();

      expect(applications).toEqual([]);
    });
  });

  describe('getVerificationStatistics', () => {
    it('should return correct statistics', async () => {
      const mockApplications = [
        { status: 'pending', appliedAt: { toMillis: () => Date.now() } },
        { status: 'approved', appliedAt: { toMillis: () => Date.now() - 1000 } },
        { status: 'approved', appliedAt: { toMillis: () => Date.now() - 2000 } },
        { status: 'rejected', appliedAt: { toMillis: () => Date.now() - 3000 } }
      ];

      mockGetDocs.mockResolvedValue({
        docs: mockApplications.map(app => ({
          data: () => app
        }))
      } as any);

      const stats = await service.getVerificationStatistics();

      expect(stats.totalApplications).toBe(4);
      expect(stats.pendingApplications).toBe(1);
      expect(stats.approvedApplications).toBe(2);
      expect(stats.rejectedApplications).toBe(1);
      expect(stats.approvalRate).toBe(67); // 2/(2+1) * 100 = 66.67% rounded to 67%
      expect(stats.recentApplications).toHaveLength(4);
    });

    it('should handle empty statistics', async () => {
      mockGetDocs.mockResolvedValue({
        docs: []
      } as any);

      const stats = await service.getVerificationStatistics();

      expect(stats.totalApplications).toBe(0);
      expect(stats.pendingApplications).toBe(0);
      expect(stats.approvedApplications).toBe(0);
      expect(stats.rejectedApplications).toBe(0);
      expect(stats.approvalRate).toBe(0);
      expect(stats.recentApplications).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle Firebase errors gracefully', async () => {
      // Reset mocks and make getUserProgress fail
      jest.clearAllMocks();
      mockXpService.getUserProgress.mockRejectedValue(new Error('Firebase error'));

      await expect(service.checkEligibility(testUserId)).rejects.toThrow('Firebase error');
    });

    it('should handle submission errors gracefully', async () => {
      jest.spyOn(service, 'checkEligibility').mockResolvedValue({ isEligible: true } as any);
      jest.spyOn(service as any, 'getUserPendingApplication').mockResolvedValue(null);
      mockSetDoc.mockRejectedValue(new Error('Write failed'));

      const result = await service.submitApplication(testUserId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to submit verification application');
    });
  });

  describe('Helper Methods', () => {
    describe('calculateProfileCompleteness', () => {
      it('should calculate correct completeness percentage', () => {
        const userData = {
          name: 'Test User',
          bio: 'Test bio',
          profilePicture: 'test.jpg',
          location: 'Test City',
          skills: ['skill1'],
          portfolio: ['work1'],
          pricing: '$50/hour'
        };

        const completeness = (service as any).calculateProfileCompleteness(userData);
        expect(completeness).toBe(100);
      });

      it('should handle incomplete profile', () => {
        const userData = {
          name: 'Test User',
          bio: '',
          profilePicture: 'test.jpg',
          location: '',
          skills: [],
          portfolio: null,
          pricing: '$50/hour'
        };

        const completeness = (service as any).calculateProfileCompleteness(userData);
        expect(completeness).toBe(43); // 3/7 fields = 42.86% rounded to 43%
      });
    });
  });
});
