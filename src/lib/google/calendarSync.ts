import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase-admin';
import { DateTime } from 'luxon';

export interface AvailabilitySlot {
  day: string;
  time: string;
  timezone: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  attendees?: string[];
}

export class CalendarSyncService {
  private calendar: any;
  private auth: any;
  
  constructor(accessToken: string) {
    this.auth = new google.auth.OAuth2();
    this.auth.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  async syncAvailability(userId: string): Promise<void> {
    try {
      const events = await this.getCalendarEvents();
      const busySlots = this.convertEventsToBusySlots(events);
      
      await adminDb.doc(`availability/${userId}`).update({
        busySlots,
        lastSynced: new Date().toISOString(),
        syncStatus: 'success'
      });

      // Log sync activity
      await adminDb.collection('calendar_syncs').add({
        userId,
        syncType: 'import',
        eventCount: events.length,
        timestamp: new Date().toISOString(),
        status: 'success'
      });

    } catch (error) {
      console.error('Calendar sync error:', error);
      
      await adminDb.doc(`availability/${userId}`).update({
        syncStatus: 'error',
        syncError: error instanceof Error ? error.message : 'Unknown error',
        lastSyncAttempt: new Date().toISOString()
      });

      // Log sync error
      await adminDb.collection('calendar_syncs').add({
        userId,
        syncType: 'import',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  async pushAvailability(userId: string, slots: AvailabilitySlot[]): Promise<void> {
    const createdEvents: string[] = [];
    
    try {
      for (const slot of slots) {
        const eventId = await this.createCalendarEvent(slot);
        createdEvents.push(eventId);
      }

      // Log successful push
      await adminDb.collection('calendar_syncs').add({
        userId,
        syncType: 'export',
        eventCount: slots.length,
        timestamp: new Date().toISOString(),
        status: 'success',
        eventIds: createdEvents
      });

    } catch (error) {
      console.error('Calendar push error:', error);
      
      // Clean up partially created events
      await this.cleanupEvents(createdEvents);
      
      // Log push error
      await adminDb.collection('calendar_syncs').add({
        userId,
        syncType: 'export',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  async detectConflicts(userId: string, newSlot: AvailabilitySlot): Promise<boolean> {
    try {
      const events = await this.getCalendarEvents(newSlot.startTime, newSlot.endTime);
      return events.length > 0;
    } catch (error) {
      console.error('Conflict detection error:', error);
      return false; // Assume no conflict if we can't check
    }
  }

  private async getCalendarEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    const response = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      maxResults: 250,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    return (response.data.items || []).map((event: any) => ({
      id: event.id,
      summary: event.summary || '',
      description: event.description || '',
      startTime: event.start?.dateTime || event.start?.date || '',
      endTime: event.end?.dateTime || event.end?.date || '',
      timezone: event.start?.timeZone || 'UTC',
      attendees: event.attendees?.map((attendee: any) => attendee.email) || []
    }));
  }

  private convertEventsToBusySlots(events: CalendarEvent[]): Array<{day: string, time: string}> {
    return events.map(event => {
      const date = new Date(event.startTime);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const time = date.toTimeString().slice(0, 5);
      return { day, time };
    });
  }

  private async createCalendarEvent(slot: AvailabilitySlot): Promise<string> {
    const event = {
      summary: 'Available - AuditoryX',
      description: 'Available for booking through AuditoryX Platform',
      start: {
        dateTime: slot.startTime,
        timeZone: slot.timezone
      },
      end: {
        dateTime: slot.endTime,
        timeZone: slot.timezone
      },
      colorId: '2', // Green color for availability
      transparency: 'transparent', // Show as free time
      visibility: 'private'
    };

    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    });

    return response.data.id;
  }

  private async cleanupEvents(eventIds: string[]): Promise<void> {
    for (const eventId of eventIds) {
      try {
        await this.calendar.events.delete({
          calendarId: 'primary',
          eventId: eventId
        });
      } catch (error) {
        console.error(`Failed to cleanup event ${eventId}:`, error);
      }
    }
  }

  async getCalendarInfo(): Promise<{name: string, timezone: string}> {
    try {
      const response = await this.calendar.calendars.get({
        calendarId: 'primary'
      });
      
      return {
        name: response.data.summary || 'Primary Calendar',
        timezone: response.data.timeZone || 'UTC'
      };
    } catch (error) {
      console.error('Failed to get calendar info:', error);
      return {
        name: 'Primary Calendar',
        timezone: 'UTC'
      };
    }
  }
}