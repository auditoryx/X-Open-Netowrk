/**
 * Badge Integration Tests
 * Tests badge awarding in real booking and review scenarios
 */

import { badgeService } from '../badgeService';
import { enhancedXPService } from '../enhancedXPService';

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

// Mock services
jest.mock('../xpService', () => ({
  xpService: {
    getUserProgress: jest.fn(),
    getUserXPHistory: jest.fn()
  }
}));

jest.mock('../xpValidationService', () => ({
  xpValidationService: {
    validateAndAwardXP: jest.fn()
  }
}));

jest.mock('../performanceMonitoringService', () => ({
  performanceMonitoringService: {
    measureXPOperation: jest.fn()
  }
}));

describe('Badge Integration', () => {
  const mockUserId = 'test-user-123';
  const mockBookingId = 'booking-456';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset badge service state
    (badgeService as any).definitionsLoaded = false;
    (badgeService as any).badgeDefinitions.clear();
  });

  describe('First Booking Completion', () => {
    it('should award Session Starter badge on first booking completion', async () => {
      // Mock user with no previous bookings
      const { xpService } = require('../xpService');
      xpService.getUserProgress.mockResolvedValue({
        totalXP: 100,
        tier: 'standard'
      });
      xpService.getUserXPHistory.mockResolvedValue([
        { event: 'bookingCompleted', xp: 100 }
      ]);

      // Mock validation service
      const { xpValidationService } = require('../xpValidationService');
      xpValidationService.validateAndAwardXP.mockResolvedValue({
        success: true,
        xpAwarded: 100,
        message: 'XP awarded for booking completion'
      });

      // Mock performance monitoring
      const { performanceMonitoringService } = require('../performanceMonitoringService');
      performanceMonitoringService.measureXPOperation.mockImplementation(async (name, operation) => {
        return await operation();
      });

      // Mock Firestore operations
      const setDoc = require('firebase/firestore').setDoc;
      const getDoc = require('firebase/firestore').getDoc;
      const runTransaction = require('firebase/firestore').runTransaction;
      
      setDoc.mockResolvedValue(undefined);
      getDoc.mockResolvedValue({ exists: () => false });
      runTransaction.mockImplementation(async (db, callback) => {
        return await callback({
          get: jest.fn().mockResolvedValue({ exists: () => false }),
          set: jest.fn()
        });
      });

      // Award XP for booking completion (this should trigger badge checking)
      const result = await enhancedXPService.awardXP(
        mockUserId,
        'bookingCompleted',
        {
          contextId: `booking-${mockBookingId}`,
          metadata: {
            bookingId: mockBookingId,
            source: 'booking_completion_test'
          }
        }
      );

      expect(result.success).toBe(true);
      expect(result.xpAwarded).toBe(100);
      expect(result.badges).toContain('session_starter');
    });
  });

  describe('Five Star Review', () => {
    it('should award Certified Mix badge on first 5-star review', async () => {
      // Mock user with existing booking but no 5-star reviews
      const { xpService } = require('../xpService');
      xpService.getUserProgress.mockResolvedValue({
        totalXP: 130,
        tier: 'standard'
      });
      xpService.getUserXPHistory.mockResolvedValue([
        { event: 'bookingCompleted', xp: 100 },
        { event: 'fiveStarReview', xp: 30 }
      ]);

      // Mock validation service
      const { xpValidationService } = require('../xpValidationService');
      xpValidationService.validateAndAwardXP.mockResolvedValue({
        success: true,
        xpAwarded: 30,
        message: 'XP awarded for five-star review'
      });

      // Mock performance monitoring
      const { performanceMonitoringService } = require('../performanceMonitoringService');
      performanceMonitoringService.measureXPOperation.mockImplementation(async (name, operation) => {
        return await operation();
      });

      // Mock Firestore operations
      const setDoc = require('firebase/firestore').setDoc;
      const getDoc = require('firebase/firestore').getDoc;
      const runTransaction = require('firebase/firestore').runTransaction;
      
      setDoc.mockResolvedValue(undefined);
      getDoc.mockResolvedValue({ exists: () => false });
      runTransaction.mockImplementation(async (db, callback) => {
        return await callback({
          get: jest.fn().mockResolvedValue({ exists: () => false }),
          set: jest.fn()
        });
      });

      // Award XP for five-star review
      const result = await enhancedXPService.awardXP(
        mockUserId,
        'fiveStarReview',
        {
          contextId: `review-${mockBookingId}`,
          metadata: {
            bookingId: mockBookingId,
            rating: 5,
            source: 'review_submission_test'
          }
        }
      );

      expect(result.success).toBe(true);
      expect(result.xpAwarded).toBe(30);
      expect(result.badges).toContain('certified_mix');
    });
  });

  describe('Multiple Bookings', () => {
    it('should award Studio Regular badge after 10 bookings', async () => {
      // Mock user with 10 completed bookings
      const { xpService } = require('../xpService');
      xpService.getUserProgress.mockResolvedValue({
        totalXP: 1000,
        tier: 'standard'
      });
      
      // Generate 10 booking completion XP transactions
      const xpHistory = Array.from({ length: 10 }, (_, i) => ({
        event: 'bookingCompleted',
        xp: 100
      }));
      xpService.getUserXPHistory.mockResolvedValue(xpHistory);

      // Mock validation service
      const { xpValidationService } = require('../xpValidationService');
      xpValidationService.validateAndAwardXP.mockResolvedValue({
        success: true,
        xpAwarded: 100,
        message: 'XP awarded for 10th booking completion'
      });

      // Mock performance monitoring
      const { performanceMonitoringService } = require('../performanceMonitoringService');
      performanceMonitoringService.measureXPOperation.mockImplementation(async (name, operation) => {
        return await operation();
      });

      // Mock Firestore operations
      const setDoc = require('firebase/firestore').setDoc;
      const getDoc = require('firebase/firestore').getDoc;
      const runTransaction = require('firebase/firestore').runTransaction;
      
      setDoc.mockResolvedValue(undefined);
      getDoc.mockResolvedValue({ exists: () => false });
      runTransaction.mockImplementation(async (db, callback) => {
        return await callback({
          get: jest.fn().mockResolvedValue({ exists: () => false }),
          set: jest.fn()
        });
      });

      // Award XP for 10th booking completion
      const result = await enhancedXPService.awardXP(
        mockUserId,
        'bookingCompleted',
        {
          contextId: `booking-${mockBookingId}-10`,
          metadata: {
            bookingId: `${mockBookingId}-10`,
            bookingCount: 10,
            source: 'booking_completion_milestone'
          }
        }
      );

      expect(result.success).toBe(true);
      expect(result.xpAwarded).toBe(100);
      expect(result.badges).toContain('studio_regular');
    });
  });

  describe('Badge Progress Tracking', () => {
    it('should show correct progress toward Studio Regular badge', async () => {
      // Mock user with 7 completed bookings
      const { xpService } = require('../xpService');
      xpService.getUserProgress.mockResolvedValue({
        totalXP: 700,
        tier: 'standard'
      });
      
      const xpHistory = Array.from({ length: 7 }, () => ({
        event: 'bookingCompleted',
        xp: 100
      }));
      xpService.getUserXPHistory.mockResolvedValue(xpHistory);

      // Mock no existing badges
      const getDocs = require('firebase/firestore').getDocs;
      getDocs.mockResolvedValue({ docs: [] });

      // Initialize badge definitions
      const setDoc = require('firebase/firestore').setDoc;
      setDoc.mockResolvedValue(undefined);

      const progress = await badgeService.getUserBadgeProgress(mockUserId);
      
      const studioRegular = progress.find(p => p.badgeId === 'studio_regular');
      expect(studioRegular).toBeDefined();
      expect(studioRegular?.progress.current).toBe(7);
      expect(studioRegular?.progress.target).toBe(10);
      expect(studioRegular?.progress.percentage).toBe(70);
      expect(studioRegular?.isEarned).toBe(false);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle badge service errors gracefully during XP award', async () => {
      // Mock successful XP award
      const { xpValidationService } = require('../xpValidationService');
      xpValidationService.validateAndAwardXP.mockResolvedValue({
        success: true,
        xpAwarded: 100,
        message: 'XP awarded successfully'
      });

      // Mock performance monitoring
      const { performanceMonitoringService } = require('../performanceMonitoringService');
      performanceMonitoringService.measureXPOperation.mockImplementation(async (name, operation) => {
        return await operation();
      });

      // Mock badge service to fail
      const originalCheckAndAwardBadges = badgeService.checkAndAwardBadges;
      (badgeService.checkAndAwardBadges as jest.Mock) = jest.fn().mockRejectedValue(
        new Error('Badge service temporarily unavailable')
      );

      const result = await enhancedXPService.awardXP(mockUserId, 'bookingCompleted');

      expect(result.success).toBe(true);
      expect(result.xpAwarded).toBe(100);
      expect(result.badges).toBeUndefined();
      
      // Restore original method
      badgeService.checkAndAwardBadges = originalCheckAndAwardBadges;
    });
  });
});
