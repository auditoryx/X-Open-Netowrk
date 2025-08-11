import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/getServerUser';
import { AvailabilityService } from '@/lib/calendar/availability';
import { ConflictDetectionService } from '@/lib/calendar/conflict-detection';
import { z } from 'zod';

const availabilityService = new AvailabilityService();
const conflictDetectionService = new ConflictDetectionService();

const AvailabilityQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  duration: z.number().min(15).max(480).optional(),
  userId: z.string().optional() // For checking other users' availability
});

const BlockTimeSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  reason: z.string().max(200).optional()
});

const CheckSlotSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  userId: z.string().optional() // For checking other users' availability
});

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
    const action = searchParams.get('action') || 'slots';
    
    switch (action) {
      case 'slots':
        return await getAvailableSlots(request, user.uid);
      
      case 'settings':
        return await getAvailabilitySettings(user.uid);
      
      case 'check':
        return await checkSlotAvailability(request, user.uid);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Availability GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'block';
    
    switch (action) {
      case 'block':
        return await blockTimeSlot(request, user.uid);
      
      case 'blackout':
        return await addBlackoutDate(request, user.uid);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Availability POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return await updateAvailabilitySettings(request, user.uid);

  } catch (error) {
    console.error('Availability PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get available time slots
 */
async function getAvailableSlots(request: NextRequest, currentUserId: string) {
  try {
    const { searchParams } = new URL(request.url);
    
    const queryData = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      duration: searchParams.get(SCHEMA_FIELDS.SERVICE.DURATION) ? parseInt(searchParams.get(SCHEMA_FIELDS.SERVICE.DURATION)!) : undefined,
      userId: searchParams.get(SCHEMA_FIELDS.NOTIFICATION.USER_ID) || currentUserId
    };

    if (!queryData.startDate || !queryData.endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const validatedQuery = AvailabilityQuerySchema.parse(queryData);
    
    // Check if user is requesting another user's availability
    if (validatedQuery.userId !== currentUserId) {
      // TODO: Add permission checks for viewing other users' calendars
      // For now, allow viewing any creator's availability
    }

    const startDate = new Date(validatedQuery.startDate);
    const endDate = new Date(validatedQuery.endDate);

    const slots = await availabilityService.generateAvailableSlots(
      validatedQuery.userId,
      startDate,
      endDate
    );

    // Filter by duration if specified
    const filteredSlots = validatedQuery.duration 
      ? slots.filter(slot => slot.duration >= validatedQuery.duration!)
      : slots;

    return NextResponse.json({
      userId: validatedQuery.userId,
      startDate: validatedQuery.startDate,
      endDate: validatedQuery.endDate,
      duration: validatedQuery.duration,
      slots: filteredSlots,
      totalSlots: filteredSlots.length,
      availableSlots: filteredSlots.filter(slot => slot.available).length
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Get available slots error:', error);
    return NextResponse.json(
      { error: 'Failed to get available slots' },
      { status: 500 }
    );
  }
}

/**
 * Get availability settings
 */
async function getAvailabilitySettings(userId: string) {
  try {
    const settings = await availabilityService.getAvailabilitySettings(userId);
    
    if (!settings) {
      return NextResponse.json(
        { error: 'Availability settings not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId,
      settings
    });

  } catch (error) {
    console.error('Get availability settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get availability settings' },
      { status: 500 }
    );
  }
}

/**
 * Check if a specific slot is available
 */
async function checkSlotAvailability(request: NextRequest, currentUserId: string) {
  try {
    const { searchParams } = new URL(request.url);
    
    const checkData = {
      startTime: searchParams.get('startTime'),
      endTime: searchParams.get('endTime'),
      userId: searchParams.get(SCHEMA_FIELDS.NOTIFICATION.USER_ID) || currentUserId
    };

    if (!checkData.startTime || !checkData.endTime) {
      return NextResponse.json(
        { error: 'startTime and endTime are required' },
        { status: 400 }
      );
    }

    const validatedCheck = CheckSlotSchema.parse(checkData);

    const conflictCheck = await availabilityService.isSlotAvailable(
      validatedCheck.userId,
      validatedCheck.startTime,
      validatedCheck.endTime
    );

    return NextResponse.json({
      userId: validatedCheck.userId,
      startTime: validatedCheck.startTime,
      endTime: validatedCheck.endTime,
      available: !conflictCheck.hasConflicts,
      conflicts: conflictCheck.conflicts
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Check slot availability error:', error);
    return NextResponse.json(
      { error: 'Failed to check slot availability' },
      { status: 500 }
    );
  }
}

/**
 * Block a time slot
 */
async function blockTimeSlot(request: NextRequest, userId: string) {
  try {
    const body = await request.json();
    const validatedBlock = BlockTimeSchema.parse(body);

    const eventId = await availabilityService.blockTimeSlot(
      userId,
      validatedBlock.startTime,
      validatedBlock.endTime,
      validatedBlock.reason
    );

    return NextResponse.json({
      success: true,
      eventId,
      message: 'Time slot blocked successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Block time slot error:', error);
    return NextResponse.json(
      { error: 'Failed to block time slot' },
      { status: 500 }
    );
  }
}

/**
 * Add blackout date
 */
async function addBlackoutDate(request: NextRequest, userId: string) {
  try {
    const body = await request.json();
    const { date, reason, isRecurring } = body;

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    await availabilityService.addBlackoutDate(userId, date, reason, isRecurring);

    return NextResponse.json({
      success: true,
      message: 'Blackout date added successfully'
    });

  } catch (error) {
    console.error('Add blackout date error:', error);
    return NextResponse.json(
      { error: 'Failed to add blackout date' },
      { status: 500 }
    );
  }
}

/**
 * Update availability settings
 */
async function updateAvailabilitySettings(request: NextRequest, userId: string) {
  try {
    const body = await request.json();
    
    const success = await availabilityService.updateAvailabilitySettings(userId, body);

    return NextResponse.json({
      success,
      message: 'Availability settings updated successfully'
    });

  } catch (error) {
    console.error('Update availability settings error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update availability settings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}