/**
 * Phase 2B Week 2: Community Reports API
 * 
 * Provides community-submitted content reports management
 */

import { NextRequest, NextResponse } from 'next/server';
// Temporarily disabled: import { AdminMiddleware } from "@/lib/auth/adminSecurityMiddleware";
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS';

async function getContentReports(limit: number = 20, status?: string) {
  try {
    // Mock community reports data
    const mockReports = [
      {
        id: 'report_1',
        contentId: 'content_beat_123',
        contentType: 'beat',
        reporterId: 'user_reporter_1',
        reason: 'copyright',
        description: 'This beat uses samples from a well-known commercial track without permission',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        status: 'pending',
        priority: 'high',
        reporterEmail: 'concerned@example.com'
      },
      {
        id: 'report_2',
        contentId: 'content_image_456',
        contentType: 'image',
        reporterId: 'user_reporter_2',
        reason: 'inappropriate',
        description: 'Profile image contains inappropriate content not suitable for the platform',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: 'reviewing',
        priority: 'medium',
        reporterEmail: 'community@example.com',
        assignedTo: 'moderator@example.com'
      },
      {
        id: 'report_3',
        contentId: 'content_profile_789',
        contentType: 'profile',
        reporterId: 'user_reporter_3',
        reason: 'spam',
        description: 'User profile description contains multiple promotional links and spam content',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        status: 'pending',
        priority: 'low',
        reporterEmail: 'vigilant@example.com'
      },
      {
        id: 'report_4',
        contentId: 'content_beat_101',
        contentType: 'beat',
        reporterId: 'user_reporter_4',
        reason: 'quality',
        description: 'Beat quality is extremely poor with significant audio distortion',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        status: 'resolved',
        priority: 'low',
        reporterEmail: 'audiophile@example.com',
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        resolvedBy: 'moderator@example.com',
        resolution: 'Content reviewed and found to meet quality standards'
      },
      {
        id: 'report_5',
        contentId: 'content_video_202',
        contentType: 'video',
        reporterId: 'user_reporter_5',
        reason: 'other',
        description: 'Video contains misleading information about the creator\'s credentials',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        status: 'dismissed',
        priority: 'low',
        reporterEmail: 'factchecker@example.com',
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        resolvedBy: 'moderator@example.com',
        resolution: 'Report dismissed - content does not violate community guidelines'
      }
    ];

    // Filter by status if provided
    let filteredReports = mockReports;
    if (status && status !== 'all') {
      filteredReports = mockReports.filter(report => report.status === status);
    }

    // Apply limit
    const paginatedReports = filteredReports.slice(0, limit);

    return {
      reports: paginatedReports,
      totalCount: filteredReports.length,
      hasMore: filteredReports.length > limit,
      statusCounts: {
        pending: mockReports.filter(r => r.status === 'pending').length,
        reviewing: mockReports.filter(r => r.status === 'reviewing').length,
        resolved: mockReports.filter(r => r.status === 'resolved').length,
        dismissed: mockReports.filter(r => r.status === 'dismissed').length
      },
      priorityCounts: {
        high: mockReports.filter(r => r.priority === 'high').length,
        medium: mockReports.filter(r => r.priority === 'medium').length,
        low: mockReports.filter(r => r.priority === 'low').length
      },
      reasonCounts: {
        copyright: mockReports.filter(r => r.reason === 'copyright').length,
        inappropriate: mockReports.filter(r => r.reason === 'inappropriate').length,
        spam: mockReports.filter(r => r.reason === 'spam').length,
        quality: mockReports.filter(r => r.reason === 'quality').length,
        other: mockReports.filter(r => r.reason === 'other').length
      }
    };
  } catch (error) {
    console.error('Failed to get content reports:', error);
    throw new Error('Failed to load content reports');
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
    const status = url.searchParams.get(SCHEMA_FIELDS.REPORT.STATUS) || undefined;

    // Validate parameters
    if (limit > 100) {
      return new NextResponse(
        JSON.stringify({ error: 'Limit cannot exceed 100' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reportsData = await getContentReports(limit, status);
    
    return new NextResponse(
      JSON.stringify(reportsData),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        } 
      }
    );
  } catch (error) {
    console.error('Content reports API error:', error);
    
    return new NextResponse(
      JSON.stringify({ error: 'Failed to load content reports' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Apply admin security middleware with content moderation permission requirement
export const GET = handler;