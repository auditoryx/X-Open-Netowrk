/**
 * Availability Management System for AuditoryX
 * 
 * Handles creator availability, time slot generation, and booking conflicts
 */

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

// Availability schema definitions
export const TimeSlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  timezone: z.string().optional()
});

export const BlackoutDateSchema = z.object({
  date: z.string().datetime(),
  reason: z.string().max(200).optional(),
  isRecurring: z.boolean().optional()
});

export const AvailabilitySettingsSchema = z.object({
  timeSlots: z.array(TimeSlotSchema),
  blackoutDates: z.array(BlackoutDateSchema).optional(),
  bufferTime: z.number().min(0).max(240).default(30), // minutes between bookings
  maxAdvanceBooking: z.number().min(1).max(365).default(90), // days
  minAdvanceBooking: z.number().min(0).max(72).default(24), // hours
  slotDuration: z.number().min(15).max(480).default(60), // minutes
  timezone: z.string().default('UTC'),
  autoAccept: z.boolean().default(false)
});

export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type BlackoutDate = z.infer<typeof BlackoutDateSchema>;
export type AvailabilitySettings = z.infer<typeof AvailabilitySettingsSchema>;

export interface AvailableSlot {
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  duration: number; // minutes
  available: boolean;
  timezone: string;
  bookingId?: string; // If slot is booked
}

export interface ConflictCheck {
  hasConflicts: boolean;
  conflicts: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    type: 'booking' | 'blocked' | 'blackout';
  }>;
}

export class AvailabilityService {
  
  /**
   * Get creator's availability settings
   */
  async getAvailabilitySettings(userId: string): Promise<AvailabilitySettings | null> {
    try {
      const userDoc = await adminDb.doc(`users/${userId}`).get();
      if (!userDoc.exists) return null;

      const userData = userDoc.data();
      const settings = userData?.availability;

      if (!settings) {
        // Return default settings if none exist
        return {
          timeSlots: [],
          blackoutDates: [],
          bufferTime: 30,
          maxAdvanceBooking: 90,
          minAdvanceBooking: 24,
          slotDuration: 60,
          timezone: 'UTC',
          autoAccept: false
        };
      }

      return AvailabilitySettingsSchema.parse(settings);
    } catch (error) {
      console.error('Get availability settings error:', error);
      return null;
    }
  }

  /**
   * Update creator's availability settings
   */
  async updateAvailabilitySettings(
    userId: string, 
    settings: AvailabilitySettings
  ): Promise<boolean> {
    try {
      const validatedSettings = AvailabilitySettingsSchema.parse(settings);

      // Validate time slots don't overlap
      for (const slot of validatedSettings.timeSlots) {
        if (slot.endTime <= slot.startTime) {
          throw new Error(`Invalid time slot: ${slot.startTime} - ${slot.endTime}`);
        }
      }

      await adminDb.doc(`users/${userId}`).update({
        availability: validatedSettings,
        updatedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Update availability settings error:', error);
      throw error;
    }
  }

  /**
   * Generate available time slots for a date range
   */
  async generateAvailableSlots(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AvailableSlot[]> {
    try {
      const settings = await this.getAvailabilitySettings(userId);
      if (!settings) return [];

      const slots: AvailableSlot[] = [];
      const { timeSlots, blackoutDates = [], bufferTime, slotDuration, timezone } = settings;

      // Get existing bookings and events
      const userDoc = await adminDb.doc(`users/${userId}`).get();
      const userData = userDoc.data();
      const existingEvents = userData?.calendarEvents || [];

      // Iterate through each day in the range
      const currentDate = new Date(startDate);
      const maxDate = new Date(Math.min(endDate.getTime(), 
        Date.now() + (settings.maxAdvanceBooking * 24 * 60 * 60 * 1000)));

      while (currentDate <= maxDate) {
        const dayOfWeek = currentDate.getDay();
        
        // Check if this day has availability
        const daySlots = timeSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
        
        if (daySlots.length > 0) {
          // Check if this date is blacked out
          const isBlackedOut = this.isDateBlackedOut(currentDate, blackoutDates);
          
          if (!isBlackedOut) {
            for (const slot of daySlots) {
              const daySlots = this.generateDaySlots(
                currentDate, 
                slot, 
                slotDuration, 
                bufferTime, 
                timezone,
                existingEvents,
                settings.minAdvanceBooking
              );
              slots.push(...daySlots);
            }
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    } catch (error) {
      console.error('Generate available slots error:', error);
      return [];
    }
  }

  /**
   * Check if a specific time slot is available
   */
  async isSlotAvailable(
    userId: string,
    startTime: string,
    endTime: string
  ): Promise<ConflictCheck> {
    try {
      const settings = await this.getAvailabilitySettings(userId);
      if (!settings) {
        return { hasConflicts: true, conflicts: [] };
      }

      const requestStart = new Date(startTime);
      const requestEnd = new Date(endTime);

      // Check if within advance booking limits
      const now = new Date();
      const hoursUntilBooking = (requestStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilBooking < settings.minAdvanceBooking) {
        return {
          hasConflicts: true,
          conflicts: [{
            id: 'min_advance',
            title: 'Too close to booking time',
            startTime,
            endTime,
            type: 'blocked'
          }]
        };
      }

      const maxAdvanceMs = settings.maxAdvanceBooking * 24 * 60 * 60 * 1000;
      if (requestStart.getTime() > now.getTime() + maxAdvanceMs) {
        return {
          hasConflicts: true,
          conflicts: [{
            id: 'max_advance',
            title: 'Too far in advance',
            startTime,
            endTime,
            type: 'blocked'
          }]
        };
      }

      // Check if within availability hours
      const dayOfWeek = requestStart.getDay();
      const daySlots = settings.timeSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
      
      if (daySlots.length === 0) {
        return {
          hasConflicts: true,
          conflicts: [{
            id: 'no_availability',
            title: 'No availability on this day',
            startTime,
            endTime,
            type: 'blocked'
          }]
        };
      }

      const isWithinAvailableHours = daySlots.some(slot => {
        const [slotStartHour, slotStartMinute] = slot.startTime.split(':').map(Number);
        const [slotEndHour, slotEndMinute] = slot.endTime.split(':').map(Number);

        const slotStart = new Date(requestStart);
        slotStart.setHours(slotStartHour, slotStartMinute, 0, 0);
        
        const slotEnd = new Date(requestStart);
        slotEnd.setHours(slotEndHour, slotEndMinute, 0, 0);

        return requestStart >= slotStart && requestEnd <= slotEnd;
      });

      if (!isWithinAvailableHours) {
        return {
          hasConflicts: true,
          conflicts: [{
            id: 'outside_hours',
            title: 'Outside available hours',
            startTime,
            endTime,
            type: 'blocked'
          }]
        };
      }

      // Check blackout dates
      if (this.isDateBlackedOut(requestStart, settings.blackoutDates || [])) {
        return {
          hasConflicts: true,
          conflicts: [{
            id: 'blackout',
            title: 'Date is blacked out',
            startTime,
            endTime,
            type: 'blackout'
          }]
        };
      }

      // Check existing bookings/events
      const userDoc = await adminDb.doc(`users/${userId}`).get();
      const userData = userDoc.data();
      const existingEvents = userData?.calendarEvents || [];

      const conflicts = existingEvents.filter((event: any) => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        
        // Add buffer time to existing events
        const bufferMs = settings.bufferTime * 60 * 1000;
        eventStart.setTime(eventStart.getTime() - bufferMs);
        eventEnd.setTime(eventEnd.getTime() + bufferMs);

        return requestStart < eventEnd && requestEnd > eventStart;
      }).map((event: any) => ({
        id: event.id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        type: event.type
      }));

      return {
        hasConflicts: conflicts.length > 0,
        conflicts
      };

    } catch (error) {
      console.error('Slot availability check error:', error);
      return { hasConflicts: true, conflicts: [] };
    }
  }

  /**
   * Block time slots (for personal use, vacations, etc.)
   */
  async blockTimeSlot(
    userId: string,
    startTime: string,
    endTime: string,
    reason?: string
  ): Promise<string> {
    try {
      const userDoc = await adminDb.doc(`users/${userId}`).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const existingEvents = userData?.calendarEvents || [];

      const blockEvent = {
        id: this.generateEventId(),
        title: reason || 'Blocked Time',
        description: reason,
        startTime,
        endTime,
        type: 'blocked',
        source: 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      existingEvents.push(blockEvent);

      await adminDb.doc(`users/${userId}`).update({
        calendarEvents: existingEvents,
        updatedAt: new Date().toISOString()
      });

      return blockEvent.id;
    } catch (error) {
      console.error('Block time slot error:', error);
      throw error;
    }
  }

  /**
   * Add blackout date
   */
  async addBlackoutDate(
    userId: string,
    date: string,
    reason?: string,
    isRecurring?: boolean
  ): Promise<void> {
    try {
      const settings = await this.getAvailabilitySettings(userId);
      if (!settings) {
        throw new Error('Availability settings not found');
      }

      const blackoutDate: BlackoutDate = {
        date,
        reason,
        isRecurring
      };

      settings.blackoutDates = settings.blackoutDates || [];
      settings.blackoutDates.push(blackoutDate);

      await this.updateAvailabilitySettings(userId, settings);
    } catch (error) {
      console.error('Add blackout date error:', error);
      throw error;
    }
  }

  /**
   * Get next available slot after a given time
   */
  async getNextAvailableSlot(
    userId: string,
    afterTime: Date,
    duration: number = 60 // minutes
  ): Promise<AvailableSlot | null> {
    try {
      const endDate = new Date(afterTime);
      endDate.setDate(endDate.getDate() + 30); // Look 30 days ahead

      const slots = await this.generateAvailableSlots(userId, afterTime, endDate);
      
      return slots.find(slot => 
        slot.available && 
        slot.duration >= duration &&
        new Date(slot.startTime) > afterTime
      ) || null;

    } catch (error) {
      console.error('Get next available slot error:', error);
      return null;
    }
  }

  /**
   * Check if a date is blacked out
   */
  private isDateBlackedOut(date: Date, blackoutDates: BlackoutDate[]): boolean {
    return blackoutDates.some(blackout => {
      const blackoutDate = new Date(blackout.date);
      return blackoutDate.toDateString() === date.toDateString();
    });
  }

  /**
   * Generate time slots for a specific day
   */
  private generateDaySlots(
    date: Date,
    timeSlot: TimeSlot,
    slotDuration: number,
    bufferTime: number,
    timezone: string,
    existingEvents: any[],
    minAdvanceBooking: number
  ): AvailableSlot[] {
    const slots: AvailableSlot[] = [];
    const [startHour, startMinute] = timeSlot.startTime.split(':').map(Number);
    const [endHour, endMinute] = timeSlot.endTime.split(':').map(Number);

    const slotStart = new Date(date);
    slotStart.setHours(startHour, startMinute, 0, 0);

    const slotEnd = new Date(date);
    slotEnd.setHours(endHour, endMinute, 0, 0);

    const currentSlotTime = new Date(slotStart);
    const now = new Date();
    const minAdvanceMs = minAdvanceBooking * 60 * 60 * 1000;

    while (currentSlotTime < slotEnd) {
      const nextSlotTime = new Date(currentSlotTime);
      nextSlotTime.setMinutes(nextSlotTime.getMinutes() + slotDuration);

      if (nextSlotTime <= slotEnd) {
        // Check if slot is in the future (with minimum advance booking)
        const isInFuture = currentSlotTime.getTime() > now.getTime() + minAdvanceMs;
        
        // Check if slot conflicts with existing events
        const hasConflict = existingEvents.some(event => {
          const eventStart = new Date(event.startTime);
          const eventEnd = new Date(event.endTime);
          return currentSlotTime < eventEnd && nextSlotTime > eventStart;
        });

        slots.push({
          startTime: currentSlotTime.toISOString(),
          endTime: nextSlotTime.toISOString(),
          duration: slotDuration,
          available: isInFuture && !hasConflict,
          timezone,
          bookingId: hasConflict ? this.findBookingId(currentSlotTime, nextSlotTime, existingEvents) : undefined
        });
      }

      // Add buffer time between slots
      currentSlotTime.setMinutes(currentSlotTime.getMinutes() + slotDuration + bufferTime);
    }

    return slots;
  }

  /**
   * Find booking ID for a conflicting time slot
   */
  private findBookingId(start: Date, end: Date, events: any[]): string | undefined {
    const conflictingEvent = events.find(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return start < eventEnd && end > eventStart;
    });

    return conflictingEvent?.bookingId || conflictingEvent?.id;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}