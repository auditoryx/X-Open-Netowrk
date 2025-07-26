/**
 * Microsoft Graph Calendar Integration
 * 
 * Provides calendar sync capabilities with Microsoft Outlook/365
 */

export interface MicrosoftCalendarEvent {
  id: string;
  subject: string;
  body?: {
    content: string;
    contentType: 'text' | 'html';
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
  }>;
  showAs: 'free' | 'busy' | 'tentative' | 'oof' | 'workingElsewhere' | 'unknown';
}

export interface AvailabilitySlot {
  day: string;
  time: string;
  timezone: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export class MicrosoftCalendarService {
  private accessToken: string;
  private baseUrl = 'https://graph.microsoft.com/v1.0';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Sync availability from Microsoft Calendar
   */
  async syncAvailability(userId: string): Promise<void> {
    try {
      const events = await this.getCalendarEvents();
      const busySlots = this.convertEventsToBusySlots(events);
      
      // Update availability in Firebase (using admin SDK would be better)
      const response = await fetch('/api/calendar/microsoft/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          userId,
          busySlots,
          eventCount: events.length,
          syncType: 'microsoft'
        })
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

    } catch (error) {
      console.error('Microsoft Calendar sync error:', error);
      throw error;
    }
  }

  /**
   * Push availability to Microsoft Calendar
   */
  async pushAvailability(userId: string, slots: AvailabilitySlot[]): Promise<void> {
    const createdEvents: string[] = [];
    
    try {
      for (const slot of slots) {
        const eventId = await this.createCalendarEvent(slot);
        createdEvents.push(eventId);
      }

      // Log successful push
      await this.logSyncActivity(userId, 'export', slots.length, 'success', createdEvents);

    } catch (error) {
      console.error('Microsoft Calendar push error:', error);
      
      // Clean up partially created events
      await this.cleanupEvents(createdEvents);
      
      // Log push error
      await this.logSyncActivity(userId, 'export', slots.length, 'error');

      throw error;
    }
  }

  /**
   * Detect conflicts with existing calendar events
   */
  async detectConflicts(startTime: string, endTime: string): Promise<boolean> {
    try {
      const events = await this.getCalendarEvents(startTime, endTime);
      return events.some(event => event.showAs === 'busy' || event.showAs === 'oof');
    } catch (error) {
      console.error('Microsoft Calendar conflict detection error:', error);
      return false; // Assume no conflict if we can't check
    }
  }

  /**
   * Get calendar events from Microsoft Graph
   */
  private async getCalendarEvents(
    startTime?: string, 
    endTime?: string
  ): Promise<MicrosoftCalendarEvent[]> {
    const start = startTime || new Date().toISOString();
    const end = endTime || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    const url = `${this.baseUrl}/me/calendarview?startDateTime=${start}&endDateTime=${end}&$select=id,subject,body,start,end,attendees,showAs&$top=250`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Microsoft calendar access token expired. Please reconnect.');
      }
      throw new Error(`Microsoft Graph API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.value || [];
  }

  /**
   * Create a calendar event in Microsoft Calendar
   */
  private async createCalendarEvent(slot: AvailabilitySlot): Promise<string> {
    const event = {
      subject: 'Available - AuditoryX',
      body: {
        contentType: 'text',
        content: 'Available for booking through AuditoryX Platform'
      },
      start: {
        dateTime: slot.startTime,
        timeZone: slot.timezone
      },
      end: {
        dateTime: slot.endTime,
        timeZone: slot.timezone
      },
      categories: ['AuditoryX', 'Available'],
      showAs: 'free', // Show as free time
      sensitivity: 'private'
    };

    const response = await fetch(`${this.baseUrl}/me/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error(`Failed to create Microsoft calendar event: ${response.status} ${response.statusText}`);
    }

    const createdEvent = await response.json();
    return createdEvent.id;
  }

  /**
   * Convert Microsoft calendar events to busy slots
   */
  private convertEventsToBusySlots(events: MicrosoftCalendarEvent[]): Array<{day: string, time: string}> {
    return events
      .filter(event => event.showAs === 'busy' || event.showAs === 'oof')
      .map(event => {
        const date = new Date(event.start.dateTime);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        const time = date.toTimeString().slice(0, 5);
        return { day, time };
      });
  }

  /**
   * Clean up events if push operation fails
   */
  private async cleanupEvents(eventIds: string[]): Promise<void> {
    for (const eventId of eventIds) {
      try {
        await fetch(`${this.baseUrl}/me/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        });
      } catch (error) {
        console.error(`Failed to cleanup Microsoft calendar event ${eventId}:`, error);
      }
    }
  }

  /**
   * Log sync activity
   */
  private async logSyncActivity(
    userId: string,
    syncType: 'import' | 'export',
    eventCount: number,
    status: 'success' | 'error',
    eventIds?: string[]
  ): Promise<void> {
    try {
      await fetch('/api/calendar/microsoft/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          syncType,
          eventCount,
          status,
          eventIds,
          timestamp: new Date().toISOString(),
          provider: 'microsoft'
        })
      });
    } catch (error) {
      console.error('Failed to log Microsoft calendar sync activity:', error);
    }
  }

  /**
   * Get calendar info
   */
  async getCalendarInfo(): Promise<{name: string, timezone: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/me/calendar`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get calendar info: ${response.status}`);
      }

      const calendar = await response.json();
      
      return {
        name: calendar.name || 'Primary Calendar',
        timezone: calendar.timeZone || 'UTC'
      };
    } catch (error) {
      console.error('Failed to get Microsoft calendar info:', error);
      return {
        name: 'Primary Calendar',
        timezone: 'UTC'
      };
    }
  }

  /**
   * Get user's mailbox settings including timezone
   */
  async getUserSettings(): Promise<{timezone: string, workingHours?: any}> {
    try {
      const response = await fetch(`${this.baseUrl}/me/mailboxSettings`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get user settings: ${response.status}`);
      }

      const settings = await response.json();
      
      return {
        timezone: settings.timeZone || 'UTC',
        workingHours: settings.workingHours
      };
    } catch (error) {
      console.error('Failed to get Microsoft user settings:', error);
      return { timezone: 'UTC' };
    }
  }
}