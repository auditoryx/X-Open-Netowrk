import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/getServerUser';
import { GoogleCalendarService } from '@/lib/calendar/google-calendar';
import { ConflictDetectionService } from '@/lib/calendar/conflict-detection';

// Initialize services
const googleCalendarService = new GoogleCalendarService({
  clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI!
});

const conflictDetectionService = new ConflictDetectionService();
conflictDetectionService.setGoogleCalendarService(googleCalendarService);

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { provider = 'google', force = false } = body;

    if (provider !== 'google') {
      return NextResponse.json(
        { error: 'Only Google Calendar sync is currently supported' },
        { status: 400 }
      );
    }

    // Check connection status first
    const status = await googleCalendarService.getConnectionStatus(user.uid);
    if (!status.connected) {
      return NextResponse.json(
        { error: 'Google Calendar is not connected' },
        { status: 400 }
      );
    }

    // Perform sync
    const syncResult = await googleCalendarService.syncCalendar(user.uid);

    return NextResponse.json({
      success: syncResult.success,
      provider: 'google',
      imported: syncResult.imported,
      exported: syncResult.exported,
      errors: syncResult.errors,
      lastSync: syncResult.lastSync,
      message: syncResult.success 
        ? `Sync completed successfully. Imported ${syncResult.imported} events, exported ${syncResult.exported} events.`
        : `Sync completed with ${syncResult.errors.length} errors.`
    });

  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync calendar',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'google';

    if (provider !== 'google') {
      return NextResponse.json(
        { error: 'Only Google Calendar sync is currently supported' },
        { status: 400 }
      );
    }

    // Get sync status
    const status = await googleCalendarService.getConnectionStatus(user.uid);

    return NextResponse.json({
      provider: 'google',
      connected: status.connected,
      lastSync: status.lastSync,
      connectedAt: status.connectedAt,
      email: status.email
    });

  } catch (error) {
    console.error('Sync status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get sync status',
        connected: false
      },
      { status: 500 }
    );
  }
}