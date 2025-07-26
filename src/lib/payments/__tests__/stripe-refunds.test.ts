import { StripeRefundService } from '../stripe-refunds';

// Mock the external dependencies
jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    doc: jest.fn(() => ({
      get: jest.fn(),
      update: jest.fn()
    })),
    collection: jest.fn(() => ({
      add: jest.fn()
    }))
  }
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    refunds: {
      create: jest.fn()
    },
    paymentIntents: {
      cancel: jest.fn()
    }
  }));
});

// Mock the escrow service
jest.mock('../escrow', () => ({
  EscrowService: jest.fn().mockImplementation(() => ({
    getEscrowStatus: jest.fn()
  }))
}));

describe('StripeRefundService', () => {
  let refundService: StripeRefundService;
  let mockAdminDb: any;
  let mockStripe: any;
  let mockEscrowService: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    refundService = new StripeRefundService();
    
    // Get mock references
    mockAdminDb = require('@/lib/firebase-admin').adminDb;
    const Stripe = require('stripe');
    mockStripe = new Stripe();
    
    // Mock escrow service instance
    mockEscrowService = {
      getEscrowStatus: jest.fn()
    };
    
    // Replace the instance property
    (refundService as any).escrowService = mockEscrowService;
  });

  describe('getRefundPreview', () => {
    it('should return correct refund preview for valid booking', async () => {
      // Mock booking document
      mockAdminDb.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            datetime: '2024-12-31T14:00:00Z',
            providerId: 'provider_123',
            clientId: 'client_123',
            creatorTier: 'standard'
          })
        })
      });

      // Mock escrow service
      const mockEscrow = {
        amount: 100,
        currency: 'usd',
        status: 'held'
      };
      
      mockEscrowService.getEscrowStatus.mockResolvedValue(mockEscrow);

      const preview = await refundService.getRefundPreview('booking_123');

      expect(preview).toHaveProperty('canRefund');
      expect(preview).toHaveProperty('refundAmount');
      expect(preview).toHaveProperty('processingFee');
      expect(preview).toHaveProperty('refundPercentage');
      expect(preview).toHaveProperty('reason');
      expect(preview).toHaveProperty('hoursUntilBooking');
    });

    it('should throw error for non-existent booking', async () => {
      mockAdminDb.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false
        })
      });

      await expect(refundService.getRefundPreview('invalid_booking')).rejects.toThrow('Booking not found');
    });
  });

  describe('processRefund', () => {
    const sampleRequest = {
      bookingId: 'booking_123',
      userId: 'client_123',
      reason: 'Test cancellation'
    };

    it('should process refund successfully for held escrow', async () => {
      // Mock booking document
      mockAdminDb.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            datetime: '2024-12-31T14:00:00Z',
            providerId: 'provider_123',
            clientId: 'client_123',
            status: 'confirmed',
            creatorTier: 'standard'
          })
        }),
        update: jest.fn()
      });

      // Mock escrow
      const mockEscrow = {
        amount: 100,
        currency: 'usd',
        status: 'held',
        paymentIntentId: 'pi_123',
        providerId: 'provider_123',
        customerId: 'client_123'
      };
      
      mockEscrowService.getEscrowStatus.mockResolvedValue(mockEscrow);

      // Mock Stripe refund
      mockStripe.refunds.create.mockResolvedValue({
        id: 'ref_123',
        amount: 10000 // $100 in cents
      });

      // Mock notification collection
      mockAdminDb.collection.mockReturnValue({
        add: jest.fn()
      });

      const result = await refundService.processRefund(sampleRequest);

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('ref_123');
      expect(result.refundAmount).toBeGreaterThan(0);
      expect(mockStripe.refunds.create).toHaveBeenCalled();
    });

    it('should reject unauthorized refund requests', async () => {
      mockAdminDb.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            datetime: '2024-12-31T14:00:00Z',
            providerId: 'provider_123',
            clientId: 'client_123',
            status: 'confirmed'
          })
        })
      });

      const unauthorizedRequest = {
        ...sampleRequest,
        userId: 'unauthorized_user'
      };

      const result = await refundService.processRefund(unauthorizedRequest);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unauthorized');
    });
  });
});