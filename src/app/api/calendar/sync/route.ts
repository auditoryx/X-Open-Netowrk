import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { CalendarSyncService } from '@/lib/google/calendarSync';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const syncService = new CalendarSyncService(session.accessToken);
    await syncService.syncAvailability(session.user.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Calendar synced successfully' 
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json({ 
      error: 'Sync failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const syncService = new CalendarSyncService(session.accessToken);
    const calendarInfo = await syncService.getCalendarInfo();
    
    return NextResponse.json(calendarInfo);
  } catch (error) {
    console.error('Calendar info error:', error);
    return NextResponse.json({ 
      error: 'Failed to get calendar info', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}