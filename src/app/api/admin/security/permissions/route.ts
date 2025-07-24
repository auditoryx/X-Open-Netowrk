/**
 * Phase 2B Week 2: Admin Permissions API
 * 
 * Provides permission management and validation endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { AdminMiddleware } from '@/lib/auth/adminSecurityMiddleware';
import { ADMIN_ROLES, ADMIN_PERMISSIONS } from '@/lib/auth/adminPermissions';

async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return new NextResponse(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = {
      roles: ADMIN_ROLES,
      permissions: ADMIN_PERMISSIONS,
      hierarchy: Object.values(ADMIN_ROLES).sort((a, b) => b.level - a.level)
    };
    
    return new NextResponse(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour since this data is relatively static
        } 
      }
    );
  } catch (error) {
    console.error('Permissions API error:', error);
    
    return new NextResponse(
      JSON.stringify({ error: 'Failed to load permissions data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Apply admin security middleware with role management permission requirement
export const GET = AdminMiddleware.roleManagement(handler);