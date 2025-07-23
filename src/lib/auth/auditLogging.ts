/**
 * Phase 2B Week 2: Admin Audit Logging System
 * 
 * This module provides comprehensive audit logging for all admin actions:
 * - Action tracking with detailed context
 * - IP and user agent logging for security
 * - Structured logging for analysis
 * - Privacy-compliant data handling
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { AuditLogEntry } from './adminPermissions';

export interface AuditContext {
  userId: string;
  userRole: string;
  adminRole?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AuditAction {
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  sensitive?: boolean; // Flag for sensitive operations
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  context: AuditContext,
  actionData: AuditAction,
  success: boolean = true,
  errorMessage?: string
): Promise<void> {
  try {
    const auditEntry: AuditLogEntry = {
      id: generateAuditId(),
      userId: context.userId,
      userRole: context.userRole,
      action: actionData.action,
      resource: actionData.resource,
      resourceId: actionData.resourceId,
      details: actionData.sensitive ? sanitizeDetails(actionData.details) : actionData.details,
      ip: context.ip,
      userAgent: context.userAgent,
      timestamp: new Date(),
      success,
      errorMessage
    };

    // Store audit log in database
    await storeAuditLog(auditEntry);

    // For critical actions, also log to external monitoring
    if (isCriticalAction(actionData.action)) {
      await logCriticalAction(auditEntry);
    }

  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw to avoid breaking the main operation
  }
}

/**
 * Log admin action with automatic context extraction
 */
export async function auditAdminAction(
  actionData: AuditAction,
  request?: Request,
  success: boolean = true,
  errorMessage?: string
): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.warn('Attempted to audit action without valid session');
      return;
    }

    const context: AuditContext = {
      userId: session.user.id,
      userRole: session.user.role || 'user',
      adminRole: session.user.adminRole,
      ip: extractClientIP(request),
      userAgent: request?.headers.get('user-agent') || undefined,
      sessionId: session.user.id // Simplified session ID
    };

    await createAuditLog(context, actionData, success, errorMessage);

  } catch (error) {
    console.error('Failed to audit admin action:', error);
  }
}

/**
 * Higher-order function to automatically audit admin actions
 */
export function withAuditLog<T extends any[]>(
  action: string,
  resource: string,
  handler: (...args: T) => Promise<Response> | Response
) {
  return async (...args: T): Promise<Response> => {
    const request = args.find(arg => arg instanceof Request) as Request | undefined;
    let actionDetails: Record<string, any> = {};
    let resourceId: string | undefined;

    try {
      // Extract resource ID from URL if available
      if (request) {
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        resourceId = pathParts[pathParts.length - 1];
        
        // Extract request details for audit
        if (request.method !== 'GET') {
          try {
            const body = await request.clone().json();
            actionDetails = { requestBody: body };
          } catch {
            // Non-JSON body or already consumed
          }
        }
      }

      const result = await handler(...args);
      
      // Log successful action
      await auditAdminAction(
        {
          action,
          resource,
          resourceId,
          details: {
            ...actionDetails,
            method: request?.method,
            url: request?.url,
            statusCode: result.status
          }
        },
        request,
        true
      );

      return result;

    } catch (error) {
      // Log failed action
      await auditAdminAction(
        {
          action,
          resource,
          resourceId,
          details: {
            ...actionDetails,
            method: request?.method,
            url: request?.url
          }
        },
        request,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw error;
    }
  };
}

/**
 * Log specific admin actions
 */
export const AdminAuditActions = {
  // User Management
  async userCreated(userId: string, details: Record<string, any>, request?: Request) {
    await auditAdminAction({
      action: 'create',
      resource: 'user',
      resourceId: userId,
      details
    }, request);
  },

  async userUpdated(userId: string, changes: Record<string, any>, request?: Request) {
    await auditAdminAction({
      action: 'update',
      resource: 'user',
      resourceId: userId,
      details: { changes }
    }, request);
  },

  async userDeleted(userId: string, reason: string, request?: Request) {
    await auditAdminAction({
      action: 'delete',
      resource: 'user',
      resourceId: userId,
      details: { reason },
      sensitive: true
    }, request);
  },

  async userImpersonated(targetUserId: string, request?: Request) {
    await auditAdminAction({
      action: 'impersonate',
      resource: 'user',
      resourceId: targetUserId,
      details: {},
      sensitive: true
    }, request);
  },

  // Role Management
  async roleAssigned(userId: string, oldRole: string, newRole: string, request?: Request) {
    await auditAdminAction({
      action: 'assign_role',
      resource: 'user',
      resourceId: userId,
      details: { oldRole, newRole },
      sensitive: true
    }, request);
  },

  // Platform Management
  async platformSettingChanged(setting: string, oldValue: any, newValue: any, request?: Request) {
    await auditAdminAction({
      action: 'update_setting',
      resource: 'platform',
      resourceId: setting,
      details: { oldValue, newValue }
    }, request);
  },

  async featureToggled(feature: string, enabled: boolean, request?: Request) {
    await auditAdminAction({
      action: 'toggle_feature',
      resource: 'platform',
      resourceId: feature,
      details: { enabled }
    }, request);
  },

  // Content Moderation
  async contentModerated(contentId: string, action: string, reason: string, request?: Request) {
    await auditAdminAction({
      action: 'moderate',
      resource: 'content',
      resourceId: contentId,
      details: { moderationAction: action, reason }
    }, request);
  },

  async contentRemoved(contentId: string, reason: string, request?: Request) {
    await auditAdminAction({
      action: 'remove',
      resource: 'content',
      resourceId: contentId,
      details: { reason }
    }, request);
  },

  // System Actions
  async systemMaintenanceToggled(enabled: boolean, message: string, request?: Request) {
    await auditAdminAction({
      action: 'maintenance_mode',
      resource: 'system',
      details: { enabled, message },
      sensitive: true
    }, request);
  },

  async dataExported(dataType: string, filters: Record<string, any>, request?: Request) {
    await auditAdminAction({
      action: 'export',
      resource: 'data',
      resourceId: dataType,
      details: { filters },
      sensitive: true
    }, request);
  }
};

/**
 * Query audit logs with filtering and pagination
 */
export interface AuditLogQuery {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  limit?: number;
  offset?: number;
}

export async function queryAuditLogs(query: AuditLogQuery): Promise<{
  logs: AuditLogEntry[];
  totalCount: number;
}> {
  try {
    // Implementation would query the audit log storage
    // This is a placeholder that returns empty results
    return {
      logs: [],
      totalCount: 0
    };
  } catch (error) {
    console.error('Failed to query audit logs:', error);
    return {
      logs: [],
      totalCount: 0
    };
  }
}

/**
 * Generate audit statistics for admin dashboard
 */
export async function getAuditStatistics(days: number = 30): Promise<{
  totalActions: number;
  successRate: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ userId: string; count: number }>;
  criticalActions: number;
}> {
  try {
    // Implementation would analyze audit log data
    // This is a placeholder
    return {
      totalActions: 0,
      successRate: 1.0,
      topActions: [],
      topUsers: [],
      criticalActions: 0
    };
  } catch (error) {
    console.error('Failed to get audit statistics:', error);
    return {
      totalActions: 0,
      successRate: 0,
      topActions: [],
      topUsers: [],
      criticalActions: 0
    };
  }
}

// Helper functions

function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function sanitizeDetails(details: Record<string, any>): Record<string, any> {
  const sanitized = { ...details };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

function extractClientIP(request?: Request): string | undefined {
  if (!request) return undefined;

  // Try various headers for client IP
  const headers = request.headers;
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-client-ip') ||
    undefined
  );
}

function isCriticalAction(action: string): boolean {
  const criticalActions = [
    'delete',
    'impersonate',
    'assign_role',
    'maintenance_mode',
    'export',
    'update_setting'
  ];
  
  return criticalActions.some(critical => action.includes(critical));
}

async function storeAuditLog(entry: AuditLogEntry): Promise<void> {
  // Implementation would store in database
  // For now, just log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('AUDIT LOG:', {
      user: entry.userId,
      action: `${entry.action}:${entry.resource}`,
      success: entry.success,
      timestamp: entry.timestamp.toISOString()
    });
  }
}

async function logCriticalAction(entry: AuditLogEntry): Promise<void> {
  // Implementation would send to external monitoring/alerting
  console.warn('CRITICAL ADMIN ACTION:', {
    user: entry.userId,
    action: `${entry.action}:${entry.resource}`,
    ip: entry.ip,
    timestamp: entry.timestamp.toISOString()
  });
}