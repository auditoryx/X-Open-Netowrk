/**
 * Analytics Export API
 * 
 * Exports analytics data in various formats (CSV, JSON)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { platformAnalytics } from '@/lib/analytics/platform-metrics';
import { z } from 'zod';

const ExportQuerySchema = z.object({
  type: z.enum(['users', 'bookings', 'revenue']),
  format: z.enum(['csv', 'json']).default('csv'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const { type, format, startDate, endDate } = ExportQuerySchema.parse({
      type: searchParams.get('type'),
      format: searchParams.get('format') || 'csv',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    });

    // Parse date range
    let timeRange;
    if (startDate && endDate) {
      timeRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `auditoryx-${type}-analytics-${currentDate}.${format}`;

    if (format === 'csv') {
      const csvData = await platformAnalytics.exportAnalyticsData(type, timeRange);
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      });
    } else if (format === 'json') {
      let data;
      
      switch (type) {
        case 'users':
          data = await platformAnalytics.getUserMetrics(timeRange);
          break;
        case 'bookings':
          data = await platformAnalytics.getBookingMetrics(timeRange);
          break;
        case 'revenue':
          data = await platformAnalytics.getRevenueMetrics(timeRange);
          break;
        default:
          return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
      }

      const exportData = {
        type,
        timeRange,
        exportedAt: new Date().toISOString(),
        data,
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });

  } catch (error) {
    console.error('Analytics export error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}