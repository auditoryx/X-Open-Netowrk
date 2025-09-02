/**
 * Platform Analytics API
 * 
 * Provides comprehensive platform metrics and analytics data
 * 
 * ⚠️ FEATURE FLAGGED: This endpoint is disabled in production
 * until data privacy compliance and security review is complete.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { platformAnalytics } from '@/lib/analytics/platform-metrics';
import { z } from 'zod';
import { requireFeatureFlag } from '@/lib/featureFlags';

const AnalyticsQuerySchema = z.object({
  type: z.enum(['platform', 'users', 'bookings', 'revenue']).default('platform'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  interval: z.enum(['day', 'week', 'month']).default('month'),
});

export const GET = requireFeatureFlag('ENABLE_ANALYTICS_DASHBOARD')(async (request: NextRequest) => {
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
    const { type, startDate, endDate, interval } = AnalyticsQuerySchema.parse({
      type: searchParams.get('type') || 'platform',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      interval: searchParams.get('interval') || 'month',
    });

    // Parse date range
    let timeRange;
    if (startDate && endDate) {
      timeRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    let data;

    switch (type) {
      case 'platform':
        data = await platformAnalytics.getPlatformMetrics(timeRange);
        break;
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
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      data,
      timeRange,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
});