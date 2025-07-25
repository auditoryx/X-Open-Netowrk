import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/unified-models/auth';
import { getSearchService } from '@/lib/search';

/**
 * Search Index Management API
 * 
 * Admin-only endpoints for managing search indexes
 */

// GET /api/search/index - Check index status and health
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const searchService = getSearchService();
    const health = await searchService.healthCheck();
    
    return NextResponse.json({
      status: 'success',
      health,
      instructions: {
        setup: 'POST /api/search/index/setup',
        bulkIndexUsers: 'POST /api/search/index/users',
        bulkIndexServices: 'POST /api/search/index/services',
        clear: 'DELETE /api/search/index',
      },
    });
    
  } catch (error) {
    console.error('Index status check error:', error);
    
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to check index status' },
      { status: 500 }
    );
  }
}

// POST /api/search/index - Setup search indexes
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const body = await request.json();
    const { action = 'setup' } = body;
    
    const searchService = getSearchService();
    
    switch (action) {
      case 'setup':
        await searchService.setupIndexes();
        return NextResponse.json({
          message: 'Search indexes configured successfully',
          action: 'setup',
          timestamp: new Date().toISOString(),
        });
        
      case 'bulk-index-users':
        const userResult = await searchService.bulkIndexUsers(body.limit || 1000);
        return NextResponse.json({
          message: 'Bulk user indexing completed',
          action: 'bulk-index-users',
          result: userResult,
          timestamp: new Date().toISOString(),
        });
        
      case 'bulk-index-services':
        const serviceResult = await searchService.bulkIndexServices(body.limit || 1000);
        return NextResponse.json({
          message: 'Bulk service indexing completed',
          action: 'bulk-index-services',
          result: serviceResult,
          timestamp: new Date().toISOString(),
        });
        
      case 'bulk-index-all':
        const [usersResult, servicesResult] = await Promise.all([
          searchService.bulkIndexUsers(body.limit || 1000),
          searchService.bulkIndexServices(body.limit || 1000),
        ]);
        
        return NextResponse.json({
          message: 'Bulk indexing of all data completed',
          action: 'bulk-index-all',
          results: {
            users: usersResult,
            services: servicesResult,
          },
          timestamp: new Date().toISOString(),
        });
        
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Index setup error:', error);
    
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to setup indexes', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

// DELETE /api/search/index - Clear all indexes (use with extreme caution)
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm');
    
    if (confirm !== 'yes-clear-all-indexes') {
      return NextResponse.json(
        { 
          error: 'Index clearing requires explicit confirmation',
          message: 'Add ?confirm=yes-clear-all-indexes to the URL to proceed',
          warning: 'This action cannot be undone and will remove all search data',
        },
        { status: 400 }
      );
    }
    
    const searchService = getSearchService();
    await searchService.clearIndexes();
    
    return NextResponse.json({
      message: 'All search indexes cleared successfully',
      warning: 'You will need to re-index all data',
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Index clearing error:', error);
    
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to clear indexes' },
      { status: 500 }
    );
  }
}