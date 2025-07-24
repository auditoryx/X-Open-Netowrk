/**
 * Phase 2B Week 2: Admin Audit Logs API
 * 
 * Provides audit log data for security monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { AdminMiddleware } from '@/lib/auth/adminSecurityMiddleware';

async function getAuditLogs(limit: number = 20, offset: number = 0) {
  try {
    // In a real implementation, these would be queried from the database
    // For now, return mock data
    const mockLogs = [
      {
        id: 'audit_1',
        userId: 'user_123',
        userEmail: 'admin@example.com',
        action: 'user_updated',
        resource: 'users',
        resourceId: 'user_456',
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        success: true,
        ip: '192.168.1.1',
        details: {
          changes: ['role', 'email'],
          oldRole: 'user',
          newRole: 'creator'
        }
      },
      {
        id: 'audit_2',
        userId: 'user_123',
        userEmail: 'admin@example.com',
        action: 'content_moderated',
        resource: 'content',
        resourceId: 'content_789',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        success: true,
        ip: '192.168.1.1',
        details: {
          moderationAction: 'approve',
          reason: 'Content meets guidelines'
        }
      },
      {
        id: 'audit_3',
        userId: 'user_456',
        userEmail: 'moderator@example.com',
        action: 'permission_denied',
        resource: 'admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        success: false,
        ip: '192.168.1.2',
        details: {
          reason: 'Missing required permissions',
          requiredPermissions: ['users:delete']
        }
      },
      {
        id: 'audit_4',
        userId: 'user_123',
        userEmail: 'admin@example.com',
        action: 'platform_settings',
        resource: 'platform',
        resourceId: 'feature_flags',
        timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
        success: true,
        ip: '192.168.1.1',
        details: {
          setting: 'enable_marketplace',
          oldValue: false,
          newValue: true
        }
      },
      {
        id: 'audit_5',
        userId: 'user_789',
        userEmail: 'support@example.com',
        action: 'user_impersonated',
        resource: 'users',
        resourceId: 'user_101',
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        success: true,
        ip: '192.168.1.3',
        details: {
          reason: 'Customer support request',
          ticketId: 'TICKET-12345'
        }
      }
    ];

    // Simulate pagination
    const paginatedLogs = mockLogs.slice(offset, offset + limit);
    
    return {
      logs: paginatedLogs,
      totalCount: mockLogs.length,
      hasMore: offset + limit < mockLogs.length
    };
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    throw new Error('Failed to load audit logs');
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
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Validate parameters
    if (limit > 100) {
      return new NextResponse(
        JSON.stringify({ error: 'Limit cannot exceed 100' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const auditData = await getAuditLogs(limit, offset);
    
    return new NextResponse(
      JSON.stringify(auditData),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        } 
      }
    );
  } catch (error) {
    console.error('Audit logs API error:', error);
    
    return new NextResponse(
      JSON.stringify({ error: 'Failed to load audit logs' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Apply admin security middleware with system logs permission requirement
export const GET = AdminMiddleware.analytics(handler);