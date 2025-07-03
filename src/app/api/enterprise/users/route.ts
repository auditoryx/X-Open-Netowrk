import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EnterpriseService, BulkCreateUsersSchema } from '@/lib/services/enterpriseService';
import { getTenantContextFromHeaders } from '@/lib/middleware/tenancy';

const prisma = new PrismaClient();
const enterpriseService = new EnterpriseService(prisma);

/**
 * POST /api/enterprise/users/bulk-create
 * Bulk create users for an organization
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
    
    // Validate input
    const validatedUsers = BulkCreateUsersSchema.parse(body.users);
    
    // Create users
    const createdUsers = await enterpriseService.bulkCreateUsers(
      tenantContext.organizationId,
      validatedUsers
    );
    
    return NextResponse.json({
      success: true,
      data: createdUsers,
      message: `${createdUsers.length} users created successfully`
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error bulk creating users:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create users'
    }, { status: 500 });
  }
}

/**
 * GET /api/enterprise/users/roster
 * Get artist roster for organization
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
    
    // Parse query parameters
    const filters = {
      search: searchParams.get('search') || undefined,
      genres: searchParams.get('genres')?.split(',') || undefined,
      skills: searchParams.get('skills')?.split(',') || undefined,
      verificationStatus: searchParams.get('verificationStatus') || undefined,
      isActive: searchParams.get('isActive') ? 
        searchParams.get('isActive') === 'true' : undefined,
      limit: searchParams.get('limit') ? 
        parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? 
        parseInt(searchParams.get('offset')!) : undefined,
    };
    
    const rosterData = await enterpriseService.getArtistRoster(
      tenantContext.organizationId,
      filters
    );
    
    return NextResponse.json({
      success: true,
      data: rosterData
    });
    
  } catch (error: any) {
    console.error('Error fetching artist roster:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch artist roster'
    }, { status: 500 });
  }
}
