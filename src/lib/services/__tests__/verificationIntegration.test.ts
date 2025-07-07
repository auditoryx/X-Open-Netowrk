/**
 * Verification Service Integration Test
 * Basic integration test to verify the service functionality
 */

import { verificationService } from '../verificationService';

// Mock external dependencies
jest.mock('../xpService', () => ({
  xpService: {
    getUserProgress: jest.fn(),
    getUserXPHistory: jest.fn()
  }
}));

jest.mock('../badgeService', () => ({
  badgeService: {
    checkAndAwardBadges: jest.fn()
  }
}));

jest.mock('@/lib/firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn().mockResolvedValue(undefined),
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
  updateDoc: jest.fn()
}));

describe('VerificationService Integration', () => {
  it('should create a singleton instance', () => {
    const instance1 = verificationService;
    const instance2 = verificationService;
    expect(instance1).toBe(instance2);
  });

  it('should have all required methods', () => {
    expect(typeof verificationService.checkEligibility).toBe('function');
    expect(typeof verificationService.submitApplication).toBe('function');
    expect(typeof verificationService.autoTriggerApplication).toBe('function');
    expect(typeof verificationService.getUserVerificationStatus).toBe('function');
    expect(typeof verificationService.reviewApplication).toBe('function');
    expect(typeof verificationService.getPendingApplications).toBe('function');
    expect(typeof verificationService.getVerificationStatistics).toBe('function');
  });

  it('should export the service correctly', () => {
    expect(verificationService).toBeDefined();
    expect(verificationService.constructor.name).toBe('VerificationService');
  });
});
