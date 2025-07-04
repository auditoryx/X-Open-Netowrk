import { UserRole } from '@/lib/types/user';
import { checkAdminAccess, checkModeratorAccess, AccessResult } from '@/lib/utils/checkUserAccess';

interface AdminCheckOptions {
  allowModerators?: boolean;
  requiredPermissions?: string[];
}

/**
 * Check if user has admin access
 */
export function checkAdminAccess(
  userRole: UserRole,
  options: AdminCheckOptions = {}
): AccessResult {
  const { allowModerators = false, requiredPermissions = [] } = options;

  // Check if user is admin
  if (userRole === 'admin') {
    return { hasAccess: true };
  }

  // Check if moderators are allowed
  if (allowModerators && userRole === 'moderator') {
    return { hasAccess: true };
  }

  // Check specific permissions if required
  if (requiredPermissions.length > 0) {
    const userPermissions = getUserPermissions(userRole);
    const missingPermissions = requiredPermissions.filter(
      perm => !userPermissions.includes(perm)
    );

    if (missingPermissions.length > 0) {
      return {
        hasAccess: false,
        reason: 'Missing required admin permissions',
        missingPermissions
      };
    }
  }

  return {
    hasAccess: false,
    reason: 'Insufficient admin privileges'
  };
}

/**
 * Get user permissions based on role
 */
function getUserPermissions(role: UserRole): string[] {
  switch (role) {
    case 'admin':
      return [
        'admin:read',
        'admin:write',
        'admin:delete',
        'admin:manage_users',
        'admin:manage_platform',
        'admin:view_analytics',
        'admin:manage_roles',
        'admin:manage_permissions'
      ];
    case 'moderator':
      return [
        'mod:read',
        'mod:write',
        'mod:moderate_content',
        'mod:manage_users',
        'mod:view_reports'
      ];
    case 'creator':
      return [
        'creator:read',
        'creator:write',
        'creator:manage_profile',
        'creator:manage_services'
      ];
    case 'user':
      return [
        'user:read',
        'user:write',
        'user:manage_profile'
      ];
    default:
      return [];
  }
}

/**
 * Check if user can access admin dashboard
 */
export function checkAdminDashboardAccess(userRole: UserRole): AccessResult {
  return checkAdminAccess(userRole, { allowModerators: true });
}

/**
 * Check if user can manage other users
 */
export function checkUserManagementAccess(userRole: UserRole): AccessResult {
  return checkAdminAccess(userRole, { 
    allowModerators: true,
    requiredPermissions: ['admin:manage_users', 'mod:manage_users']
  });
}

/**
 * Check if user can view analytics
 */
export function checkAnalyticsAccess(userRole: UserRole): AccessResult {
  return checkAdminAccess(userRole, { 
    allowModerators: true,
    requiredPermissions: ['admin:view_analytics']
  });
}

/**
 * Check if user can manage platform settings
 */
export function checkPlatformManagementAccess(userRole: UserRole): AccessResult {
  return checkAdminAccess(userRole, { 
    allowModerators: false,
    requiredPermissions: ['admin:manage_platform']
  });
}

/**
 * Validate admin session
 */
export async function validateAdminSession(
  userId: string,
  userRole: UserRole
): Promise<AccessResult> {
  try {
    // Check basic admin access
    const accessResult = checkAdminAccess(userRole, { allowModerators: true });
    
    if (!accessResult.hasAccess) {
      return accessResult;
    }

    // Additional session validation could be added here
    // For example: check if admin session is still valid, not expired, etc.
    
    return { hasAccess: true };
  } catch (error) {
    return {
      hasAccess: false,
      reason: 'Failed to validate admin session'
    };
  }
}
