/**
 * Enhanced Conflict Detection API
 * 
 * Provides comprehensive conflict checking across all calendar sources
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ConflictDetectionService } from '@/lib/calendar/conflict-detection';
import { z } from 'zod';

// Request validation schema
const ConflictCheckSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string().optional().default('UTC'),
  excludeBookingId: z.string().optional(),
  providerId: z.string().optional() // For checking other user's availability
});

const AvailabilityRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  providerId: z.string().optional()
});

/**
 * POST /api/calendar/conflicts
 * Check for scheduling conflicts
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = ConflictCheckSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 });
    }

    const { startTime, endTime, timezone, excludeBookingId, providerId } = validation.data;
    
    // Use provided providerId or current user's ID
    const targetUserId = providerId || session.user.uid;
    
    // Get calendar access tokens
    const googleToken = session.googleAccessToken;
    const microsoftToken = session.microsoftAccessToken;

    const conflictService = new ConflictDetectionService(
      targetUserId,
      googleToken,
      microsoftToken
    );

    const conflictResult = await conflictService.detectConflicts({
      startTime,
      endTime,
      timezone,
      excludeBookingId
    });

    return NextResponse.json({
      success: true,
      ...conflictResult,
      checkedSources: {
        internal: true,
        google: !!googleToken,
        microsoft: !!microsoftToken,
        blocked: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Conflict detection error:', error);
    
    return NextResponse.json({
      error: 'Conflict detection failed',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/calendar/conflicts
 * Get comprehensive availability for a date range
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const providerId = searchParams.get('providerId');

    if (!startDate || !endDate) {
      return NextResponse.json({
        error: 'startDate and endDate parameters are required'
      }, { status: 400 });
    }

    const validation = AvailabilityRequestSchema.safeParse({
      startDate,
      endDate,
      providerId
    });

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid date parameters',
        details: validation.error.errors
      }, { status: 400 });
    }

    const targetUserId = providerId || session.user.uid;
    
    // Get calendar access tokens
    const googleToken = session.googleAccessToken;
    const microsoftToken = session.microsoftAccessToken;

    const conflictService = new ConflictDetectionService(
      targetUserId,
      googleToken,
      microsoftToken
    );

    const availability = await conflictService.getAvailability(startDate, endDate);

    return NextResponse.json({
      success: true,
      ...availability,
      dateRange: {
        startDate,
        endDate
      },
      checkedSources: {
        internal: true,
        google: !!googleToken,
        microsoft: !!microsoftToken,
        blocked: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Availability check error:', error);
    
    return NextResponse.json({
      error: 'Availability check failed',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * PUT /api/calendar/conflicts
 * Bulk conflict check for multiple time slots
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { slots, providerId } = body;

    if (!slots || !Array.isArray(slots)) {
      return NextResponse.json({
        error: 'Valid slots array is required'
      }, { status: 400 });
    }

    if (slots.length > 50) {
      return NextResponse.json({
        error: 'Maximum 50 slots can be checked at once'
      }, { status: 400 });
    }

    const targetUserId = providerId || session.user.uid;
    
    // Get calendar access tokens
    const googleToken = session.googleAccessToken;
    const microsoftToken = session.microsoftAccessToken;

    const conflictService = new ConflictDetectionService(
      targetUserId,
      googleToken,
      microsoftToken
    );

    const results = [];

    for (const slot of slots) {
      try {
        const validation = ConflictCheckSchema.safeParse(slot);
        
        if (!validation.success) {
          results.push({
            slot,
            error: 'Invalid slot data',
            details: validation.error.errors
          });
          continue;
        }

        const conflictResult = await conflictService.detectConflicts(validation.data);
        results.push({
          slot: validation.data,
          ...conflictResult
        });
      } catch (error: any) {
        results.push({
          slot,
          error: 'Conflict check failed',
          details: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: slots.length,
        conflicts: results.filter(r => r.hasConflict).length,
        available: results.filter(r => !r.hasConflict && !r.error).length,
        errors: results.filter(r => r.error).length
      },
      checkedSources: {
        internal: true,
        google: !!googleToken,
        microsoft: !!microsoftToken,
        blocked: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Bulk conflict check error:', error);
    
    return NextResponse.json({
      error: 'Bulk conflict check failed',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}