import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EnterpriseService, AnalyticsFilters } from '@/lib/services/enterpriseService';
import { getTenantContextFromHeaders } from '@/lib/middleware/tenancy';

const prisma = new PrismaClient();
const enterpriseService = new EnterpriseService(prisma);

/**
 * GET /api/enterprise/analytics/dashboard
 * Get analytics data for enterprise dashboard
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
    
    // Parse analytics filters
    const filters: AnalyticsFilters = {
      period: (searchParams.get('period') as any) || 'monthly',
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      type: (searchParams.get('type') as any) || undefined,
      artistIds: searchParams.get('artistIds')?.split(',') || undefined,
      projectIds: searchParams.get('projectIds')?.split(',') || undefined,
    };
    
    const analyticsData = await enterpriseService.generateAnalytics(
      tenantContext.organizationId,
      filters
    );
    
    return NextResponse.json({
      success: true,
      data: analyticsData
    });
    
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics data'
    }, { status: 500 });
  }
}

/**
 * POST /api/enterprise/analytics/export
 * Export analytics data
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
    
    const { format = 'csv', filters } = body;
    
    // Generate analytics data
    const analyticsData = await enterpriseService.generateAnalytics(
      tenantContext.organizationId,
      filters
    );
    
    // In a real implementation, you would convert the data to the requested format
    // For now, return the data with export metadata
    
    return NextResponse.json({
      success: true,
      data: {
        exportFormat: format,
        generatedAt: new Date().toISOString(),
        organizationId: tenantContext.organizationId,
        filters,
        analytics: analyticsData,
      },
      message: 'Analytics data exported successfully'
    });
    
  } catch (error: any) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to export analytics data'
    }, { status: 500 });
  }
}
