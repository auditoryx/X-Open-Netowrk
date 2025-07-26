/**
 * Microsoft Calendar API Routes
 * 
 * Handles Microsoft Graph calendar integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { MicrosoftCalendarService } from '@/lib/calendar/microsoft-calendar';
import { adminDb } from '@/lib/firebase-admin';

/**
 * POST /api/calendar/microsoft/sync
 * Sync Microsoft Calendar events
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Microsoft access token
    const microsoftToken = session.microsoftAccessToken; // This would need to be added to session
    if (!microsoftToken) {
      return NextResponse.json({ 
        error: 'Microsoft calendar not connected' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { syncType } = body;

    const calendarService = new MicrosoftCalendarService(microsoftToken);

    if (syncType === 'import') {
      // Import calendar events from Microsoft
      await calendarService.syncAvailability(session.user.uid);
      
      return NextResponse.json({
        success: true,
        message: 'Microsoft calendar events imported successfully'
      });
    } 
    else if (syncType === 'export') {
      // Export availability to Microsoft calendar
      const { slots } = body;
      if (!slots || !Array.isArray(slots)) {
        return NextResponse.json({ 
          error: 'Valid slots array required for export' 
        }, { status: 400 });
      }

      await calendarService.pushAvailability(session.user.uid, slots);
      
      return NextResponse.json({
        success: true,
        message: `${slots.length} availability slots exported to Microsoft calendar`
      });
    }
    else {
      // Store sync data from frontend
      const { busySlots, eventCount } = body;
      
      await adminDb.doc(`availability/${session.user.uid}`).update({
        microsoftBusySlots: busySlots,
        microsoftLastSynced: new Date().toISOString(),
        microsoftSyncStatus: 'success',
        microsoftEventCount: eventCount
      });

      // Log sync activity
      await adminDb.collection('calendar_syncs').add({
        userId: session.user.uid,
        provider: 'microsoft',
        syncType: 'import',
        eventCount,
        timestamp: new Date().toISOString(),
        status: 'success'
      });

      return NextResponse.json({
        success: true,
        message: 'Microsoft calendar sync data stored successfully'
      });
    }

  } catch (error: any) {
    console.error('Microsoft calendar sync error:', error);

    // Log sync error if we have user context
    const session = await getServerSession(authOptions);
    if (session?.user?.uid) {
      try {
        await adminDb.collection('calendar_syncs').add({
          userId: session.user.uid,
          provider: 'microsoft',
          syncType: 'import',
          timestamp: new Date().toISOString(),
          status: 'error',
          error: error.message || 'Unknown error'
        });

        await adminDb.doc(`availability/${session.user.uid}`).update({
          microsoftSyncStatus: 'error',
          microsoftSyncError: error.message || 'Unknown error',
          microsoftLastSyncAttempt: new Date().toISOString()
        });
      } catch (logError) {
        console.error('Failed to log Microsoft sync error:', logError);
      }
    }

    return NextResponse.json({
      error: 'Microsoft calendar sync failed',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/calendar/microsoft/sync
 * Get Microsoft calendar connection status and info
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const microsoftToken = session.microsoftAccessToken;
    if (!microsoftToken) {
      return NextResponse.json({
        connected: false,
        message: 'Microsoft calendar not connected'
      });
    }

    const calendarService = new MicrosoftCalendarService(microsoftToken);
    const [calendarInfo, userSettings] = await Promise.all([
      calendarService.getCalendarInfo(),
      calendarService.getUserSettings()
    ]);

    // Get last sync info from database
    const availabilityDoc = await adminDb.doc(`availability/${session.user.uid}`).get();
    const availabilityData = availabilityDoc.data();

    return NextResponse.json({
      connected: true,
      calendarInfo,
      userSettings,
      lastSync: availabilityData?.microsoftLastSynced || null,
      lastSyncStatus: availabilityData?.microsoftSyncStatus || null,
      eventCount: availabilityData?.microsoftEventCount || 0
    });

  } catch (error: any) {
    console.error('Microsoft calendar info error:', error);
    
    return NextResponse.json({
      connected: false,
      error: 'Failed to get Microsoft calendar info',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}