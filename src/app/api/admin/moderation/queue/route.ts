/**
 * Phase 2B Week 2: Content Moderation Queue API
 * 
 * Provides content items pending moderation
 */

import { NextRequest, NextResponse } from 'next/server';
import { AdminMiddleware } from '@/lib/auth/adminSecurityMiddleware';

async function getModerationQueue(limit: number = 20, status?: string) {
  try {
    // Mock content queue data
    const mockItems = [
      {
        id: 'content_1',
        type: 'beat',
        userId: 'user_123',
        userEmail: 'producer@example.com',
        title: 'Dark Trap Beat #1',
        status: 'pending',
        submittedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        moderationResult: {
          approved: false,
          confidence: 0.65,
          flags: [
            {
              type: 'quality',
              severity: 'medium',
              description: 'Low audio quality - bitrate 96000bps',
              confidence: 0.6
            }
          ],
          requiresHumanReview: true
        }
      },
      {
        id: 'content_2',
        type: 'image',
        userId: 'user_456',
        userEmail: 'artist@example.com',
        title: 'Studio Portfolio Image',
        status: 'pending',
        submittedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        moderationResult: {
          approved: true,
          confidence: 0.92,
          flags: [],
          requiresHumanReview: false
        }
      },
      {
        id: 'content_3',
        type: 'beat',
        userId: 'user_789',
        userEmail: 'beatmaker@example.com',
        title: 'Copyright Sample Beat',
        status: 'flagged',
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        moderationResult: {
          approved: false,
          confidence: 0.25,
          flags: [
            {
              type: 'copyright',
              severity: 'critical',
              description: 'High similarity (85.3%) to copyrighted work: Example Track',
              confidence: 0.853
            }
          ],
          reason: 'Critical content violations detected: High similarity to copyrighted work'
        }
      },
      {
        id: 'content_4',
        type: 'profile',
        userId: 'user_101',
        userEmail: 'newuser@example.com',
        title: 'Profile Description Update',
        status: 'pending',
        submittedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        moderationResult: {
          approved: false,
          confidence: 0.45,
          flags: [
            {
              type: 'spam',
              severity: 'medium',
              description: 'Content shows spam characteristics',
              confidence: 0.65
            }
          ],
          requiresHumanReview: true
        }
      },
      {
        id: 'content_5',
        type: 'video',
        userId: 'user_202',
        userEmail: 'videographer@example.com',
        title: 'Music Video Preview',
        status: 'approved',
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        reviewedBy: 'moderator@example.com',
        moderationResult: {
          approved: true,
          confidence: 0.89,
          flags: [],
          requiresHumanReview: false
        }
      }
    ];

    // Filter by status if provided
    let filteredItems = mockItems;
    if (status && status !== 'all') {
      filteredItems = mockItems.filter(item => item.status === status);
    }

    // Apply limit
    const paginatedItems = filteredItems.slice(0, limit);

    return {
      items: paginatedItems,
      totalCount: filteredItems.length,
      hasMore: filteredItems.length > limit,
      statusCounts: {
        pending: mockItems.filter(item => item.status === 'pending').length,
        approved: mockItems.filter(item => item.status === 'approved').length,
        rejected: mockItems.filter(item => item.status === 'rejected').length,
        flagged: mockItems.filter(item => item.status === 'flagged').length
      }
    };
  } catch (error) {
    console.error('Failed to get moderation queue:', error);
    throw new Error('Failed to load moderation queue');
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
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status') || undefined;

    // Validate parameters
    if (limit > 100) {
      return new NextResponse(
        JSON.stringify({ error: 'Limit cannot exceed 100' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const queueData = await getModerationQueue(limit, status);
    
    return new NextResponse(
      JSON.stringify(queueData),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        } 
      }
    );
  } catch (error) {
    console.error('Moderation queue API error:', error);
    
    return new NextResponse(
      JSON.stringify({ error: 'Failed to load moderation queue' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Apply admin security middleware with content moderation permission requirement
export const GET = AdminMiddleware.contentModeration(handler);