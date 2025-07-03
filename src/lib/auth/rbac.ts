import { UserRole } from '@prisma/client';

/**
 * Permission definitions for different resources and actions
 */
export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

/**
 * Resource types in the system
 */
export enum Resource {
  ORGANIZATION = 'organization',
  USER = 'user',
  ARTIST = 'artist',
  BOOKING = 'booking',
  PROJECT = 'project',
  CONTRACT = 'contract',
  INVOICE = 'invoice',
  ANALYTICS = 'analytics',
  SUBSCRIPTION = 'subscription',
  SETTINGS = 'settings',
}

/**
 * Action types for resources
 */
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // Full access
  APPROVE = 'approve',
  ASSIGN = 'assign',
  EXPORT = 'export',
  BULK_OPERATION = 'bulk_operation',
}

/**
 * Role-based permissions configuration
 */
const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'SUPER_ADMIN',
    permissions: [
      { resource: '*', action: '*' }, // Full access to everything
    ],
  },
  {
    role: 'ORG_ADMIN',
    permissions: [
      { resource: Resource.ORGANIZATION, action: Action.READ },
      { resource: Resource.ORGANIZATION, action: Action.UPDATE },
      { resource: Resource.USER, action: Action.MANAGE },
      { resource: Resource.ARTIST, action: Action.MANAGE },
      { resource: Resource.BOOKING, action: Action.MANAGE },
      { resource: Resource.PROJECT, action: Action.MANAGE },
      { resource: Resource.CONTRACT, action: Action.MANAGE },
      { resource: Resource.INVOICE, action: Action.MANAGE },
      { resource: Resource.ANALYTICS, action: Action.READ },
      { resource: Resource.ANALYTICS, action: Action.EXPORT },
      { resource: Resource.SUBSCRIPTION, action: Action.READ },
      { resource: Resource.SUBSCRIPTION, action: Action.UPDATE },
      { resource: Resource.SETTINGS, action: Action.MANAGE },
    ],
  },
  {
    role: 'LABEL_MANAGER',
    permissions: [
      { resource: Resource.ORGANIZATION, action: Action.READ },
      { resource: Resource.USER, action: Action.READ },
      { resource: Resource.USER, action: Action.CREATE, conditions: { role: ['CREATOR', 'CLIENT'] } },
      { resource: Resource.ARTIST, action: Action.MANAGE },
      { resource: Resource.BOOKING, action: Action.MANAGE },
      { resource: Resource.PROJECT, action: Action.MANAGE },
      { resource: Resource.CONTRACT, action: Action.READ },
      { resource: Resource.CONTRACT, action: Action.CREATE },
      { resource: Resource.INVOICE, action: Action.READ },
      { resource: Resource.ANALYTICS, action: Action.READ },
      { resource: Resource.ANALYTICS, action: Action.EXPORT },
    ],
  },
  {
    role: 'ARTIST_MANAGER',
    permissions: [
      { resource: Resource.ORGANIZATION, action: Action.READ },
      { resource: Resource.USER, action: Action.READ },
      { resource: Resource.ARTIST, action: Action.READ },
      { resource: Resource.ARTIST, action: Action.UPDATE, conditions: { assigned: true } },
      { resource: Resource.BOOKING, action: Action.READ },
      { resource: Resource.BOOKING, action: Action.CREATE },
      { resource: Resource.BOOKING, action: Action.UPDATE, conditions: { assigned: true } },
      { resource: Resource.PROJECT, action: Action.READ },
      { resource: Resource.PROJECT, action: Action.UPDATE, conditions: { member: true } },
      { resource: Resource.CONTRACT, action: Action.READ, conditions: { assigned: true } },
      { resource: Resource.INVOICE, action: Action.READ, conditions: { assigned: true } },
      { resource: Resource.ANALYTICS, action: Action.READ, conditions: { scope: 'assigned' } },
    ],
  },
  {
    role: 'STUDIO_MANAGER',
    permissions: [
      { resource: Resource.ORGANIZATION, action: Action.READ },
      { resource: Resource.BOOKING, action: Action.MANAGE },
      { resource: Resource.PROJECT, action: Action.READ },
      { resource: Resource.PROJECT, action: Action.UPDATE, conditions: { member: true } },
      { resource: Resource.ARTIST, action: Action.READ },
      { resource: Resource.CONTRACT, action: Action.READ },
      { resource: Resource.INVOICE, action: Action.READ },
      { resource: Resource.ANALYTICS, action: Action.READ, conditions: { scope: 'studio' } },
    ],
  },
  {
    role: 'ACCOUNTANT',
    permissions: [
      { resource: Resource.ORGANIZATION, action: Action.READ },
      { resource: Resource.BOOKING, action: Action.READ },
      { resource: Resource.PROJECT, action: Action.READ },
      { resource: Resource.CONTRACT, action: Action.READ },
      { resource: Resource.INVOICE, action: Action.MANAGE },
      { resource: Resource.ANALYTICS, action: Action.READ, conditions: { scope: 'financial' } },
      { resource: Resource.ANALYTICS, action: Action.EXPORT, conditions: { scope: 'financial' } },
    ],
  },
  {
    role: 'CREATOR',
    permissions: [
      { resource: Resource.ORGANIZATION, action: Action.READ },
      { resource: Resource.USER, action: Action.READ, conditions: { self: true } },
      { resource: Resource.USER, action: Action.UPDATE, conditions: { self: true } },
      { resource: Resource.ARTIST, action: Action.READ, conditions: { self: true } },
      { resource: Resource.ARTIST, action: Action.UPDATE, conditions: { self: true } },
      { resource: Resource.BOOKING, action: Action.READ, conditions: { assigned: true } },
      { resource: Resource.BOOKING, action: Action.UPDATE, conditions: { assigned: true, status: ['DRAFT', 'PENDING_APPROVAL'] } },
      { resource: Resource.PROJECT, action: Action.READ, conditions: { member: true } },
      { resource: Resource.CONTRACT, action: Action.READ, conditions: { assigned: true } },
      { resource: Resource.INVOICE, action: Action.READ, conditions: { assigned: true } },
      { resource: Resource.ANALYTICS, action: Action.READ, conditions: { scope: 'self' } },
    ],
  },
  {
    role: 'CLIENT',
    permissions: [
      { resource: Resource.ORGANIZATION, action: Action.READ },
      { resource: Resource.USER, action: Action.READ, conditions: { self: true } },
      { resource: Resource.USER, action: Action.UPDATE, conditions: { self: true } },
      { resource: Resource.ARTIST, action: Action.READ },
      { resource: Resource.BOOKING, action: Action.CREATE },
      { resource: Resource.BOOKING, action: Action.READ, conditions: { created: true } },
      { resource: Resource.BOOKING, action: Action.UPDATE, conditions: { created: true, status: ['DRAFT'] } },
      { resource: Resource.PROJECT, action: Action.READ, conditions: { owner: true } },
      { resource: Resource.CONTRACT, action: Action.READ, conditions: { client: true } },
      { resource: Resource.INVOICE, action: Action.READ, conditions: { client: true } },
    ],
  },
  {
    role: 'VIEWER',
    permissions: [
      { resource: Resource.ORGANIZATION, action: Action.READ },
      { resource: Resource.USER, action: Action.READ, conditions: { self: true } },
      { resource: Resource.ARTIST, action: Action.READ },
      { resource: Resource.BOOKING, action: Action.READ, conditions: { assigned: true } },
      { resource: Resource.PROJECT, action: Action.READ, conditions: { member: true } },
      { resource: Resource.ANALYTICS, action: Action.READ, conditions: { scope: 'basic' } },
    ],
  },
];

/**
 * Context for permission checking
 */
export interface PermissionContext {
  userId: string;
  organizationId: string;
  resourceId?: string;
  resourceData?: any;
  userRole: UserRole;
  userPermissions?: any;
}

/**
 * Role-Based Access Control Service
 */
export class RBACService {
  private static instance: RBACService;
  private permissionCache = new Map<string, boolean>();

  static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  /**
   * Check if user has permission for a specific action on a resource
   */
  async checkPermission(
    context: PermissionContext,
    resource: Resource | string,
    action: Action | string
  ): Promise<boolean> {
    const cacheKey = `${context.userId}:${resource}:${action}:${context.resourceId || 'all'}`;
    
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    const hasPermission = await this.evaluatePermission(context, resource, action);
    
    // Cache the result for 5 minutes
    this.permissionCache.set(cacheKey, hasPermission);
    setTimeout(() => this.permissionCache.delete(cacheKey), 5 * 60 * 1000);

    return hasPermission;
  }

  /**
   * Get all permissions for a user role
   */
  getUserPermissions(role: UserRole): Permission[] {
    const roleConfig = ROLE_PERMISSIONS.find(rp => rp.role === role);
    return roleConfig?.permissions || [];
  }

  /**
   * Check if user can perform bulk operations
   */
  async canPerformBulkOperation(
    context: PermissionContext,
    resource: Resource | string
  ): Promise<boolean> {
    return await this.checkPermission(context, resource, Action.BULK_OPERATION);
  }

  /**
   * Get filtered list of allowed actions for a resource
   */
  async getAllowedActions(
    context: PermissionContext,
    resource: Resource | string
  ): Promise<string[]> {
    const allActions = Object.values(Action);
    const allowedActions: string[] = [];

    for (const action of allActions) {
      if (await this.checkPermission(context, resource, action)) {
        allowedActions.push(action);
      }
    }

    return allowedActions;
  }

  /**
   * Check multiple permissions at once
   */
  async checkMultiplePermissions(
    context: PermissionContext,
    checks: Array<{ resource: Resource | string; action: Action | string }>
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    await Promise.all(
      checks.map(async (check) => {
        const key = `${check.resource}:${check.action}`;
        results[key] = await this.checkPermission(context, check.resource, check.action);
      })
    );

    return results;
  }

  /**
   * Assign role to user (requires appropriate permissions)
   */
  async assignRole(
    assignerContext: PermissionContext,
    targetUserId: string,
    newRole: UserRole
  ): Promise<boolean> {
    // Check if assigner can manage users
    const canManageUsers = await this.checkPermission(
      assignerContext,
      Resource.USER,
      Action.MANAGE
    );

    if (!canManageUsers) {
      return false;
    }

    // Additional checks for role assignment
    if (newRole === 'SUPER_ADMIN' && assignerContext.userRole !== 'SUPER_ADMIN') {
      return false; // Only super admins can create other super admins
    }

    return true;
  }

  /**
   * Clear permission cache for a user
   */
  clearUserPermissionCache(userId: string): void {
    for (const key of this.permissionCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.permissionCache.delete(key);
      }
    }
  }

  /**
   * Clear all permission cache
   */
  clearAllPermissionCache(): void {
    this.permissionCache.clear();
  }

  // Private methods
  private async evaluatePermission(
    context: PermissionContext,
    resource: Resource | string,
    action: Action | string
  ): Promise<boolean> {
    const userPermissions = this.getUserPermissions(context.userRole);

    // Check for wildcard permissions (SUPER_ADMIN)
    const hasWildcard = userPermissions.some(
      p => (p.resource === '*' && p.action === '*')
    );
    if (hasWildcard) return true;

    // Check for specific permission
    const matchingPermission = userPermissions.find(
      p => (p.resource === resource || p.resource === '*') &&
           (p.action === action || p.action === '*' || p.action === Action.MANAGE)
    );

    if (!matchingPermission) return false;

    // Evaluate conditions if present
    if (matchingPermission.conditions) {
      return await this.evaluateConditions(context, matchingPermission.conditions);
    }

    return true;
  }

  private async evaluateConditions(
    context: PermissionContext,
    conditions: Record<string, any>
  ): Promise<boolean> {
    // Self condition - user can only access their own resources
    if (conditions.self && context.resourceId !== context.userId) {
      return false;
    }

    // Assigned condition - user can only access resources assigned to them
    if (conditions.assigned && context.resourceData) {
      const isAssigned = context.resourceData.assignedTo === context.userId ||
                        context.resourceData.artistId === context.userId ||
                        context.resourceData.createdBy === context.userId;
      if (!isAssigned) return false;
    }

    // Created condition - user can only access resources they created
    if (conditions.created && context.resourceData) {
      if (context.resourceData.createdBy !== context.userId) return false;
    }

    // Owner condition - user can only access projects they own
    if (conditions.owner && context.resourceData) {
      if (context.resourceData.ownerId !== context.userId) return false;
    }

    // Member condition - user must be a member of the project
    if (conditions.member && context.resourceData) {
      const isMember = context.resourceData.members?.some(
        (member: any) => member.userId === context.userId
      );
      if (!isMember) return false;
    }

    // Role condition - check if user has required role for this action
    if (conditions.role && Array.isArray(conditions.role)) {
      if (!conditions.role.includes(context.userRole)) return false;
    }

    // Status condition - action only allowed for certain statuses
    if (conditions.status && Array.isArray(conditions.status)) {
      if (context.resourceData && !conditions.status.includes(context.resourceData.status)) {
        return false;
      }
    }

    // Scope condition - limit access based on scope
    if (conditions.scope) {
      // This would involve more complex logic based on the specific scope
      // For now, return true for basic implementation
      return true;
    }

    return true;
  }
}

/**
 * Decorator for protecting API routes with RBAC
 */
export function RequirePermission(resource: Resource, action: Action) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [req] = args;
      const context = getContextFromRequest(req);
      
      if (!context) {
        throw new Error('Unauthorized: No context found');
      }

      const rbac = RBACService.getInstance();
      const hasPermission = await rbac.checkPermission(context, resource, action);

      if (!hasPermission) {
        throw new Error(`Forbidden: Insufficient permissions for ${action} on ${resource}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Helper function to extract context from request
 */
function getContextFromRequest(req: any): PermissionContext | null {
  // This would extract context from headers, JWT token, etc.
  // Implementation depends on your authentication system
  return null;
}

export default RBACService.getInstance();
