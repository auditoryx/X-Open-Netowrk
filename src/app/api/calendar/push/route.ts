import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { CalendarSyncService, AvailabilitySlot } from '@/lib/google/calendarSync';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // Handle conflict check action
    if (action === 'check-conflicts') {
      const { slot } = body;

      if (!slot) {
        return NextResponse.json({ error: 'Slot data required' }, { status: 400 });
      }

      const syncService = new CalendarSyncService(session.accessToken);
      const hasConflict = await syncService.detectConflicts(session.user.id, slot);
      
      return NextResponse.json({ 
        hasConflict,
        message: hasConflict ? 'Conflict detected' : 'No conflicts found'
      });
    }

    // Default push availability action
    const { slots } = body;

    if (!slots || !Array.isArray(slots)) {
      return NextResponse.json({ error: 'Invalid slots data' }, { status: 400 });
    }

    const syncService = new CalendarSyncService(session.accessToken);
    await syncService.pushAvailability(session.user.id, slots);
    
    return NextResponse.json({ 
      success: true, 
      message: `${slots.length} availability slots pushed to calendar` 
    });
  } catch (error) {
    console.error('Calendar push error:', error);
    return NextResponse.json({ 
      error: 'Push failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}