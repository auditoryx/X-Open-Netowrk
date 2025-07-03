import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EnterpriseService } from '@/lib/services/enterpriseService';
import { getTenantContextFromHeaders } from '@/lib/middleware/tenancy';

const prisma = new PrismaClient();
const enterpriseService = new EnterpriseService(prisma);

/**
 * POST /api/enterprise/bookings/bulk-book
 * Create multiple bookings in bulk
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantContext = getTenantContextFromHeaders(request.headers);
    
    if (!tenantContext) {
      return NextResponse.json({
        success: false,
        error: 'Organization context required'
      }, { status: 400 });
    }
    
    const { sessionTitle, bookings } = body;
    
    // Create all bookings in a transaction
    const createdBookings = await prisma.$transaction(
      bookings.map((booking: any) => 
        prisma.booking.create({
          data: {
            organizationId: tenantContext.organizationId,
            title: booking.title || sessionTitle,
            description: booking.description,
            artistId: booking.artistId,
            clientId: booking.clientId || tenantContext.user.id,
            createdBy: tenantContext.user.id,
            type: booking.type,
            status: 'PENDING_APPROVAL',
            priority: booking.priority || 'MEDIUM',
            startDate: new Date(booking.startDate),
            endDate: new Date(booking.endDate),
            duration: booking.duration,
            timezone: booking.timezone || 'UTC',
            location: booking.location,
            isRemote: booking.isRemote || false,
            budget: booking.budget,
            requirements: booking.requirements,
            notes: booking.notes,
          }
        })
      )
    );
    
    return NextResponse.json({
      success: true,
      data: createdBookings,
      message: `${createdBookings.length} bookings created successfully`
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating bulk bookings:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create bookings'
    }, { status: 500 });
  }
}

/**
 * GET /api/enterprise/bookings/calendar
 * Get calendar view of bookings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantContext = getTenantContextFromHeaders(request.headers);
    
    if (!tenantContext) {
      return NextResponse.json({
        success: false,
        error: 'Organization context required'
      }, { status: 400 });
    }
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const artistIds = searchParams.get('artistIds')?.split(',');
    
    const whereClause: any = {
      organizationId: tenantContext.organizationId,
    };
    
    if (startDate && endDate) {
      whereClause.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    if (artistIds && artistIds.length > 0) {
      whereClause.artistId = {
        in: artistIds,
      };
    }
    
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            stageName: true,
            avatar: true,
          }
        },
        project: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      data: bookings
    });
    
  } catch (error: any) {
    console.error('Error fetching calendar bookings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch calendar data'
    }, { status: 500 });
  }
}
