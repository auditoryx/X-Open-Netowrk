import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EnterpriseService, CreateOrganizationSchema } from '@/lib/services/enterpriseService';
import { TenantAwarePrismaClient, getTenantContextFromHeaders } from '@/lib/middleware/tenancy';
import RBACService, { Resource, Action } from '@/lib/auth/rbac';

const prisma = new PrismaClient();
const enterpriseService = new EnterpriseService(prisma);
const rbac = RBACService.getInstance();

/**
 * POST /api/enterprise/organizations
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = CreateOrganizationSchema.parse(body);
    
    // Create organization
    const organization = await enterpriseService.createOrganization(validatedData);
    
    return NextResponse.json({
      success: true,
      data: organization,
      message: 'Organization created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating organization:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create organization'
    }, { status: 500 });
  }
}

/**
 * GET /api/enterprise/organizations
 * List organizations (Super Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // For now, return mock data
    // In production, this would require super admin authentication
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            artists: true,
            bookings: true,
            projects: true
          }
        },
        subscriptions: {
          where: { status: 'ACTIVE' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({
      success: true,
      data: organizations
    });
    
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch organizations'
    }, { status: 500 });
  }
}
