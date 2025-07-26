/**
 * Tests for Calendar Integration System
 */

import { ConflictDetectionService, type ConflictCheckRequest } from '../conflict-detection';

// Mock Firebase Admin
jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        get: jest.fn(() => ({
          docs: []
        }))
      })),
      add: jest.fn()
    })),
    doc: jest.fn(() => ({
      get: jest.fn(() => ({
        exists: true,
        data: () => ({
          availability: {
            timeSlots: [],
            blackoutDates: [],
            bufferTime: 30
          }
        })
      })),
      update: jest.fn()
    }))
  }
}));

// Mock Google Calendar Service
jest.mock('@/lib/google/calendarSync', () => ({
  CalendarSyncService: jest.fn().mockImplementation(() => ({
    detectConflicts: jest.fn()
  }))
}));

// Mock Microsoft Calendar Service
jest.mock('@/lib/calendar/microsoft-calendar', () => ({
  MicrosoftCalendarService: jest.fn().mockImplementation(() => ({
    detectConflicts: jest.fn()
  }))
}));

describe('ConflictDetectionService', () => {
  const mockUserId = 'test-user-123';
  const mockGoogleToken = 'google-token-123';
  const mockMicrosoftToken = 'microsoft-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('detectConflicts', () => {
    it('should detect no conflicts when all sources are free', async () => {
      const service = new ConflictDetectionService(
        mockUserId,
        mockGoogleToken,
        mockMicrosoftToken
      );

      const request: ConflictCheckRequest = {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        timezone: 'UTC'
      };

      const result = await service.detectConflicts(request);

      expect(result.hasConflict).toBe(false);
      expect(result.conflictSources).toHaveLength(0);
    });

    it('should handle Google Calendar integration', async () => {
      const { CalendarSyncService } = require('@/lib/google/calendarSync');
      const mockGoogleService = CalendarSyncService.mock.instances[0];
      mockGoogleService.detectConflicts.mockResolvedValue(true);

      const service = new ConflictDetectionService(
        mockUserId,
        mockGoogleToken
      );

      const request: ConflictCheckRequest = {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        timezone: 'UTC'
      };

      const result = await service.detectConflicts(request);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictSources).toContainEqual(
        expect.objectContaining({
          source: 'google',
          title: 'Google Calendar Event'
        })
      );
    });

    it('should handle Microsoft Calendar integration', async () => {
      const { MicrosoftCalendarService } = require('@/lib/calendar/microsoft-calendar');
      const mockMicrosoftService = MicrosoftCalendarService.mock.instances[0];
      mockMicrosoftService.detectConflicts.mockResolvedValue(true);

      const service = new ConflictDetectionService(
        mockUserId,
        undefined,
        mockMicrosoftToken
      );

      const request: ConflictCheckRequest = {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        timezone: 'UTC'
      };

      const result = await service.detectConflicts(request);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictSources).toContainEqual(
        expect.objectContaining({
          source: 'microsoft',
          title: 'Microsoft Calendar Event'
        })
      );
    });

    it('should exclude specified booking from conflict check', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      const mockBookingsQuery = {
        docs: [{
          id: 'booking-to-exclude',
          data: () => ({
            datetime: '2024-01-15T10:30:00Z',
            duration: 60,
            status: 'confirmed',
            title: 'Existing Booking'
          })
        }]
      };
      
      adminDb.collection.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockBookingsQuery)
      });

      const service = new ConflictDetectionService(mockUserId);

      const request: ConflictCheckRequest = {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        timezone: 'UTC',
        excludeBookingId: 'booking-to-exclude'
      };

      const result = await service.detectConflicts(request);

      expect(result.hasConflict).toBe(false);
    });

    it('should detect conflicts with existing bookings', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      const mockBookingsQuery = {
        docs: [{
          id: 'conflicting-booking',
          data: () => ({
            datetime: '2024-01-15T10:30:00Z',
            duration: 60,
            status: 'confirmed',
            title: 'Conflicting Booking',
            clientId: 'client-123'
          })
        }]
      };
      
      adminDb.collection.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockBookingsQuery)
      });

      const service = new ConflictDetectionService(mockUserId);

      const request: ConflictCheckRequest = {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        timezone: 'UTC'
      };

      const result = await service.detectConflicts(request);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictSources).toContainEqual(
        expect.objectContaining({
          source: 'internal',
          eventId: 'conflicting-booking',
          title: 'Conflicting Booking'
        })
      );
    });

    it('should detect conflicts with blocked time slots', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      
      adminDb.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            availability: {
              blackoutDates: [{
                date: '2024-01-15T10:30:00Z',
                endDate: '2024-01-15T11:30:00Z',
                reason: 'Personal time'
              }]
            }
          })
        })
      });

      const service = new ConflictDetectionService(mockUserId);

      const request: ConflictCheckRequest = {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        timezone: 'UTC'
      };

      const result = await service.detectConflicts(request);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictSources).toContainEqual(
        expect.objectContaining({
          source: 'blocked',
          title: 'Blocked Time',
          description: 'Personal time'
        })
      );
    });

    it('should return graceful fallback on error', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      
      adminDb.collection.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const service = new ConflictDetectionService(mockUserId);

      const request: ConflictCheckRequest = {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        timezone: 'UTC'
      };

      const result = await service.detectConflicts(request);

      // Should return safe default (no conflict) if detection fails
      expect(result.hasConflict).toBe(false);
      expect(result.conflictSources).toHaveLength(0);
    });

    it('should find alternative slots when conflicts exist', async () => {
      const { CalendarSyncService } = require('@/lib/google/calendarSync');
      const mockGoogleService = CalendarSyncService.mock.instances[0];
      
      // First call returns conflict, subsequent calls return no conflict
      mockGoogleService.detectConflicts
        .mockResolvedValueOnce(true)  // Original time has conflict
        .mockResolvedValue(false);    // Alternative times are free

      const service = new ConflictDetectionService(
        mockUserId,
        mockGoogleToken
      );

      const request: ConflictCheckRequest = {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        timezone: 'UTC'
      };

      const result = await service.detectConflicts(request);

      expect(result.hasConflict).toBe(true);
      expect(result.availableAlternatives).toBeDefined();
      expect(result.availableAlternatives!.length).toBeGreaterThan(0);
    });
  });

  describe('timesOverlap utility', () => {
    it('should correctly detect overlapping times', () => {
      const service = new ConflictDetectionService(mockUserId);
      
      // Access private method for testing (in real implementation, this would be a separate utility)
      const timesOverlap = (service as any).timesOverlap;

      const start1 = new Date('2024-01-15T10:00:00Z');
      const end1 = new Date('2024-01-15T11:00:00Z');
      const start2 = new Date('2024-01-15T10:30:00Z');
      const end2 = new Date('2024-01-15T11:30:00Z');

      expect(timesOverlap(start1, end1, start2, end2)).toBe(true);
    });

    it('should correctly detect non-overlapping times', () => {
      const service = new ConflictDetectionService(mockUserId);
      const timesOverlap = (service as any).timesOverlap;

      const start1 = new Date('2024-01-15T10:00:00Z');
      const end1 = new Date('2024-01-15T11:00:00Z');
      const start2 = new Date('2024-01-15T11:30:00Z');
      const end2 = new Date('2024-01-15T12:30:00Z');

      expect(timesOverlap(start1, end1, start2, end2)).toBe(false);
    });

    it('should handle edge case where times touch but do not overlap', () => {
      const service = new ConflictDetectionService(mockUserId);
      const timesOverlap = (service as any).timesOverlap;

      const start1 = new Date('2024-01-15T10:00:00Z');
      const end1 = new Date('2024-01-15T11:00:00Z');
      const start2 = new Date('2024-01-15T11:00:00Z');
      const end2 = new Date('2024-01-15T12:00:00Z');

      expect(timesOverlap(start1, end1, start2, end2)).toBe(false);
    });
  });

  describe('getAvailability', () => {
    it('should return availability summary', async () => {
      const service = new ConflictDetectionService(mockUserId);

      const availability = await service.getAvailability(
        '2024-01-15T00:00:00Z',
        '2024-01-16T00:00:00Z'
      );

      expect(availability).toHaveProperty('availableSlots');
      expect(availability).toHaveProperty('busySlots');
      expect(availability).toHaveProperty('summary');
      expect(availability.summary).toHaveProperty('totalSlots');
      expect(availability.summary).toHaveProperty('availableSlots');
      expect(availability.summary).toHaveProperty('busySlots');
      expect(availability.summary).toHaveProperty('sources');
    });
  });
});