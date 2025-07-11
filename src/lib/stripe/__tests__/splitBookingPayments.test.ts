import { describe, it, expect, vi } from 'vitest';
import {
  calculateSplitPayments,
  createPaymentUrls,
  isSplitBookingFullyPaid,
  clientNeedsPayment,
  getClientPaymentStatus,
  formatCurrency,
  calculatePlatformFee
} from '../splitBookingPayments';
import { SplitBooking } from '@/src/lib/types/Booking';

// Mock fetch for the async functions
global.fetch = vi.fn();

describe('calculateSplitPayments', () => {
  it('should calculate split payments correctly', () => {
    const booking: SplitBooking = {
      id: 'test-booking',
      totalCost: 100.00,
      clientAShare: 60.00,
      clientBShare: 40.00,
      clientAUid: 'client-a',
      clientBUid: 'client-b',
      providerId: 'provider-1',
      status: 'confirmed',
      clientAPaymentStatus: 'pending',
      clientBPaymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = calculateSplitPayments(booking);
    
    expect(result.totalCostCents).toBe(10000);
    expect(result.clientAShareCents).toBe(6000);
    expect(result.clientBShareCents).toBe(4000);
    expect(result.clientAShareDollars).toBe(60.00);
    expect(result.clientBShareDollars).toBe(40.00);
    expect(result.totalCostDollars).toBe(100.00);
  });

  it('should handle rounding discrepancies', () => {
    const booking: SplitBooking = {
      id: 'test-booking',
      totalCost: 100.03,
      clientAShare: 60.01,
      clientBShare: 40.02,
      clientAUid: 'client-a',
      clientBUid: 'client-b',
      providerId: 'provider-1',
      status: 'confirmed',
      clientAPaymentStatus: 'pending',
      clientBPaymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = calculateSplitPayments(booking);
    
    expect(result.clientAShareCents + result.clientBShareCents).toBe(result.totalCostCents);
  });
});

describe('createPaymentUrls', () => {
  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          origin: 'https://example.com'
        }
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    if (globalThis.window) {
      delete globalThis.window;
    }
  });

  it('should create correct payment URLs with default base URL', () => {
    const urls = createPaymentUrls('booking-123');
    
    expect(urls.successUrl).toBe('https://example.com/dashboard/bookings/split/booking-123?payment=success');
    expect(urls.cancelUrl).toBe('https://example.com/dashboard/bookings/split/booking-123?payment=cancelled');
    expect(urls.returnUrl).toBe('https://example.com/dashboard/bookings/split/booking-123');
  });

  it('should create correct payment URLs with custom base URL', () => {
    const urls = createPaymentUrls('booking-456', 'https://custom.com');
    
    expect(urls.successUrl).toBe('https://custom.com/dashboard/bookings/split/booking-456?payment=success');
    expect(urls.cancelUrl).toBe('https://custom.com/dashboard/bookings/split/booking-456?payment=cancelled');
    expect(urls.returnUrl).toBe('https://custom.com/dashboard/bookings/split/booking-456');
  });
});

describe('isSplitBookingFullyPaid', () => {
  it('should return true when both clients have paid', () => {
    const booking: SplitBooking = {
      id: 'test-booking',
      totalCost: 100.00,
      clientAShare: 60.00,
      clientBShare: 40.00,
      clientAUid: 'client-a',
      clientBUid: 'client-b',
      providerId: 'provider-1',
      status: 'confirmed',
      clientAPaymentStatus: 'paid',
      clientBPaymentStatus: 'paid',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(isSplitBookingFullyPaid(booking)).toBe(true);
  });

  it('should return false when one or both clients have not paid', () => {
    const booking: SplitBooking = {
      id: 'test-booking',
      totalCost: 100.00,
      clientAShare: 60.00,
      clientBShare: 40.00,
      clientAUid: 'client-a',
      clientBUid: 'client-b',
      providerId: 'provider-1',
      status: 'confirmed',
      clientAPaymentStatus: 'paid',
      clientBPaymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(isSplitBookingFullyPaid(booking)).toBe(false);
  });
});

describe('clientNeedsPayment', () => {
  const baseBooking: SplitBooking = {
    id: 'test-booking',
    totalCost: 100.00,
    clientAShare: 60.00,
    clientBShare: 40.00,
    clientAUid: 'client-a',
    clientBUid: 'client-b',
    providerId: 'provider-1',
    status: 'confirmed',
    clientAPaymentStatus: 'pending',
    clientBPaymentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('should return true when client A needs to pay', () => {
    expect(clientNeedsPayment(baseBooking, 'client-a')).toBe(true);
  });

  it('should return true when client B needs to pay', () => {
    expect(clientNeedsPayment(baseBooking, 'client-b')).toBe(true);
  });

  it('should return false when client A has already paid', () => {
    const booking = { ...baseBooking, clientAPaymentStatus: 'paid' as const };
    expect(clientNeedsPayment(booking, 'client-a')).toBe(false);
  });

  it('should return false when booking is not confirmed', () => {
    const booking = { ...baseBooking, status: 'pending' as const };
    expect(clientNeedsPayment(booking, 'client-a')).toBe(false);
  });

  it('should return false for unknown client', () => {
    expect(clientNeedsPayment(baseBooking, 'unknown-client')).toBe(false);
  });
});

describe('getClientPaymentStatus', () => {
  const baseBooking: SplitBooking = {
    id: 'test-booking',
    totalCost: 100.00,
    clientAShare: 60.00,
    clientBShare: 40.00,
    clientAUid: 'client-a',
    clientBUid: 'client-b',
    providerId: 'provider-1',
    status: 'confirmed',
    clientAPaymentStatus: 'pending',
    clientBPaymentStatus: 'paid',
    createdAt: new Date(),
    updatedAt: new Date(),
    stripeSessionIds: {
      clientA: 'session-a',
      clientB: 'session-b'
    }
  };

  it('should return correct status for client A', () => {
    const status = getClientPaymentStatus(baseBooking, 'client-a');
    expect(status).toEqual({
      status: 'pending',
      amount: 60.00,
      stripeSessionId: 'session-a'
    });
  });

  it('should return correct status for client B', () => {
    const status = getClientPaymentStatus(baseBooking, 'client-b');
    expect(status).toEqual({
      status: 'paid',
      amount: 40.00,
      stripeSessionId: 'session-b'
    });
  });

  it('should return null for unknown client', () => {
    const status = getClientPaymentStatus(baseBooking, 'unknown-client');
    expect(status).toBeNull();
  });
});

describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(1000.50)).toBe('$1,000.50');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle different currencies', () => {
    expect(formatCurrency(100, 'EUR')).toBe('€100.00');
    expect(formatCurrency(100, 'GBP')).toBe('£100.00');
  });
});

describe('calculatePlatformFee', () => {
  it('should calculate platform fee with default percentage', () => {
    expect(calculatePlatformFee(100)).toBe(5.00);
    expect(calculatePlatformFee(1000)).toBe(50.00);
    expect(calculatePlatformFee(0)).toBe(0.00);
  });

  it('should calculate platform fee with custom percentage', () => {
    expect(calculatePlatformFee(100, 0.10)).toBe(10.00);
    expect(calculatePlatformFee(1000, 0.025)).toBe(25.00);
  });

  it('should handle rounding correctly', () => {
    expect(calculatePlatformFee(123.45, 0.05)).toBe(6.17);
    expect(calculatePlatformFee(99.99, 0.03)).toBe(3.00);
  });
});