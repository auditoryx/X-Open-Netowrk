/**
 * Phase 2B Week 2: Enhanced Admin Permission System
 * 
 * This module implements enterprise-grade admin permissions with:
 * - Granular role-based access control
 * - Multi-level admin hierarchy
 * - Feature-specific permission management
 * - Comprehensive audit logging
 */

import { UserRole } from '@/lib/types/user';

export interface AdminRole {
  id: string;
  name: string;
  level: number;
  permissions: AdminPermission[];
  description: string;
}

export interface AdminPermission {
  id: string;
  resource: string;
  action: string;
  scope?: string;
  description: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

// Define admin hierarchy levels
export const ADMIN_LEVELS = {
  SUPER_ADMIN: 100,
  PLATFORM_ADMIN: 80,
  CONTENT_ADMIN: 60,
  SUPPORT_ADMIN: 40,
  MODERATOR: 20
} as const;

// Define all available permissions
export const ADMIN_PERMISSIONS: Record<string, AdminPermission> = {
  // User Management
  'users:read': {
    id: 'users:read',
    resource: 'users',
    action: SCHEMA_FIELDS.NOTIFICATION.READ,
    description: 'View user profiles and basic information'
  },
  'users:write': {
    id: 'users:write',
    resource: 'users',
    action: 'write',
    description: 'Edit user profiles and settings'
  },
  'users:delete': {
    id: 'users:delete',
    resource: 'users',
    action: 'delete',
    description: 'Suspend or delete user accounts'
  },
  'users:impersonate': {
    id: 'users:impersonate',
    resource: 'users',
    action: 'impersonate',
    description: 'Login as another user for support purposes'
  },

  // Platform Management
  'platform:settings': {
    id: 'platform:settings',
    resource: 'platform',
    action: 'settings',
    description: 'Modify platform-wide settings and configurations'
  },
  'platform:features': {
    id: 'platform:features',
    resource: 'platform',
    action: 'features',
    description: 'Enable/disable platform features and experiments'
  },
  'platform:maintenance': {
    id: 'platform:maintenance',
    resource: 'platform',
    action: 'maintenance',
    description: 'Put platform in maintenance mode'
  },

  // Content Moderation
  'content:moderate': {
    id: 'content:moderate',
    resource: 'content',
    action: 'moderate',
    description: 'Review and moderate user-generated content'
  },
  'content:remove': {
    id: 'content:remove',
    resource: 'content',
    action: 'remove',
    description: 'Remove inappropriate content'
  },
  'content:restore': {
    id: 'content:restore',
    resource: 'content',
    action: 'restore',
    description: 'Restore previously removed content'
  },

  // Analytics & Reports
  'analytics:view': {
    id: 'analytics:view',
    resource: 'analytics',
    action: 'view',
    description: 'View platform analytics and reports'
  },
  'analytics:export': {
    id: 'analytics:export',
    resource: 'analytics',
    action: 'export',
    description: 'Export analytics data and reports'
  },

  // Financial Management
  'finance:view': {
    id: 'finance:view',
    resource: 'finance',
    action: 'view',
    description: 'View financial reports and transaction data'
  },
  'finance:payouts': {
    id: 'finance:payouts',
    resource: 'finance',
    action: 'payouts',
    description: 'Manage creator payouts and financial operations'
  },

  // System Administration
  'system:logs': {
    id: 'system:logs',
    resource: 'system',
    action: 'logs',
    description: 'Access system logs and audit trails'
  },
  'system:monitoring': {
    id: 'system:monitoring',
    resource: 'system',
    action: 'monitoring',
    description: 'Access monitoring dashboards and alerts'
  },

  // Role Management
  'roles:assign': {
    id: 'roles:assign',
    resource: 'roles',
    action: 'assign',
    description: 'Assign roles to users'
  },
  'roles:manage': {
    id: 'roles:manage',
    resource: 'roles',
    action: 'manage',
    description: 'Create and modify admin roles'
  }
};

// Define admin role hierarchy
export const ADMIN_ROLES: Record<string, AdminRole> = {
  SUPER_ADMIN: {
    id: 'super_admin',
    name: 'Super Administrator',
    level: ADMIN_LEVELS.SUPER_ADMIN,
    description: 'Full platform access with all permissions',
    permissions: Object.values(ADMIN_PERMISSIONS)
  },
  
  PLATFORM_ADMIN: {
    id: 'platform_admin',
    name: 'Platform Administrator',
    level: ADMIN_LEVELS.PLATFORM_ADMIN,
    description: 'Platform management and user administration',
    permissions: [
      ADMIN_PERMISSIONS['users:read'],
      ADMIN_PERMISSIONS['users:write'],
      ADMIN_PERMISSIONS['users:delete'],
      ADMIN_PERMISSIONS['platform:settings'],
      ADMIN_PERMISSIONS['platform:features'],
      ADMIN_PERMISSIONS['analytics:view'],
      ADMIN_PERMISSIONS['analytics:export'],
      ADMIN_PERMISSIONS['finance:view'],
      ADMIN_PERMISSIONS['system:logs'],
      ADMIN_PERMISSIONS['system:monitoring'],
      ADMIN_PERMISSIONS['roles:assign']
    ]
  },

  CONTENT_ADMIN: {
    id: 'content_admin',
    name: 'Content Administrator',
    level: ADMIN_LEVELS.CONTENT_ADMIN,
    description: 'Content moderation and user management',
    permissions: [
      ADMIN_PERMISSIONS['users:read'],
      ADMIN_PERMISSIONS['users:write'],
      ADMIN_PERMISSIONS['content:moderate'],
      ADMIN_PERMISSIONS['content:remove'],
      ADMIN_PERMISSIONS['content:restore'],
      ADMIN_PERMISSIONS['analytics:view']
    ]
  },

  SUPPORT_ADMIN: {
    id: 'support_admin',
    name: 'Support Administrator',
    level: ADMIN_LEVELS.SUPPORT_ADMIN,
    description: 'Customer support and basic user management',
    permissions: [
      ADMIN_PERMISSIONS['users:read'],
      ADMIN_PERMISSIONS['users:write'],
      ADMIN_PERMISSIONS['users:impersonate'],
      ADMIN_PERMISSIONS['content:moderate'],
      ADMIN_PERMISSIONS['analytics:view']
    ]
  },

  MODERATOR: {
    id: 'moderator',
    name: 'Moderator',
    level: ADMIN_LEVELS.MODERATOR,
    description: 'Basic content moderation capabilities',
    permissions: [
      ADMIN_PERMISSIONS['users:read'],
      ADMIN_PERMISSIONS['content:moderate'],
      ADMIN_PERMISSIONS['content:remove']
    ]
  }
};

/**
 * Check if user has specific admin permission
 */
export function hasAdminPermission(
  userRole: UserRole,
  adminRole: string | undefined,
  permissionId: string
): boolean {
  // Legacy admin check for backward compatibility
  if (userRole === 'admin' && !adminRole) {
    return true; // Legacy admins have all permissions
  }

  if (!adminRole || !ADMIN_ROLES[adminRole]) {
    return false;
  }

  const role = ADMIN_ROLES[adminRole];
  return role.permissions.some(permission => permission.id === permissionId);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyAdminPermission(
  userRole: UserRole,
  adminRole: string | undefined,
  permissionIds: string[]
): boolean {
  return permissionIds.some(permissionId => 
    hasAdminPermission(userRole, adminRole, permissionId)
  );
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllAdminPermissions(
  userRole: UserRole,
  adminRole: string | undefined,
  permissionIds: string[]
): boolean {
  return permissionIds.every(permissionId => 
    hasAdminPermission(userRole, adminRole, permissionId)
  );
}

/**
 * Get all permissions for a user's admin role
 */
export function getAdminPermissions(
  userRole: UserRole,
  adminRole: string | undefined
): AdminPermission[] {
  // Legacy admin check
  if (userRole === 'admin' && !adminRole) {
    return Object.values(ADMIN_PERMISSIONS);
  }

  if (!adminRole || !ADMIN_ROLES[adminRole]) {
    return [];
  }

  return ADMIN_ROLES[adminRole].permissions;
}

/**
 * Check if user can manage another admin user
 */
export function canManageAdminUser(
  currentUserRole: UserRole,
  currentAdminRole: string | undefined,
  targetAdminRole: string | undefined
): boolean {
  // Must have role management permission
  if (!hasAdminPermission(currentUserRole, currentAdminRole, 'roles:assign')) {
    return false;
  }

  // Can't manage users with equal or higher admin level
  const currentRole = currentAdminRole ? ADMIN_ROLES[currentAdminRole] : null;
  const targetRole = targetAdminRole ? ADMIN_ROLES[targetAdminRole] : null;

  if (!currentRole) {
    return false;
  }

  if (!targetRole) {
    return true; // Can manage non-admin users
  }

  return currentRole.level > targetRole.level;
}

/**
 * Validate admin action and check permissions
 */
export function validateAdminAction(
  userRole: UserRole,
  adminRole: string | undefined,
  action: string,
  resource: string,
  context?: Record<string, any>
): { allowed: boolean; reason?: string } {
  const permissionId = `${resource}:${action}`;
  
  if (!hasAdminPermission(userRole, adminRole, permissionId)) {
    return {
      allowed: false,
      reason: `Insufficient permissions for ${action} on ${resource}`
    };
  }

  // Additional context-based validation can be added here
  // For example, checking if user can manage specific resource instances

  return { allowed: true };
}

/**
 * Get admin role hierarchy for display
 */
export function getAdminRoleHierarchy(): AdminRole[] {
  return Object.values(ADMIN_ROLES).sort((a, b) => b.level - a.level);
}

/**
 * Get available admin roles for assignment by current user
 */
export function getAssignableAdminRoles(
  currentUserRole: UserRole,
  currentAdminRole: string | undefined
): AdminRole[] {
  const currentRole = currentAdminRole ? ADMIN_ROLES[currentAdminRole] : null;
  
  if (!currentRole || !hasAdminPermission(currentUserRole, currentAdminRole, 'roles:assign')) {
    return [];
  }

  // Can only assign roles with lower level than current user
  return Object.values(ADMIN_ROLES).filter(role => role.level < currentRole.level);
}