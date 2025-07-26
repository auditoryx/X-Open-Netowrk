/**
 * Calendar Conflict Detection for AuditoryX
 * 
 * Prevents double-booking and scheduling conflicts
 */

import { AvailabilityService } from './availability';
import { GoogleCalendarService } from './google-calendar';
import { adminDb } from '@/lib/firebase-admin';

export interface ConflictResult {
  hasConflicts: boolean;
  conflicts: ConflictEvent[];
  canBook: boolean;
  reason?: string;
  suggestions?: AlternativeSlot[];
}

export interface ConflictEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'booking' | 'blocked' | 'blackout' | 'google' | 'recurring';
  source: 'local' | 'google' | 'system';
  conflictLevel: 'hard' | 'soft'; // hard = cannot override, soft = can override with warning
}

export interface AlternativeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  proximity: number; // minutes from original request
}

export interface BookingRequest {
  userId: string;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  clientId?: string;
  serviceId?: string;
  bufferOverride?: number; // Override default buffer time
}

export class ConflictDetectionService {
  private availabilityService: AvailabilityService;
  private googleCalendarService: GoogleCalendarService | null = null;

  constructor() {
    this.availabilityService = new AvailabilityService();
  }

  /**
   * Initialize Google Calendar service if configured
   */
  setGoogleCalendarService(service: GoogleCalendarService) {
    this.googleCalendarService = service;
  }

  /**
   * Comprehensive conflict detection for booking requests
   */
  async detectConflicts(request: BookingRequest): Promise<ConflictResult> {
    try {
      const startTime = new Date(request.startTime);
      const endTime = new Date(request.endTime);
      const conflicts: ConflictEvent[] = [];
      let canBook = true;
      let reason: string | undefined;

      // 1. Basic validation
      if (endTime <= startTime) {
        return {
          hasConflicts: true,
          conflicts: [],
          canBook: false,
          reason: 'End time must be after start time'
        };
      }

      // 2. Check if user exists and has availability settings
      const userDoc = await adminDb.doc(`users/${request.userId}`).get();
      if (!userDoc.exists) {
        return {
          hasConflicts: true,
          conflicts: [],
          canBook: false,
          reason: 'User not found'
        };
      }

      // 3. Check local availability and conflicts
      const localCheck = await this.availabilityService.isSlotAvailable(
        request.userId,
        request.startTime,
        request.endTime
      );

      if (localCheck.hasConflicts) {
        conflicts.push(...localCheck.conflicts.map(conflict => ({
          ...conflict,
          source: 'local' as const,
          conflictLevel: this.getConflictLevel(conflict.type)
        })));
      }

      // 4. Check Google Calendar conflicts if connected
      if (this.googleCalendarService) {
        const googleCheck = await this.googleCalendarService.checkConflicts(
          request.userId,
          request.startTime,
          request.endTime
        );

        if (googleCheck.hasConflicts) {
          conflicts.push(...googleCheck.conflicts.map((conflict: any) => ({
            id: conflict.id || 'google_' + Date.now(),
            title: conflict.summary || 'Google Calendar Event',
            startTime: conflict.start?.dateTime || conflict.start?.date,
            endTime: conflict.end?.dateTime || conflict.end?.date,
            type: 'google' as const,
            source: 'google' as const,
            conflictLevel: 'soft' as const // Google events can be soft conflicts
          })));
        }
      }

      // 5. Check for recurring event conflicts
      const recurringConflicts = await this.checkRecurringConflicts(
        request.userId,
        startTime,
        endTime
      );

      conflicts.push(...recurringConflicts);

      // 6. Determine if booking can proceed
      const hardConflicts = conflicts.filter(c => c.conflictLevel === 'hard');
      if (hardConflicts.length > 0) {
        canBook = false;
        reason = `Conflicts with ${hardConflicts.length} existing ${
          hardConflicts.length === 1 ? 'booking' : 'bookings'
        }`;
      }

      // 7. Generate alternative slots if conflicts exist
      let suggestions: AlternativeSlot[] = [];
      if (conflicts.length > 0 && !canBook) {
        suggestions = await this.generateAlternativeSlots(request);
      }

      return {
        hasConflicts: conflicts.length > 0,
        conflicts,
        canBook,
        reason,
        suggestions: suggestions.length > 0 ? suggestions : undefined
      };

    } catch (error) {
      console.error('Conflict detection error:', error);
      return {
        hasConflicts: true,
        conflicts: [],
        canBook: false,
        reason: 'Error checking for conflicts'
      };
    }
  }

  /**
   * Check for recurring event conflicts
   */
  private async checkRecurringConflicts(
    userId: string,
    startTime: Date,
    endTime: Date
  ): Promise<ConflictEvent[]> {
    try {
      const userDoc = await adminDb.doc(`users/${userId}`).get();
      const userData = userDoc.data();
      
      if (!userData) return [];

      const events = userData.calendarEvents || [];
      const recurringEvents = events.filter((event: any) => event.recurring);
      const conflicts: ConflictEvent[] = [];

      for (const event of recurringEvents) {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        
        // Calculate if this recurring event would occur during the requested time
        if (this.doesRecurringEventConflict(event, startTime, endTime)) {
          conflicts.push({
            id: event.id,
            title: event.title + ' (Recurring)',
            startTime: event.startTime,
            endTime: event.endTime,
            type: 'recurring',
            source: 'local',
            conflictLevel: 'hard'
          });
        }
      }

      return conflicts;
    } catch (error) {
      console.error('Recurring conflict check error:', error);
      return [];
    }
  }

  /**
   * Check if a recurring event conflicts with the requested time
   */
  private doesRecurringEventConflict(
    recurringEvent: any,
    requestStart: Date,
    requestEnd: Date
  ): boolean {
    const eventStart = new Date(recurringEvent.startTime);
    const eventEnd = new Date(recurringEvent.endTime);
    const eventDuration = eventEnd.getTime() - eventStart.getTime();

    const recurring = recurringEvent.recurring;
    if (!recurring || recurring.frequency === 'none') return false;

    // Check different recurrence patterns
    switch (recurring.frequency) {
      case 'daily':
        return this.checkDailyRecurrence(eventStart, eventDuration, requestStart, requestEnd, recurring.interval || 1);
      
      case 'weekly':
        return this.checkWeeklyRecurrence(eventStart, eventDuration, requestStart, requestEnd, recurring.interval || 1);
      
      case 'monthly':
        return this.checkMonthlyRecurrence(eventStart, eventDuration, requestStart, requestEnd, recurring.interval || 1);
      
      default:
        return false;
    }
  }

  /**
   * Check daily recurrence conflicts
   */
  private checkDailyRecurrence(
    eventStart: Date,
    eventDuration: number,
    requestStart: Date,
    requestEnd: Date,
    interval: number
  ): boolean {
    const daysBetween = Math.floor((requestStart.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysBetween < 0) return false; // Event is in the future
    
    // Check if the request day falls on a recurrence day
    if (daysBetween % interval === 0) {
      const recurringStart = new Date(requestStart);
      recurringStart.setHours(eventStart.getHours(), eventStart.getMinutes(), eventStart.getSeconds());
      
      const recurringEnd = new Date(recurringStart.getTime() + eventDuration);
      
      return requestStart < recurringEnd && requestEnd > recurringStart;
    }
    
    return false;
  }

  /**
   * Check weekly recurrence conflicts
   */
  private checkWeeklyRecurrence(
    eventStart: Date,
    eventDuration: number,
    requestStart: Date,
    requestEnd: Date,
    interval: number
  ): boolean {
    // Check if same day of week
    if (eventStart.getDay() !== requestStart.getDay()) return false;
    
    const weeksBetween = Math.floor((requestStart.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
    
    if (weeksBetween < 0) return false;
    
    if (weeksBetween % interval === 0) {
      const recurringStart = new Date(requestStart);
      recurringStart.setHours(eventStart.getHours(), eventStart.getMinutes(), eventStart.getSeconds());
      
      const recurringEnd = new Date(recurringStart.getTime() + eventDuration);
      
      return requestStart < recurringEnd && requestEnd > recurringStart;
    }
    
    return false;
  }

  /**
   * Check monthly recurrence conflicts
   */
  private checkMonthlyRecurrence(
    eventStart: Date,
    eventDuration: number,
    requestStart: Date,
    requestEnd: Date,
    interval: number
  ): boolean {
    // Check if same day of month
    if (eventStart.getDate() !== requestStart.getDate()) return false;
    
    const monthsBetween = (requestStart.getFullYear() - eventStart.getFullYear()) * 12 + 
                         (requestStart.getMonth() - eventStart.getMonth());
    
    if (monthsBetween < 0) return false;
    
    if (monthsBetween % interval === 0) {
      const recurringStart = new Date(requestStart);
      recurringStart.setHours(eventStart.getHours(), eventStart.getMinutes(), eventStart.getSeconds());
      
      const recurringEnd = new Date(recurringStart.getTime() + eventDuration);
      
      return requestStart < recurringEnd && requestEnd > recurringStart;
    }
    
    return false;
  }

  /**
   * Generate alternative time slots when conflicts exist
   */
  private async generateAlternativeSlots(request: BookingRequest): Promise<AlternativeSlot[]> {
    try {
      const requestStart = new Date(request.startTime);
      const requestEnd = new Date(request.endTime);
      const duration = requestEnd.getTime() - requestStart.getTime();
      
      const suggestions: AlternativeSlot[] = [];
      
      // Look for slots in the next 7 days
      const searchEnd = new Date(requestStart);
      searchEnd.setDate(searchEnd.getDate() + 7);
      
      const availableSlots = await this.availabilityService.generateAvailableSlots(
        request.userId,
        requestStart,
        searchEnd
      );
      
      // Filter slots that match the requested duration
      const matchingSlots = availableSlots.filter(slot => 
        slot.available && 
        (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) >= duration
      );
      
      // Calculate proximity to original request and sort
      for (const slot of matchingSlots.slice(0, 5)) { // Limit to 5 suggestions
        const slotStart = new Date(slot.startTime);
        const proximity = Math.abs(slotStart.getTime() - requestStart.getTime()) / (1000 * 60); // minutes
        
        suggestions.push({
          startTime: slot.startTime,
          endTime: new Date(slotStart.getTime() + duration).toISOString(),
          available: true,
          proximity
        });
      }
      
      // Sort by proximity to original request
      suggestions.sort((a, b) => a.proximity - b.proximity);
      
      return suggestions;
    } catch (error) {
      console.error('Generate alternatives error:', error);
      return [];
    }
  }

  /**
   * Determine conflict level based on event type
   */
  private getConflictLevel(eventType: string): 'hard' | 'soft' {
    switch (eventType) {
      case 'booking':
      case 'blocked':
      case 'blackout':
        return 'hard';
      case 'google':
        return 'soft';
      default:
        return 'hard';
    }
  }

  /**
   * Double-booking prevention for high-volume scenarios
   */
  async preventDoubleBooking(
    userId: string,
    startTime: string,
    endTime: string,
    bookingId: string
  ): Promise<boolean> {
    try {
      // Use atomic transaction to prevent race conditions
      const userRef = adminDb.doc(`users/${userId}`);
      
      return await adminDb.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists) {
          throw new Error('User not found');
        }
        
        const userData = userDoc.data();
        const events = userData?.calendarEvents || [];
        
        // Check for conflicts one more time in the transaction
        const hasConflict = events.some((event: any) => {
          if (event.id === bookingId) return false; // Skip self
          
          const eventStart = new Date(event.startTime);
          const eventEnd = new Date(event.endTime);
          const requestStart = new Date(startTime);
          const requestEnd = new Date(endTime);
          
          return requestStart < eventEnd && requestEnd > eventStart;
        });
        
        if (hasConflict) {
          return false; // Conflict detected
        }
        
        // Add the booking event
        const bookingEvent = {
          id: bookingId,
          title: 'Booking',
          startTime,
          endTime,
          type: 'booking',
          source: 'booking',
          createdAt: new Date().toISOString()
        };
        
        events.push(bookingEvent);
        
        transaction.update(userRef, {
          calendarEvents: events,
          updatedAt: new Date().toISOString()
        });
        
        return true; // Booking successful
      });
      
    } catch (error) {
      console.error('Double booking prevention error:', error);
      return false;
    }
  }
}