import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EnterpriseService } from '@/lib/services/enterpriseService';
import { TenantAwarePrismaClient, getTenantContextFromHeaders } from '@/lib/middleware/tenancy';

interface RouteParams {
  params: {
    id: string;
  };
}

const prisma = new PrismaClient();
const enterpriseService = new EnterpriseService(prisma);

/**
 * GET /api/enterprise/organizations/[id]
 * Get organization details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const tenantContext = getTenantContextFromHeaders(request.headers);
    
    // Verify user has access to this organization
    if (tenantContext && tenantContext.organizationId !== id) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }
    
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        subscriptions: true,
        _count: {
          select: {
            users: true,
            artists: true,
            bookings: true,
            projects: true
          }
        }
      }
    });
    
    if (!organization) {
      return NextResponse.json({
        success: false,
        error: 'Organization not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: organization
    });
    
  } catch (error: any) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch organization'
    }, { status: 500 });
  }
}

/**
 * PUT /api/enterprise/organizations/[id]
 * Update organization
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const tenantContext = getTenantContextFromHeaders(request.headers);
    
    // Verify user has access to this organization
    if (tenantContext && tenantContext.organizationId !== id) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }
    
    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        customDomain: body.customDomain,
        branding: body.branding,
        settings: body.settings,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      data: updatedOrganization,
      message: 'Organization updated successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating organization:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update organization'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/enterprise/organizations/[id]
 * Delete organization (Super Admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // In production, verify super admin permissions
    
    await prisma.organization.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Organization deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete organization'
    }, { status: 500 });
  }
}
