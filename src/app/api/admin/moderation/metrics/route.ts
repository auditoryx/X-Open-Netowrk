/**
 * Phase 2B Week 2: Content Moderation Metrics API
 * 
 * Provides moderation metrics and statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { AdminMiddleware } from '@/lib/auth/adminSecurityMiddleware';

async function getModerationMetrics() {
  try {
    // In a real implementation, these would be queried from the database
    // For now, return mock data that simulates realistic moderation activity
    return {
      pendingReviews: Math.floor(Math.random() * 50) + 10,
      approvedToday: Math.floor(Math.random() * 100) + 20,
      rejectedToday: Math.floor(Math.random() * 30) + 5,
      flaggedContent: Math.floor(Math.random() * 20) + 3,
      activeReports: Math.floor(Math.random() * 15) + 2,
      suspiciousGameActivity: Math.floor(Math.random() * 25) + 5,
      leaderboardFlags: Math.floor(Math.random() * 10) + 1,
      moderationQueue: Math.floor(Math.random() * 75) + 15,
      
      // Additional metrics
      autoApprovalRate: (Math.random() * 0.3 + 0.7).toFixed(2), // 70-100%
      humanReviewRate: (Math.random() * 0.3 + 0.1).toFixed(2), // 10-40%
      falsePositiveRate: (Math.random() * 0.1).toFixed(3), // 0-10%
      
      // Performance metrics
      averageReviewTime: Math.floor(Math.random() * 300 + 60), // 1-6 minutes
      queueProcessingRate: Math.floor(Math.random() * 50 + 100), // 100-150 items/hour
      
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get moderation metrics:', error);
    throw new Error('Failed to load moderation metrics');
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
    const metrics = await getModerationMetrics();
    
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
    console.error('Moderation metrics API error:', error);
    
    return new NextResponse(
      JSON.stringify({ error: 'Failed to load moderation metrics' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Apply admin security middleware with content moderation permission requirement
export const GET = AdminMiddleware.contentModeration(handler);