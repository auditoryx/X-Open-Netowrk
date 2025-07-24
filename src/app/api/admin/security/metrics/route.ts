/**
 * Phase 2B Week 2: Admin Security Metrics API
 * 
 * Provides security metrics and monitoring data for the admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { AdminMiddleware } from '@/lib/auth/adminSecurityMiddleware';

async function getSecurityMetrics() {
  try {
    // In a real implementation, these would be queried from the database
    // For now, return mock data
    return {
      totalAdminUsers: 5,
      activeAdminSessions: 3,
      failedLoginAttempts: 12,
      criticalActionsToday: 8,
      permissionViolations: 2,
      auditLogEntries: 1247,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get security metrics:', error);
    throw new Error('Failed to load security metrics');
  }
}

async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return new NextResponse(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const metrics = await getSecurityMetrics();
    
    return new NextResponse(
      JSON.stringify(metrics),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        } 
      }
    );
  } catch (error) {
    console.error('Security metrics API error:', error);
    
    return new NextResponse(
      JSON.stringify({ error: 'Failed to load security metrics' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Apply admin security middleware with analytics permission requirement
export const GET = AdminMiddleware.analytics(handler);