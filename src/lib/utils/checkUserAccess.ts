import { UserRole } from '@/lib/types/user';

interface UserAccessCheck {
  userId: string;
  role: UserRole;
  requiredRole: UserRole;
  requiredPermissions?: string[];
}

export interface AccessResult {
  hasAccess: boolean;
  reason?: string;
  missingPermissions?: string[];
}

/**
 * Check if user has access to a resource based on role and permissions
 */
export function checkUserAccess(
  userRole: UserRole,
  requiredRole: UserRole,
  requiredPermissions?: string[]
): AccessResult {
  // Role hierarchy: admin > moderator > creator > user
  const roleHierarchy: Record<UserRole, number> = {
    admin: 4,
    moderator: 3,
    creator: 2,
    user: 1
  };

  const userRoleLevel = roleHierarchy[userRole];
  const requiredRoleLevel = roleHierarchy[requiredRole];

  // Check role level
  if (userRoleLevel < requiredRoleLevel) {
    return {
      hasAccess: false,
      reason: `Insufficient role level. Required: ${requiredRole}, Current: ${userRole}`
    };
  }

  // Check specific permissions if required
  if (requiredPermissions && requiredPermissions.length > 0) {
    // For now, we'll assume admins have all permissions
    // In a real app, you'd check against a permissions database
    const userPermissions = getUserPermissions(userRole);
    const missingPermissions = requiredPermissions.filter(
      perm => !userPermissions.includes(perm)
    );

    if (missingPermissions.length > 0) {
      return {
        hasAccess: false,
        reason: 'Missing required permissions',
        missingPermissions
      };
    }
  }

  return { hasAccess: true };
}

/**
 * Get user permissions based on role
 */
function getUserPermissions(role: UserRole): string[] {
  switch (role) {
    case 'admin':
      return [
        'read:users',
        'write:users',
        'delete:users',
        'read:bookings',
        'write:bookings',
        'delete:bookings',
        'read:analytics',
        'write:analytics',
        'manage:platform',
        'manage:roles',
        'manage:permissions'
      ];
    case 'moderator':
      return [
        'read:users',
        'write:users',
        'read:bookings',
        'write:bookings',
        'read:analytics',
        'moderate:content'
      ];
    case 'creator':
      return [
        'read:own_profile',
        'write:own_profile',
        'read:own_bookings',
        'write:own_bookings',
        'create:services',
        'manage:availability'
      ];
    case 'user':
      return [
        'read:own_profile',
        'write:own_profile',
        'read:own_bookings',
        'create:bookings'
      ];
    default:
      return [];
  }
}

/**
 * Check if user can access admin features
 */
export function checkAdminAccess(userRole: UserRole): AccessResult {
  return checkUserAccess(userRole, 'admin');
}

/**
 * Check if user can access moderator features
 */
export function checkModeratorAccess(userRole: UserRole): AccessResult {
  return checkUserAccess(userRole, 'moderator');
}

/**
 * Check if user can access creator features
 */
export function checkCreatorAccess(userRole: UserRole): AccessResult {
  return checkUserAccess(userRole, 'creator');
}

/**
 * Check if user can perform specific action
 */
export function checkUserPermission(
  userRole: UserRole,
  permission: string
): AccessResult {
  const userPermissions = getUserPermissions(userRole);
  
  if (userPermissions.includes(permission)) {
    return { hasAccess: true };
  }

  return {
    hasAccess: false,
    reason: `Missing permission: ${permission}`,
    missingPermissions: [permission]
  };
}

/**
 * Check if user can access resource based on ownership
 */
export function checkResourceOwnership(
  userId: string,
  resourceOwnerId: string,
  userRole: UserRole
): AccessResult {
  // Owner can always access their own resources
  if (userId === resourceOwnerId) {
    return { hasAccess: true };
  }

  // Admins and moderators can access any resource
  if (userRole === 'admin' || userRole === 'moderator') {
    return { hasAccess: true };
  }

  return {
    hasAccess: false,
    reason: 'Not authorized to access this resource'
  };
}

/**
 * Check if user is banned
 */
export async function isUserBanned(userId: string): Promise<boolean> {
  try {
    // Mock implementation - in real app would check database
    return false;
  } catch (error) {
    console.error('Error checking user ban status:', error);
    return false;
  }
}

/**
 * Check if user is verified
 */
export async function isUserVerified(userId: string): Promise<boolean> {
  try {
    // Mock implementation - in real app would check database
    return false;
  } catch (error) {
    console.error('Error checking user verification status:', error);
    return false;
  }
}

/**
 * Check if user has signature tier
 */
export async function hasSignatureTier(userId: string): Promise<boolean> {
  try {
    // Mock implementation - in real app would check database
    return false;
  } catch (error) {
    console.error('Error checking user signature tier:', error);
    return false;
  }
}
