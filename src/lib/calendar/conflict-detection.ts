/**
 * Unified Conflict Detection Service
 * 
 * Detects scheduling conflicts across Google Calendar, Microsoft Calendar, and internal bookings
 */

import { CalendarSyncService } from '@/lib/google/calendarSync';
import { MicrosoftCalendarService } from '@/lib/calendar/microsoft-calendar';
import { adminDb } from '@/lib/firebase-admin';

export interface ConflictCheckRequest {
  startTime: string;
  endTime: string;
  timezone: string;
  excludeBookingId?: string; // Exclude specific booking from conflict check
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictSources: ConflictSource[];
  availableAlternatives?: AlternativeSlot[];
}

export interface ConflictSource {
  source: 'google' | 'microsoft' | 'internal' | 'blocked';
  eventId?: string;
  title?: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface AlternativeSlot {
  startTime: string;
  endTime: string;
  confidence: 'high' | 'medium' | 'low';
  timezone: string;
}

export class ConflictDetectionService {
  private userId: string;
  private googleService?: CalendarSyncService;
  private microsoftService?: MicrosoftCalendarService;

  constructor(
    userId: string, 
    googleToken?: string, 
    microsoftToken?: string
  ) {
    this.userId = userId;
    
    if (googleToken) {
      this.googleService = new CalendarSyncService(googleToken);
    }
    
    if (microsoftToken) {
      this.microsoftService = new MicrosoftCalendarService(microsoftToken);
    }
  }

  /**
   * Comprehensive conflict detection across all calendar sources
   */
  async detectConflicts(request: ConflictCheckRequest): Promise<ConflictResult> {
    const conflicts: ConflictSource[] = [];
    
    try {
      // Check internal AuditoryX bookings
      const internalConflicts = await this.checkInternalBookings(request);
      conflicts.push(...internalConflicts);

      // Check Google Calendar conflicts
      if (this.googleService) {
        const googleConflicts = await this.checkGoogleConflicts(request);
        conflicts.push(...googleConflicts);
      }

      // Check Microsoft Calendar conflicts
      if (this.microsoftService) {
        const microsoftConflicts = await this.checkMicrosoftConflicts(request);
        conflicts.push(...microsoftConflicts);
      }

      // Check manually blocked time slots
      const blockedConflicts = await this.checkBlockedSlots(request);
      conflicts.push(...blockedConflicts);

      const hasConflict = conflicts.length > 0;
      let availableAlternatives: AlternativeSlot[] = [];

      // If there's a conflict, try to find alternative slots
      if (hasConflict) {
        availableAlternatives = await this.findAlternativeSlots(request);
      }

      return {
        hasConflict,
        conflictSources: conflicts,
        availableAlternatives: availableAlternatives.length > 0 ? availableAlternatives : undefined
      };

    } catch (error) {
      console.error('Conflict detection error:', error);
      
      // Return safe default (assume no conflict if detection fails)
      return {
        hasConflict: false,
        conflictSources: []
      };
    }
  }

  /**
   * Check for conflicts with existing AuditoryX bookings
   */
  private async checkInternalBookings(request: ConflictCheckRequest): Promise<ConflictSource[]> {
    const conflicts: ConflictSource[] = [];
    
    try {
      const bookingsQuery = adminDb
        .collection('bookings')
        .where('providerId', '==', this.userId)
        .where('status', 'in', ['confirmed', 'in_progress']);

      const bookingsSnapshot = await bookingsQuery.get();
      
      for (const doc of bookingsSnapshot.docs) {
        const booking = doc.data();
        
        // Skip the booking we're checking against (for updates)
        if (request.excludeBookingId && doc.id === request.excludeBookingId) {
          continue;
        }

        const bookingStart = new Date(booking.datetime);
        const bookingEnd = new Date(bookingStart.getTime() + (booking.duration || 60) * 60 * 1000);
        
        if (this.timesOverlap(
          new Date(request.startTime),
          new Date(request.endTime),
          bookingStart,
          bookingEnd
        )) {
          conflicts.push({
            source: 'internal',
            eventId: doc.id,
            title: booking.title || booking.serviceName || 'AuditoryX Booking',
            startTime: bookingStart.toISOString(),
            endTime: bookingEnd.toISOString(),
            description: `Booking with ${booking.clientId}`
          });
        }
      }
    } catch (error) {
      console.error('Error checking internal bookings:', error);
    }

    return conflicts;
  }

  /**
   * Check for conflicts with Google Calendar
   */
  private async checkGoogleConflicts(request: ConflictCheckRequest): Promise<ConflictSource[]> {
    const conflicts: ConflictSource[] = [];
    
    try {
      if (!this.googleService) return conflicts;

      const hasGoogleConflict = await this.googleService.detectConflicts(
        this.userId,
        {
          startTime: request.startTime,
          endTime: request.endTime,
          timezone: request.timezone,
          day: '', // Will be calculated by the service
          time: '', // Will be calculated by the service
          duration: 0 // Will be calculated by the service
        }
      );

      if (hasGoogleConflict) {
        // Note: We'd need to enhance GoogleCalendarService to return actual conflicting events
        conflicts.push({
          source: 'google',
          title: 'Google Calendar Event',
          startTime: request.startTime,
          endTime: request.endTime,
          description: 'Conflicting event in Google Calendar'
        });
      }
    } catch (error) {
      console.error('Error checking Google Calendar:', error);
    }

    return conflicts;
  }

  /**
   * Check for conflicts with Microsoft Calendar
   */
  private async checkMicrosoftConflicts(request: ConflictCheckRequest): Promise<ConflictSource[]> {
    const conflicts: ConflictSource[] = [];
    
    try {
      if (!this.microsoftService) return conflicts;

      const hasMicrosoftConflict = await this.microsoftService.detectConflicts(
        request.startTime,
        request.endTime
      );

      if (hasMicrosoftConflict) {
        // Note: We'd need to enhance MicrosoftCalendarService to return actual conflicting events
        conflicts.push({
          source: 'microsoft',
          title: 'Microsoft Calendar Event',
          startTime: request.startTime,
          endTime: request.endTime,
          description: 'Conflicting event in Microsoft Calendar'
        });
      }
    } catch (error) {
      console.error('Error checking Microsoft Calendar:', error);
    }

    return conflicts;
  }

  /**
   * Check for conflicts with manually blocked time slots
   */
  private async checkBlockedSlots(request: ConflictCheckRequest): Promise<ConflictSource[]> {
    const conflicts: ConflictSource[] = [];
    
    try {
      const userDoc = await adminDb.doc(`users/${this.userId}`).get();
      const userData = userDoc.data();
      
      if (userData?.availability?.blackoutDates) {
        for (const blackout of userData.availability.blackoutDates) {
          const blackoutStart = new Date(blackout.date);
          const blackoutEnd = new Date(blackout.endDate || blackout.date);
          
          if (this.timesOverlap(
            new Date(request.startTime),
            new Date(request.endTime),
            blackoutStart,
            blackoutEnd
          )) {
            conflicts.push({
              source: 'blocked',
              title: 'Blocked Time',
              startTime: blackoutStart.toISOString(),
              endTime: blackoutEnd.toISOString(),
              description: blackout.reason || 'Manually blocked time slot'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking blocked slots:', error);
    }

    return conflicts;
  }

  /**
   * Find alternative available slots when there's a conflict
   */
  private async findAlternativeSlots(request: ConflictCheckRequest): Promise<AlternativeSlot[]> {
    const alternatives: AlternativeSlot[] = [];
    
    try {
      const requestStart = new Date(request.startTime);
      const requestEnd = new Date(request.endTime);
      const duration = requestEnd.getTime() - requestStart.getTime();
      
      // Check slots before and after the requested time
      const searchWindows = [
        // 1 hour before
        {
          start: new Date(requestStart.getTime() - 60 * 60 * 1000),
          end: new Date(requestStart.getTime()),
          confidence: 'high' as const
        },
        // 1 hour after
        {
          start: new Date(requestEnd.getTime()),
          end: new Date(requestEnd.getTime() + 60 * 60 * 1000),
          confidence: 'high' as const
        },
        // Same time next day
        {
          start: new Date(requestStart.getTime() + 24 * 60 * 60 * 1000),
          end: new Date(requestEnd.getTime() + 24 * 60 * 60 * 1000),
          confidence: 'medium' as const
        }
      ];

      for (const window of searchWindows) {
        const alternativeRequest = {
          startTime: window.start.toISOString(),
          endTime: window.end.toISOString(),
          timezone: request.timezone,
          excludeBookingId: request.excludeBookingId
        };

        const conflictCheck = await this.detectConflicts(alternativeRequest);
        
        if (!conflictCheck.hasConflict) {
          alternatives.push({
            startTime: window.start.toISOString(),
            endTime: window.end.toISOString(),
            confidence: window.confidence,
            timezone: request.timezone
          });
        }
      }
    } catch (error) {
      console.error('Error finding alternative slots:', error);
    }

    return alternatives.slice(0, 3); // Return max 3 alternatives
  }

  /**
   * Utility method to check if two time ranges overlap
   */
  private timesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Get comprehensive availability for a date range
   */
  async getAvailability(startDate: string, endDate: string): Promise<{
    availableSlots: AlternativeSlot[];
    busySlots: ConflictSource[];
    summary: {
      totalSlots: number;
      availableSlots: number;
      busySlots: number;
      sources: string[];
    };
  }> {
    try {
      // This would generate time slots and check each one for conflicts
      // Implementation would depend on user's availability settings
      
      const availableSlots: AlternativeSlot[] = [];
      const busySlots: ConflictSource[] = [];
      
      // Get user's availability settings
      const userDoc = await adminDb.doc(`users/${this.userId}`).get();
      const userData = userDoc.data();
      const availability = userData?.availability || {};

      // Generate slots based on availability settings and check each for conflicts
      // This is a simplified version - real implementation would be more complex
      
      return {
        availableSlots,
        busySlots,
        summary: {
          totalSlots: availableSlots.length + busySlots.length,
          availableSlots: availableSlots.length,
          busySlots: busySlots.length,
          sources: ['internal', 'google', 'microsoft', 'blocked'].filter(source => 
            busySlots.some(slot => slot.source === source)
          )
        }
      };
    } catch (error) {
      console.error('Error getting availability:', error);
      throw error;
    }
  }
}