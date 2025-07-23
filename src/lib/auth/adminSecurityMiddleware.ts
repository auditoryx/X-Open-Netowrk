/**
 * Phase 2B Week 2: Enhanced Admin Security Middleware
 * 
 * This middleware provides enterprise-grade admin security:
 * - Multi-level permission checking
 * - Automatic audit logging
 * - Session security validation
 * - Rate limiting for admin actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { 
  hasAdminPermission, 
  validateAdminAction, 
  ADMIN_ROLES, 
  AdminPermission 
} from './adminPermissions';
import { auditAdminAction } from './auditLogging';

export interface AdminSecurityOptions {
  requiredPermissions?: string[];
  requireAnyPermission?: boolean; // If true, user needs ANY of the permissions, not ALL
  allowLegacyAdmins?: boolean; // Allow legacy admin users without specific admin roles
  auditAction?: string;
  auditResource?: string;
  rateLimitKey?: string;
  rateLimitMax?: number; // Max requests per window
  rateLimitWindow?: number; // Window in seconds
}

export interface AdminActionContext {
  userId: string;
  userRole: string;
  adminRole?: string;
  permissions: AdminPermission[];
  ip?: string;
  userAgent?: string;
}

/**
 * Enhanced admin middleware with comprehensive security checks
 */
export function withEnhancedAdminSecurity(
  handler: (req: NextRequest, context: AdminActionContext) => Promise<NextResponse>,
  options: AdminSecurityOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // 1. Session validation
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        await auditAdminAction(
          {
            action: options.auditAction || 'access_denied',
            resource: options.auditResource || 'admin',
            details: { reason: 'No valid session' }
          },
          req,
          false,
          'No valid session'
        );
        
        return new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 2. Basic admin role check
      const userRole = session.user.role || 'user';
      const adminRole = session.user.adminRole;

      if (!isAdminUser(userRole, adminRole, options.allowLegacyAdmins)) {
        await auditAdminAction(
          {
            action: options.auditAction || 'access_denied',
            resource: options.auditResource || 'admin',
            details: { 
              reason: 'Insufficient admin privileges',
              userRole,
              adminRole 
            }
          },
          req,
          false,
          'Insufficient admin privileges'
        );

        return new NextResponse(
          JSON.stringify({ error: 'Admin privileges required' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 3. Permission validation
      if (options.requiredPermissions && options.requiredPermissions.length > 0) {
        const hasPermission = options.requireAnyPermission
          ? options.requiredPermissions.some(permission => 
              hasAdminPermission(userRole, adminRole, permission)
            )
          : options.requiredPermissions.every(permission => 
              hasAdminPermission(userRole, adminRole, permission)
            );

        if (!hasPermission) {
          await auditAdminAction(
            {
              action: options.auditAction || 'permission_denied',
              resource: options.auditResource || 'admin',
              details: { 
                reason: 'Missing required permissions',
                requiredPermissions: options.requiredPermissions,
                userRole,
                adminRole 
              }
            },
            req,
            false,
            'Missing required permissions'
          );

          return new NextResponse(
            JSON.stringify({ 
              error: 'Insufficient permissions',
              requiredPermissions: options.requiredPermissions
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // 4. Rate limiting check
      if (options.rateLimitKey) {
        const rateLimitResult = await checkRateLimit(
          session.user.id,
          options.rateLimitKey,
          options.rateLimitMax || 100,
          options.rateLimitWindow || 3600
        );

        if (!rateLimitResult.allowed) {
          await auditAdminAction(
            {
              action: options.auditAction || 'rate_limited',
              resource: options.auditResource || 'admin',
              details: { 
                reason: 'Rate limit exceeded',
                limit: options.rateLimitMax,
                window: options.rateLimitWindow,
                remaining: rateLimitResult.remaining
              }
            },
            req,
            false,
            'Rate limit exceeded'
          );

          return new NextResponse(
            JSON.stringify({ 
              error: 'Rate limit exceeded',
              retryAfter: rateLimitResult.retryAfter
            }),
            { 
              status: 429, 
              headers: { 
                'Content-Type': 'application/json',
                'Retry-After': rateLimitResult.retryAfter.toString()
              } 
            }
          );
        }
      }

      // 5. Create action context
      const context: AdminActionContext = {
        userId: session.user.id,
        userRole,
        adminRole,
        permissions: getAdminPermissions(userRole, adminRole),
        ip: getClientIP(req),
        userAgent: req.headers.get('user-agent') || undefined
      };

      // 6. Execute handler with automatic audit logging
      try {
        const result = await handler(req, context);

        // Log successful action
        if (options.auditAction && options.auditResource) {
          await auditAdminAction(
            {
              action: options.auditAction,
              resource: options.auditResource,
              details: {
                method: req.method,
                url: req.url,
                statusCode: result.status
              }
            },
            req,
            true
          );
        }

        return result;

      } catch (error) {
        // Log failed action
        if (options.auditAction && options.auditResource) {
          await auditAdminAction(
            {
              action: options.auditAction,
              resource: options.auditResource,
              details: {
                method: req.method,
                url: req.url
              }
            },
            req,
            false,
            error instanceof Error ? error.message : 'Unknown error'
          );
        }

        throw error;
      }

    } catch (error) {
      console.error('Admin security middleware error:', error);
      
      return new NextResponse(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

/**
 * Simplified admin check for basic protection
 */
export function requireAdmin(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withEnhancedAdminSecurity(
    async (req, context) => handler(req),
    {
      allowLegacyAdmins: true,
      auditAction: 'admin_access',
      auditResource: 'admin'
    }
  );
}

/**
 * Permission-specific middleware generators
 */
export const AdminMiddleware = {
  /**
   * User management operations
   */
  userManagement: (handler: (req: NextRequest, context: AdminActionContext) => Promise<NextResponse>) =>
    withEnhancedAdminSecurity(handler, {
      requiredPermissions: ['users:read', 'users:write'],
      auditAction: 'user_management',
      auditResource: 'users',
      rateLimitKey: 'user_management',
      rateLimitMax: 50
    }),

  /**
   * Platform settings management
   */
  platformSettings: (handler: (req: NextRequest, context: AdminActionContext) => Promise<NextResponse>) =>
    withEnhancedAdminSecurity(handler, {
      requiredPermissions: ['platform:settings'],
      auditAction: 'platform_settings',
      auditResource: 'platform',
      rateLimitKey: 'platform_settings',
      rateLimitMax: 20
    }),

  /**
   * Content moderation
   */
  contentModeration: (handler: (req: NextRequest, context: AdminActionContext) => Promise<NextResponse>) =>
    withEnhancedAdminSecurity(handler, {
      requiredPermissions: ['content:moderate'],
      auditAction: 'content_moderation',
      auditResource: 'content',
      rateLimitKey: 'content_moderation',
      rateLimitMax: 100
    }),

  /**
   * Analytics access
   */
  analytics: (handler: (req: NextRequest, context: AdminActionContext) => Promise<NextResponse>) =>
    withEnhancedAdminSecurity(handler, {
      requiredPermissions: ['analytics:view'],
      auditAction: 'analytics_access',
      auditResource: 'analytics',
      rateLimitKey: 'analytics',
      rateLimitMax: 30
    }),

  /**
   * Financial operations
   */
  financial: (handler: (req: NextRequest, context: AdminActionContext) => Promise<NextResponse>) =>
    withEnhancedAdminSecurity(handler, {
      requiredPermissions: ['finance:view'],
      auditAction: 'financial_access',
      auditResource: 'finance',
      rateLimitKey: 'financial',
      rateLimitMax: 10
    }),

  /**
   * Role management
   */
  roleManagement: (handler: (req: NextRequest, context: AdminActionContext) => Promise<NextResponse>) =>
    withEnhancedAdminSecurity(handler, {
      requiredPermissions: ['roles:assign', 'roles:manage'],
      requireAnyPermission: true,
      auditAction: 'role_management',
      auditResource: 'roles',
      rateLimitKey: 'role_management',
      rateLimitMax: 20
    })
};

// Helper functions

function isAdminUser(
  userRole: string, 
  adminRole: string | undefined, 
  allowLegacyAdmins: boolean = true
): boolean {
  // Check for legacy admin users
  if (allowLegacyAdmins && userRole === 'admin') {
    return true;
  }

  // Check for specific admin role
  if (adminRole && ADMIN_ROLES[adminRole]) {
    return true;
  }

  // Check for moderator access if admin role exists
  if (userRole === 'moderator' && adminRole === 'moderator') {
    return true;
  }

  return false;
}

function getAdminPermissions(userRole: string, adminRole: string | undefined): AdminPermission[] {
  if (userRole === 'admin' && !adminRole) {
    // Legacy admin gets all permissions
    return Object.values(ADMIN_ROLES).flatMap(role => role.permissions);
  }

  if (adminRole && ADMIN_ROLES[adminRole]) {
    return ADMIN_ROLES[adminRole].permissions;
  }

  return [];
}

function getClientIP(req: NextRequest): string | undefined {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfIP = req.headers.get('cf-connecting-ip');
  
  return forwarded?.split(',')[0] || realIP || cfIP || undefined;
}

// Rate limiting implementation (simplified in-memory version)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

async function checkRateLimit(
  userId: string,
  key: string,
  max: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const limitKey = `${userId}:${key}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  
  const current = rateLimitStore.get(limitKey);
  
  if (!current || now > current.resetTime) {
    // New window
    rateLimitStore.set(limitKey, {
      count: 1,
      resetTime: now + windowMs
    });
    
    return {
      allowed: true,
      remaining: max - 1,
      retryAfter: windowSeconds
    };
  }
  
  if (current.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetTime - now) / 1000)
    };
  }
  
  current.count++;
  rateLimitStore.set(limitKey, current);
  
  return {
    allowed: true,
    remaining: max - current.count,
    retryAfter: Math.ceil((current.resetTime - now) / 1000)
  };
}

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute