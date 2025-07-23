/**
 * MVP Feature Validation Test
 * Simple test to verify core MVP features are functional
 */

import { describe, test, expect } from '@jest/globals';
import { SCHEMA_FIELDS } from '../lib/SCHEMA_FIELDS';

describe('MVP Feature Validation', () => {
  test('SCHEMA_FIELDS contains required MVP fields', () => {
    // User fields for authentication
    expect(SCHEMA_FIELDS.USER.USER_ID).toBeDefined();
    expect(SCHEMA_FIELDS.USER.EMAIL).toBeDefined();
    expect(SCHEMA_FIELDS.USER.ROLE).toBeDefined();
    
    // Booking fields for core booking functionality
    expect(SCHEMA_FIELDS.BOOKING.PROVIDER_ID).toBeDefined();
    expect(SCHEMA_FIELDS.BOOKING.STATUS).toBeDefined();
    expect(SCHEMA_FIELDS.BOOKING.CREATED_AT).toBeDefined();
    
    // Escrow fields for payment functionality
    expect(SCHEMA_FIELDS.ESCROW.PROVIDER_ID).toBeDefined();
    expect(SCHEMA_FIELDS.ESCROW.CUSTOMER_ID).toBeDefined();
    expect(SCHEMA_FIELDS.ESCROW.AMOUNT).toBeDefined();
    
    // User progress fields for gamification
    expect(SCHEMA_FIELDS.USER_PROGRESS.TOTAL_XP).toBeDefined();
    expect(SCHEMA_FIELDS.USER_PROGRESS.CURRENT_STREAK).toBeDefined();
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