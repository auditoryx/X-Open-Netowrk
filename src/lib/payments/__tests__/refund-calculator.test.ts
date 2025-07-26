/**
 * Tests for Refund Calculator
 */

import {
  calculateRefund,
  canCancelBooking,
  formatRefundSummary,
  getCancellationPolicyDescription,
  CANCELLATION_POLICIES,
  type BookingForCancellation
} from '../refund-calculator';

describe('Refund Calculator', () => {
  const mockBooking: BookingForCancellation = {
    id: 'test-booking-123',
    amount: 100.00,
    currency: 'usd',
    scheduledDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    status: 'confirmed',
    paymentIntentId: 'pi_test123',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Created 24 hours ago
  };

  describe('calculateRefund', () => {
    it('should calculate 100% refund for cancellations 72+ hours before booking', () => {
      const bookingIn72Hours = {
        ...mockBooking,
        scheduledDateTime: new Date(Date.now() + 72 * 60 * 60 * 1000)
      };
      
      const result = calculateRefund(bookingIn72Hours);
      
      expect(result.refundPercentage).toBe(100);
      expect(result.refundAmount).toBe(100.00);
      expect(result.policyApplied.description).toContain('Full refund');
    });

    it('should calculate 75% refund for cancellations 48-72 hours before booking', () => {
      const bookingIn60Hours = {
        ...mockBooking,
        scheduledDateTime: new Date(Date.now() + 60 * 60 * 60 * 1000)
      };
      
      const result = calculateRefund(bookingIn60Hours);
      
      expect(result.refundPercentage).toBe(75);
      expect(result.refundAmount).toBe(75.00);
      expect(result.policyApplied.description).toContain('75% refund');
    });

    it('should calculate 50% refund for cancellations 24-48 hours before booking', () => {
      const bookingIn36Hours = {
        ...mockBooking,
        scheduledDateTime: new Date(Date.now() + 36 * 60 * 60 * 1000)
      };
      
      const result = calculateRefund(bookingIn36Hours);
      
      expect(result.refundPercentage).toBe(50);
      expect(result.refundAmount).toBe(50.00);
      expect(result.policyApplied.description).toContain('50% refund');
    });

    it('should calculate 25% refund for cancellations 2-24 hours before booking', () => {
      const bookingIn12Hours = {
        ...mockBooking,
        scheduledDateTime: new Date(Date.now() + 12 * 60 * 60 * 1000)
      };
      
      const result = calculateRefund(bookingIn12Hours);
      
      expect(result.refundPercentage).toBe(25);
      expect(result.refundAmount).toBe(25.00);
      expect(result.policyApplied.description).toContain('25% refund');
    });

    it('should calculate 0% refund for cancellations less than 2 hours before booking', () => {
      const bookingIn1Hour = {
        ...mockBooking,
        scheduledDateTime: new Date(Date.now() + 1 * 60 * 60 * 1000)
      };
      
      const result = calculateRefund(bookingIn1Hour);
      
      expect(result.refundPercentage).toBe(0);
      expect(result.refundAmount).toBe(0);
      expect(result.policyApplied.description).toContain('No refund');
    });

    it('should calculate platform fee refund proportionally', () => {
      const result = calculateRefund(mockBooking);
      
      // 50% refund means 50% of platform fee (20% of original) should be refunded
      const expectedPlatformFeeRefund = (100 * 0.20 * 0.50);
      expect(result.platformFeeRefund).toBe(expectedPlatformFeeRefund);
    });

    it('should calculate processing fee as 3% of refund amount, capped at $5', () => {
      const largeBooking = {
        ...mockBooking,
        amount: 1000.00,
        scheduledDateTime: new Date(Date.now() + 72 * 60 * 60 * 1000) // 100% refund
      };
      
      const result = calculateRefund(largeBooking);
      
      // 3% of $1000 = $30, but should be capped at $5
      expect(result.processingFee).toBe(5.00);
    });

    it('should include cancellation reason in result', () => {
      const reason = 'Emergency came up';
      const result = calculateRefund(mockBooking, new Date(), reason);
      
      expect(result.cancellationReason).toBe(reason);
    });

    it('should throw error for past bookings', () => {
      const pastBooking = {
        ...mockBooking,
        scheduledDateTime: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      };
      
      expect(() => calculateRefund(pastBooking)).toThrow('Cannot cancel past bookings');
    });

    it('should throw error for already cancelled bookings', () => {
      const cancelledBooking = {
        ...mockBooking,
        status: 'cancelled' as const
      };
      
      expect(() => calculateRefund(cancelledBooking)).toThrow('Cannot cancel booking with status: cancelled');
    });

    it('should throw error for completed bookings', () => {
      const completedBooking = {
        ...mockBooking,
        status: 'completed' as const
      };
      
      expect(() => calculateRefund(completedBooking)).toThrow('Cannot cancel booking with status: completed');
    });
  });

  describe('canCancelBooking', () => {
    it('should allow cancellation for confirmed future bookings', () => {
      const result = canCancelBooking(mockBooking);
      
      expect(result.canCancel).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should not allow cancellation for already cancelled bookings', () => {
      const cancelledBooking = {
        ...mockBooking,
        status: 'cancelled' as const
      };
      
      const result = canCancelBooking(cancelledBooking);
      
      expect(result.canCancel).toBe(false);
      expect(result.reason).toBe('Booking is already cancelled');
    });

    it('should not allow cancellation for completed bookings', () => {
      const completedBooking = {
        ...mockBooking,
        status: 'completed' as const
      };
      
      const result = canCancelBooking(completedBooking);
      
      expect(result.canCancel).toBe(false);
      expect(result.reason).toBe('Cannot cancel completed booking');
    });

    it('should not allow cancellation for past bookings', () => {
      const pastBooking = {
        ...mockBooking,
        scheduledDateTime: new Date(Date.now() - 60 * 60 * 1000)
      };
      
      const result = canCancelBooking(pastBooking);
      
      expect(result.canCancel).toBe(false);
      expect(result.reason).toBe('Cannot cancel past bookings');
    });
  });

  describe('formatRefundSummary', () => {
    it('should format refund summary with correct net refund calculation', () => {
      const calculation = calculateRefund(mockBooking);
      const summary = formatRefundSummary(calculation);
      
      expect(summary.summary).toContain('50% refund');
      expect(summary.netRefund).toBe(calculation.refundAmount - calculation.processingFee);
      expect(summary.details).toContain(`Original amount: $${calculation.originalAmount.toFixed(2)}`);
      expect(summary.details).toContain(`Refund percentage: ${calculation.refundPercentage}%`);
    });

    it('should handle zero refund scenarios', () => {
      const noRefundBooking = {
        ...mockBooking,
        scheduledDateTime: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour from now
      };
      
      const calculation = calculateRefund(noRefundBooking);
      const summary = formatRefundSummary(calculation);
      
      expect(summary.netRefund).toBe(0);
      expect(summary.summary).toContain('0% refund');
    });

    it('should not show processing fee when it is zero', () => {
      const noRefundBooking = {
        ...mockBooking,
        scheduledDateTime: new Date(Date.now() + 1 * 60 * 60 * 1000) // 0% refund
      };
      
      const calculation = calculateRefund(noRefundBooking);
      const summary = formatRefundSummary(calculation);
      
      expect(summary.details.some(detail => detail?.includes('Processing fee'))).toBe(false);
    });
  });

  describe('getCancellationPolicyDescription', () => {
    it('should return correct policy description for given time', () => {
      expect(getCancellationPolicyDescription(80)).toContain('Full refund');
      expect(getCancellationPolicyDescription(60)).toContain('75% refund');
      expect(getCancellationPolicyDescription(36)).toContain('50% refund');
      expect(getCancellationPolicyDescription(12)).toContain('25% refund');
      expect(getCancellationPolicyDescription(1)).toContain('No refund');
    });
  });

  describe('CANCELLATION_POLICIES', () => {
    it('should have policies in descending order of hours', () => {
      for (let i = 0; i < CANCELLATION_POLICIES.length - 1; i++) {
        expect(CANCELLATION_POLICIES[i].hoursBeforeBooking)
          .toBeGreaterThan(CANCELLATION_POLICIES[i + 1].hoursBeforeBooking);
      }
    });

    it('should have refund percentages that make business sense', () => {
      CANCELLATION_POLICIES.forEach(policy => {
        expect(policy.refundPercentage).toBeGreaterThanOrEqual(0);
        expect(policy.refundPercentage).toBeLessThanOrEqual(100);
      });
    });

    it('should have meaningful descriptions', () => {
      CANCELLATION_POLICIES.forEach(policy => {
        expect(policy.description).toBeTruthy();
        expect(policy.description.length).toBeGreaterThan(10);
      });
    });
  });
});