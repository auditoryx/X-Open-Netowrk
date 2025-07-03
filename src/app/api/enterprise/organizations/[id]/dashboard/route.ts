import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EnterpriseService } from '@/lib/services/enterpriseService';
import { getTenantContextFromHeaders } from '@/lib/middleware/tenancy';

interface RouteParams {
  params: {
    id: string;
  };
}

const prisma = new PrismaClient();
const enterpriseService = new EnterpriseService(prisma);

/**
 * GET /api/enterprise/organizations/[id]/dashboard
 * Get organization dashboard data
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
    
    const dashboardData = await enterpriseService.getOrganizationDashboard(id);
    
    return NextResponse.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data'
    }, { status: 500 });
  }
}
