/**
 * Tests for Stripe Identity KYC service
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import {
  startVerification,
  getVerificationSession,
  cancelVerification,
  processVerificationWebhook,
  getVerificationRequirements,
  canUpgradeToTier,
} from '../stripe-identity';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    identity: {
      verificationSessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
        cancel: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.STRIPE_IDENTITY_WEBHOOK_SECRET = 'whsec_test_secret';

describe('Stripe Identity KYC Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startVerification', () => {
    test('should create verification session successfully', async () => {
      const mockSession = {
        id: 'vs_test_123',
        client_secret: 'vs_test_123_secret',
        url: 'https://verify.stripe.com/test',
        status: 'requires_input',
        metadata: {},
      };

      const Stripe = require('stripe');
      const mockStripe = new Stripe();
      mockStripe.identity.verificationSessions.create.mockResolvedValue(mockSession);

      const result = await startVerification('user_123');

      expect(result).toEqual({
        id: 'vs_test_123',
        client_secret: 'vs_test_123_secret',
        url: 'https://verify.stripe.com/test',
        status: 'requires_input',
        metadata: {},
      });

      expect(mockStripe.identity.verificationSessions.create).toHaveBeenCalledWith({
        type: 'document',
        metadata: {
          userId: 'user_123',
          platform: 'auditoryx-on',
          timestamp: expect.any(String),
        },
        options: {
          document: {
            allowed_types: ['driving_license', 'passport', 'id_card'],
            require_live_capture: true,
            require_matching_selfie: true,
          },
        },
        return_url: 'http://localhost:3000/verification/pending',
      });
    });

    test('should handle Stripe errors', async () => {
      const Stripe = require('stripe');
      const mockStripe = new Stripe();
      mockStripe.identity.verificationSessions.create.mockRejectedValue(
        new Error('Stripe API error')
      );

      await expect(startVerification('user_123')).rejects.toThrow(
        'Failed to start verification session'
      );
    });
  });

  describe('getVerificationSession', () => {
    test('should retrieve verification session', async () => {
      const mockSession = {
        id: 'vs_test_123',
        client_secret: 'vs_test_123_secret',
        url: 'https://verify.stripe.com/test',
        status: 'verified',
        metadata: { userId: 'user_123' },
      };

      const Stripe = require('stripe');
      const mockStripe = new Stripe();
      mockStripe.identity.verificationSessions.retrieve.mockResolvedValue(mockSession);

      const result = await getVerificationSession('vs_test_123');

      expect(result).toEqual({
        id: 'vs_test_123',
        client_secret: 'vs_test_123_secret',
        url: 'https://verify.stripe.com/test',
        status: 'verified',
        metadata: { userId: 'user_123' },
      });
    });

    test('should return null on Stripe error', async () => {
      const Stripe = require('stripe');
      const mockStripe = new Stripe();
      mockStripe.identity.verificationSessions.retrieve.mockRejectedValue(
        new Error('Not found')
      );

      const result = await getVerificationSession('invalid_session');
      expect(result).toBeNull();
    });
  });

  describe('cancelVerification', () => {
    test('should cancel verification session', async () => {
      const Stripe = require('stripe');
      const mockStripe = new Stripe();
      mockStripe.identity.verificationSessions.cancel.mockResolvedValue({});

      const result = await cancelVerification('vs_test_123');
      expect(result).toBe(true);
    });

    test('should return false on error', async () => {
      const Stripe = require('stripe');
      const mockStripe = new Stripe();
      mockStripe.identity.verificationSessions.cancel.mockRejectedValue(
        new Error('Failed to cancel')
      );

      const result = await cancelVerification('vs_test_123');
      expect(result).toBe(false);
    });
  });

  describe('processVerificationWebhook', () => {
    test('should process verified webhook event', async () => {
      const mockEvent = {
        type: 'identity.verification_session.verified',
        data: {
          object: {
            id: 'vs_test_123',
            status: 'verified',
            metadata: { userId: 'user_123' },
            created: Math.floor(Date.now() / 1000),
            verified_outputs: {
              document: { type: 'passport' },
            },
          },
        },
      };

      const Stripe = require('stripe');
      const mockStripe = new Stripe();
      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const result = await processVerificationWebhook('webhook_body', 'signature');

      expect(result).toEqual({
        userId: 'user_123',
        sessionId: 'vs_test_123',
        status: 'verified',
        verifiedAt: expect.any(Date),
        rejectedAt: undefined,
        rejectionReason: undefined,
        documentType: 'passport',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    test('should handle invalid webhook', async () => {
      const Stripe = require('stripe');
      const mockStripe = new Stripe();
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const result = await processVerificationWebhook('invalid_body', 'invalid_signature');
      expect(result).toBeNull();
    });
  });

  describe('getVerificationRequirements', () => {
    test('should return signature tier requirements', () => {
      const requirements = getVerificationRequirements('signature');

      expect(requirements).toEqual({
        required: true,
        documentTypes: ['passport', 'driving_license', 'id_card'],
        additionalChecks: ['selfie', 'address_verification'],
      });
    });

    test('should return verified tier requirements', () => {
      const requirements = getVerificationRequirements('verified');

      expect(requirements).toEqual({
        required: true,
        documentTypes: ['driving_license', 'id_card'],
        additionalChecks: ['selfie'],
      });
    });

    test('should return no requirements for standard tier', () => {
      const requirements = getVerificationRequirements('standard');

      expect(requirements).toEqual({
        required: false,
        documentTypes: [],
        additionalChecks: [],
      });
    });
  });

  describe('canUpgradeToTier', () => {
    test('should allow upgrade to standard tier without verification', async () => {
      const result = await canUpgradeToTier('user_123', 'standard', 'unverified');

      expect(result).toEqual({
        canUpgrade: true,
      });
    });

    test('should require verification for verified tier', async () => {
      const result = await canUpgradeToTier('user_123', 'verified', 'unverified');

      expect(result).toEqual({
        canUpgrade: false,
        reason: 'Identity verification required for this tier',
      });
    });

    test('should allow upgrade to verified tier with verification', async () => {
      const result = await canUpgradeToTier('user_123', 'verified', 'verified');

      expect(result).toEqual({
        canUpgrade: true,
      });
    });

    test('should require verification for signature tier', async () => {
      const result = await canUpgradeToTier('user_123', 'signature', 'pending');

      expect(result).toEqual({
        canUpgrade: false,
        reason: 'Identity verification required for this tier',
      });
    });
  });
});