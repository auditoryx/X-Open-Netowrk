/**
 * Google Calendar Integration for AuditoryX
 * 
 * Handles OAuth connection, event sync, and availability management
 */

import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase-admin';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{ email: string; }>;
  conferenceData?: any;
}

export interface SyncResult {
  success: boolean;
  imported: number;
  exported: number;
  errors: string[];
  lastSync: string;
}

export class GoogleCalendarService {
  private config: GoogleCalendarConfig;
  private oauth2Client: OAuth2Client;

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  getAuthUrl(userId: string): string {
    const state = Buffer.from(JSON.stringify({ userId, provider: 'google' })).toString('base64');
    
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, userId: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiryDate?: number;
  }> {
    try {
      const { tokens } = await this.oauth2Client.getAccessToken(code);
      
      if (!tokens.access_token) {
        throw new Error('No access token received');
      }

      // Store tokens in user document
      await adminDb.doc(`users/${userId}`).update({
        googleCalendar: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: tokens.expiry_date,
          connected: true,
          connectedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiryDate: tokens.expiry_date || undefined
      };

    } catch (error) {
      console.error('Token exchange error:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Get user's calendar connection status
   */
  async getConnectionStatus(userId: string): Promise<{
    connected: boolean;
    connectedAt?: string;
    lastSync?: string;
    email?: string;
  }> {
    try {
      const userDoc = await adminDb.doc(`users/${userId}`).get();
      if (!userDoc.exists) {
        return { connected: false };
      }

      const userData = userDoc.data();
      const googleCalendar = userData?.googleCalendar;

      if (!googleCalendar?.connected || !googleCalendar?.accessToken) {
        return { connected: false };
      }

      // Check if token is still valid
      this.oauth2Client.setCredentials({
        access_token: googleCalendar.accessToken,
        refresh_token: googleCalendar.refreshToken
      });

      try {
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        const response = await calendar.calendarList.list();
        
        return {
          connected: true,
          connectedAt: googleCalendar.connectedAt,
          lastSync: googleCalendar.lastSync,
          email: response.data.items?.[0]?.summary
        };
      } catch (authError) {
        // Token might be expired, try to refresh
        if (googleCalendar.refreshToken) {
          try {
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            
            // Update stored tokens
            await adminDb.doc(`users/${userId}`).update({
              'googleCalendar.accessToken': credentials.access_token,
              'googleCalendar.expiryDate': credentials.expiry_date,
              updatedAt: new Date().toISOString()
            });

            return {
              connected: true,
              connectedAt: googleCalendar.connectedAt,
              lastSync: googleCalendar.lastSync
            };
          } catch (refreshError) {
            // Refresh failed, mark as disconnected
            await adminDb.doc(`users/${userId}`).update({
              'googleCalendar.connected': false,
              updatedAt: new Date().toISOString()
            });
            return { connected: false };
          }
        }

        return { connected: false };
      }

    } catch (error) {
      console.error('Connection status check error:', error);
      return { connected: false };
    }
  }

  /**
   * Disconnect Google Calendar
   */
  async disconnect(userId: string): Promise<void> {
    try {
      await adminDb.doc(`users/${userId}`).update({
        googleCalendar: {
          connected: false,
          disconnectedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      throw new Error('Failed to disconnect Google Calendar');
    }
  }

  /**
   * Sync events between AuditoryX and Google Calendar
   */
  async syncCalendar(userId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      imported: 0,
      exported: 0,
      errors: [],
      lastSync: new Date().toISOString()
    };

    try {
      // Get user's Google Calendar credentials
      const userDoc = await adminDb.doc(`users/${userId}`).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const googleCalendar = userData?.googleCalendar;

      if (!googleCalendar?.connected || !googleCalendar?.accessToken) {
        throw new Error('Google Calendar not connected');
      }

      // Set up OAuth client
      this.oauth2Client.setCredentials({
        access_token: googleCalendar.accessToken,
        refresh_token: googleCalendar.refreshToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Import events from Google Calendar
      const importResult = await this.importFromGoogle(userId, calendar);
      result.imported = importResult.count;
      result.errors.push(...importResult.errors);

      // Export AuditoryX events to Google Calendar
      const exportResult = await this.exportToGoogle(userId, calendar);
      result.exported = exportResult.count;
      result.errors.push(...exportResult.errors);

      // Update last sync time
      await adminDb.doc(`users/${userId}`).update({
        'googleCalendar.lastSync': result.lastSync,
        updatedAt: new Date().toISOString()
      });

      result.success = result.errors.length === 0;
      return result;

    } catch (error) {
      console.error('Calendar sync error:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
      return result;
    }
  }

  /**
   * Import events from Google Calendar
   */
  private async importFromGoogle(userId: string, calendar: any): Promise<{
    count: number;
    errors: string[];
  }> {
    const result = { count: 0, errors: [] };

    try {
      // Get events from the past 30 days and next 90 days
      const timeMin = new Date();
      timeMin.setDate(timeMin.getDate() - 30);
      const timeMax = new Date();
      timeMax.setDate(timeMax.getDate() + 90);

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250
      });

      const events = response.data.items || [];
      const userDoc = await adminDb.doc(`users/${userId}`).get();
      const userData = userDoc.data();
      const existingEvents = userData?.calendarEvents || [];

      for (const event of events) {
        try {
          // Skip events that are already imported (check by Google event ID)
          const alreadyImported = existingEvents.some((existing: any) => 
            existing.googleEventId === event.id
          );

          if (alreadyImported) continue;

          // Convert Google event to AuditoryX format
          const auditorEvent = {
            id: this.generateEventId(),
            googleEventId: event.id,
            title: event.summary || 'Imported Event',
            description: event.description,
            startTime: event.start?.dateTime || event.start?.date,
            endTime: event.end?.dateTime || event.end?.date,
            type: 'blocked', // Mark imported events as blocked time
            source: 'google',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          existingEvents.push(auditorEvent);
          result.count++;

        } catch (eventError) {
          result.errors.push(`Failed to import event ${event.id}: ${eventError}`);
        }
      }

      // Update user's calendar events
      if (result.count > 0) {
        await adminDb.doc(`users/${userId}`).update({
          calendarEvents: existingEvents,
          updatedAt: new Date().toISOString()
        });
      }

    } catch (error) {
      result.errors.push(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Export AuditoryX events to Google Calendar
   */
  private async exportToGoogle(userId: string, calendar: any): Promise<{
    count: number;
    errors: string[];
  }> {
    const result = { count: 0, errors: [] };

    try {
      const userDoc = await adminDb.doc(`users/${userId}`).get();
      const userData = userDoc.data();
      const events = userData?.calendarEvents || [];

      // Filter events that should be exported (bookings, not already exported)
      const eventsToExport = events.filter((event: any) => 
        event.type === 'booking' && 
        !event.googleEventId && 
        event.source !== 'google'
      );

      for (const event of eventsToExport) {
        try {
          const googleEvent: CalendarEvent = {
            summary: event.title,
            description: event.description,
            start: {
              dateTime: event.startTime,
              timeZone: userData?.timezone || 'UTC'
            },
            end: {
              dateTime: event.endTime,
              timeZone: userData?.timezone || 'UTC'
            }
          };

          const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: googleEvent
          });

          // Update the local event with Google event ID
          const eventIndex = events.findIndex((e: any) => e.id === event.id);
          if (eventIndex !== -1) {
            events[eventIndex].googleEventId = response.data.id;
            events[eventIndex].updatedAt = new Date().toISOString();
          }

          result.count++;

        } catch (eventError) {
          result.errors.push(`Failed to export event ${event.id}: ${eventError}`);
        }
      }

      // Update user's calendar events with Google IDs
      if (result.count > 0) {
        await adminDb.doc(`users/${userId}`).update({
          calendarEvents: events,
          updatedAt: new Date().toISOString()
        });
      }

    } catch (error) {
      result.errors.push(`Export error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Create a Google Calendar event for a booking
   */
  async createBookingEvent(userId: string, booking: {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    clientEmail?: string;
    providerEmail?: string;
  }): Promise<string | null> {
    try {
      const userDoc = await adminDb.doc(`users/${userId}`).get();
      if (!userDoc.exists) return null;

      const userData = userDoc.data();
      const googleCalendar = userData?.googleCalendar;

      if (!googleCalendar?.connected || !googleCalendar?.accessToken) {
        return null; // Not connected, skip
      }

      this.oauth2Client.setCredentials({
        access_token: googleCalendar.accessToken,
        refresh_token: googleCalendar.refreshToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const attendees = [];
      if (booking.clientEmail) attendees.push({ email: booking.clientEmail });
      if (booking.providerEmail) attendees.push({ email: booking.providerEmail });

      const event: CalendarEvent = {
        summary: booking.title,
        description: booking.description,
        start: {
          dateTime: booking.startTime,
          timeZone: userData?.timezone || 'UTC'
        },
        end: {
          dateTime: booking.endTime,
          timeZone: userData?.timezone || 'UTC'
        },
        attendees
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all' // Send invitations to attendees
      });

      return response.data.id || null;

    } catch (error) {
      console.error('Create booking event error:', error);
      return null;
    }
  }

  /**
   * Check for calendar conflicts
   */
  async checkConflicts(userId: string, startTime: string, endTime: string): Promise<{
    hasConflicts: boolean;
    conflicts: any[];
  }> {
    try {
      const userDoc = await adminDb.doc(`users/${userId}`).get();
      if (!userDoc.exists) {
        return { hasConflicts: false, conflicts: [] };
      }

      const userData = userDoc.data();
      const googleCalendar = userData?.googleCalendar;

      if (!googleCalendar?.connected || !googleCalendar?.accessToken) {
        // Check only local events
        const events = userData?.calendarEvents || [];
        const conflicts = events.filter((event: any) => {
          const eventStart = new Date(event.startTime);
          const eventEnd = new Date(event.endTime);
          const requestStart = new Date(startTime);
          const requestEnd = new Date(endTime);

          return requestStart < eventEnd && requestEnd > eventStart;
        });

        return { hasConflicts: conflicts.length > 0, conflicts };
      }

      // Check Google Calendar for conflicts
      this.oauth2Client.setCredentials({
        access_token: googleCalendar.accessToken,
        refresh_token: googleCalendar.refreshToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startTime,
        timeMax: endTime,
        singleEvents: true
      });

      const googleConflicts = response.data.items || [];
      
      // Also check local events
      const localEvents = userData?.calendarEvents || [];
      const localConflicts = localEvents.filter((event: any) => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        const requestStart = new Date(startTime);
        const requestEnd = new Date(endTime);

        return requestStart < eventEnd && requestEnd > eventStart;
      });

      const allConflicts = [...googleConflicts, ...localConflicts];

      return {
        hasConflicts: allConflicts.length > 0,
        conflicts: allConflicts
      };

    } catch (error) {
      console.error('Conflict check error:', error);
      return { hasConflicts: false, conflicts: [] };
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}