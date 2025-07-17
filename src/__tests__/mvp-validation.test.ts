/**
 * MVP Feature Validation Test
 * Simple test to verify core MVP features are functional
 */

import { describe, test, expect } from '@jest/globals';

describe('MVP Feature Validation', () => {
  test('SCHEMA_FIELDS contains required MVP fields', () => {
    const { SCHEMA_FIELDS } = require('@/lib/SCHEMA_FIELDS');
    
    // User fields for authentication
    expect(SCHEMA_FIELDS.USER.USER_ID).toBe('userId');
    expect(SCHEMA_FIELDS.USER.EMAIL).toBe('email');
    expect(SCHEMA_FIELDS.USER.ROLE).toBe('role');
    
    // Booking fields for core booking functionality
    expect(SCHEMA_FIELDS.BOOKING.PROVIDER_ID).toBe('providerId');
    expect(SCHEMA_FIELDS.BOOKING.STATUS).toBe('status');
    expect(SCHEMA_FIELDS.BOOKING.CREATED_AT).toBe('createdAt');
    
    // Escrow fields for payment functionality
    expect(SCHEMA_FIELDS.ESCROW.PROVIDER_ID).toBe('providerId');
    expect(SCHEMA_FIELDS.ESCROW.CUSTOMER_ID).toBe('customerId');
    expect(SCHEMA_FIELDS.ESCROW.AMOUNT).toBe('amount');
    
    // User progress fields for gamification
    expect(SCHEMA_FIELDS.USER_PROGRESS.TOTAL_XP).toBe('totalXp');
    expect(SCHEMA_FIELDS.USER_PROGRESS.CURRENT_STREAK).toBe('currentStreak');
  });

  test('Core services can be imported without errors', () => {
    expect(() => {
      require('@/lib/google/calendarSync');
    }).not.toThrow();
    
    expect(() => {
      require('@/lib/stripe/escrow');
    }).not.toThrow();
    
    expect(() => {
      require('@/lib/firebase/realtimeService');
    }).not.toThrow();
  });

  test('Real-time service classes can be instantiated', () => {
    const { RealtimeService } = require('@/lib/firebase/realtimeService');
    const service = new RealtimeService();
    
    expect(service).toBeDefined();
    expect(typeof service.updateTypingStatus).toBe('function');
    expect(typeof service.updatePresence).toBe('function');
  });

  test('Calendar sync service has required methods', () => {
    const { CalendarSyncService } = require('@/lib/google/calendarSync');
    
    // Test with mock access token
    const service = new CalendarSyncService('mock-token');
    
    expect(service).toBeDefined();
    expect(typeof service.syncAvailability).toBe('function');
    expect(typeof service.pushAvailability).toBe('function');
  });

  test('Escrow service has required methods', () => {
    const { EscrowService } = require('@/lib/stripe/escrow');
    
    const service = new EscrowService();
    
    expect(service).toBeDefined();
    expect(typeof service.createEscrowPayment).toBe('function');
    expect(typeof service.releaseEscrowPayment).toBe('function');
    expect(typeof service.refundEscrowPayment).toBe('function');
  });
});