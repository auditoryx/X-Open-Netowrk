import { 
  calculateRefund, 
  canCancelBooking, 
  getCancellationPolicy,
  getPolicySummary,
  DEFAULT_POLICIES,
  BookingData 
} from '../refund-calculator';

describe('Refund Calculator', () => {
  const sampleBooking: BookingData = {
    id: 'booking_123',
    scheduledTime: '2024-12-31T14:00:00Z',
    amount: 100,
    currency: 'usd',
    providerId: 'provider_123',
    clientId: 'client_123',
    creatorTier: 'standard'
  };

  describe('calculateRefund', () => {
    it('should calculate full refund for standard tier 48+ hours before', () => {
      const bookingTime = new Date('2024-12-31T14:00:00Z');
      const cancellationTime = new Date('2024-12-29T14:00:00Z'); // 48 hours before
      
      const result = calculateRefund(sampleBooking, cancellationTime);
      
      expect(result.refundPercentage).toBe(100);
      expect(result.refundAmount).toBeGreaterThan(95); // Should be close to 100 after fees
      expect(result.refundAmount).toBeLessThan(100); // But less due to processing fees
      expect(result.canCancel).toBe(true);
      expect(result.hoursUntilBooking).toBe(48);
    });

    it('should calculate 50% refund for standard tier 24-48 hours before', () => {
      const cancellationTime = new Date('2024-12-30T14:00:00Z'); // 24 hours before
      
      const result = calculateRefund(sampleBooking, cancellationTime);
      
      expect(result.refundPercentage).toBe(50);
      expect(result.refundAmount).toBeGreaterThan(45); // Should be close to 50 after fees
      expect(result.refundAmount).toBeLessThan(50); // But less due to processing fees
      expect(result.canCancel).toBe(true);
      expect(result.hoursUntilBooking).toBe(24);
    });

    it('should calculate no refund for standard tier less than 24 hours before', () => {
      const cancellationTime = new Date('2024-12-31T02:00:00Z'); // 12 hours before
      
      const result = calculateRefund(sampleBooking, cancellationTime);
      
      expect(result.refundPercentage).toBe(0);
      expect(result.refundAmount).toBe(0);
      expect(result.canCancel).toBe(true);
      expect(result.hoursUntilBooking).toBe(12);
    });

    it('should not allow cancellation after booking time', () => {
      const cancellationTime = new Date('2025-01-01T14:00:00Z'); // After booking
      
      const result = calculateRefund(sampleBooking, cancellationTime);
      
      expect(result.canCancel).toBe(false);
      expect(result.hoursUntilBooking).toBe(0);
    });

    it('should apply processing fees correctly', () => {
      const cancellationTime = new Date('2024-12-30T14:00:00Z'); // 24 hours before, 50% refund
      
      const result = calculateRefund(sampleBooking, cancellationTime);
      
      expect(result.processingFee).toBeGreaterThan(0);
      expect(result.refundAmount).toBeLessThan(50); // Should be less due to processing fee
    });

    it('should work with verified tier policy', () => {
      const verifiedBooking: BookingData = {
        ...sampleBooking,
        creatorTier: 'verified'
      };
      
      const cancellationTime = new Date('2024-12-28T14:00:00Z'); // 72 hours before
      
      const result = calculateRefund(verifiedBooking, cancellationTime);
      
      expect(result.refundPercentage).toBe(100);
      expect(result.canCancel).toBe(true);
    });

    it('should work with signature tier policy', () => {
      const signatureBooking: BookingData = {
        ...sampleBooking,
        creatorTier: 'signature'
      };
      
      const cancellationTime = new Date('2024-12-24T14:00:00Z'); // 7 days before
      
      const result = calculateRefund(signatureBooking, cancellationTime);
      
      expect(result.refundPercentage).toBe(100);
      expect(result.canCancel).toBe(true);
    });

    it('should handle different amounts correctly', () => {
      const expensiveBooking: BookingData = {
        ...sampleBooking,
        amount: 500
      };
      
      const cancellationTime = new Date('2024-12-29T14:00:00Z'); // 48 hours before, 100% refund
      
      const result = calculateRefund(expensiveBooking, cancellationTime);
      
      expect(result.refundPercentage).toBe(100);
      expect(result.refundAmount).toBeGreaterThan(480); // Should be close to 500 after fees
      expect(result.refundAmount).toBeLessThan(500); // But less due to processing fees
    });

    it('should round refund amounts to 2 decimal places', () => {
      const oddAmountBooking: BookingData = {
        ...sampleBooking,
        amount: 33.33
      };
      
      const cancellationTime = new Date('2024-12-30T14:00:00Z'); // 50% refund
      
      const result = calculateRefund(oddAmountBooking, cancellationTime);
      
      expect(result.refundAmount).toEqual(
        Math.round(result.refundAmount * 100) / 100
      );
    });
  });

  describe('canCancelBooking', () => {
    it('should return true when cancellation is allowed', () => {
      const cancellationTime = new Date('2024-12-29T14:00:00Z');
      
      const canCancel = canCancelBooking(sampleBooking, cancellationTime);
      
      expect(canCancel).toBe(true);
    });

    it('should return false when booking has passed', () => {
      const cancellationTime = new Date('2025-01-01T14:00:00Z');
      
      const canCancel = canCancelBooking(sampleBooking, cancellationTime);
      
      expect(canCancel).toBe(false);
    });
  });

  describe('getCancellationPolicy', () => {
    it('should return standard policy by default', () => {
      const policy = getCancellationPolicy();
      
      expect(policy).toEqual(DEFAULT_POLICIES.standard);
    });

    it('should return correct policy for each tier', () => {
      expect(getCancellationPolicy('verified')).toEqual(DEFAULT_POLICIES.verified);
      expect(getCancellationPolicy('signature')).toEqual(DEFAULT_POLICIES.signature);
    });

    it('should fall back to standard for invalid tier', () => {
      const policy = getCancellationPolicy('invalid_tier');
      
      expect(policy).toEqual(DEFAULT_POLICIES.standard);
    });
  });

  describe('getPolicySummary', () => {
    it('should return readable summary for standard tier', () => {
      const summary = getPolicySummary('standard');
      
      expect(summary).toContain('48+ hours before: 100% refund');
      expect(summary).toContain('24+ hours before: 50% refund');
      expect(summary).toContain('Less than 24 hours: 0% refund');
    });

    it('should return different summary for verified tier', () => {
      const summary = getPolicySummary('verified');
      
      expect(summary).toContain('72+ hours before: 100% refund');
      expect(summary).toContain('48+ hours before: 75% refund');
    });

    it('should return different summary for signature tier', () => {
      const summary = getPolicySummary('signature');
      
      expect(summary).toContain('168+ hours before: 100% refund');
      expect(summary).toContain('72+ hours before: 75% refund');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amount booking', () => {
      const freeBooking: BookingData = {
        ...sampleBooking,
        amount: 0
      };
      
      const cancellationTime = new Date('2024-12-29T14:00:00Z');
      const result = calculateRefund(freeBooking, cancellationTime);
      
      expect(result.refundAmount).toBe(0);
      expect(result.canCancel).toBe(true);
    });

    it('should handle invalid scheduled time', () => {
      const invalidBooking: BookingData = {
        ...sampleBooking,
        scheduledTime: 'invalid-date'
      };
      
      // Should still work due to Date constructor handling, but result will be NaN hours
      const result = calculateRefund(invalidBooking);
      expect(isNaN(result.hoursUntilBooking)).toBe(true);
    });

    it('should validate booking data schema', () => {
      const invalidBooking = {
        id: 'booking_123',
        // Missing required fields
      };
      
      expect(() => {
        calculateRefund(invalidBooking as BookingData);
      }).toThrow();
    });
  });
});

describe('Cancellation Policies', () => {
  describe('DEFAULT_POLICIES', () => {
    it('should have all required tiers', () => {
      expect(DEFAULT_POLICIES).toHaveProperty('standard');
      expect(DEFAULT_POLICIES).toHaveProperty('verified');
      expect(DEFAULT_POLICIES).toHaveProperty('signature');
    });

    it('should have properly structured policies', () => {
      Object.values(DEFAULT_POLICIES).forEach(policy => {
        expect(policy).toHaveProperty('id');
        expect(policy).toHaveProperty('name');
        expect(policy).toHaveProperty('description');
        expect(policy).toHaveProperty('rules');
        expect(Array.isArray(policy.rules)).toBe(true);
        
        policy.rules.forEach(rule => {
          expect(rule).toHaveProperty('hoursBeforeBooking');
          expect(rule).toHaveProperty('refundPercentage');
          expect(rule).toHaveProperty('description');
          expect(typeof rule.hoursBeforeBooking).toBe('number');
          expect(typeof rule.refundPercentage).toBe('number');
          expect(rule.refundPercentage).toBeGreaterThanOrEqual(0);
          expect(rule.refundPercentage).toBeLessThanOrEqual(100);
        });
      });
    });

    it('should have rules sorted by time in descending order', () => {
      Object.values(DEFAULT_POLICIES).forEach(policy => {
        for (let i = 0; i < policy.rules.length - 1; i++) {
          expect(policy.rules[i].hoursBeforeBooking).toBeGreaterThanOrEqual(
            policy.rules[i + 1].hoursBeforeBooking
          );
        }
      });
    });
  });
});