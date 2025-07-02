import { withRoleProtection } from './withRoleProtection';

/**
 * Higher-order component that protects routes requiring signature tier access
 * Also ensures user is verified since signature tier requires verification
 */
export function withSignatureTierProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    allowedRoles?: string[];
    redirectTo?: string;
    showAccessDenied?: boolean;
  } = {}
) {
  const {
    allowedRoles = ['artist', 'producer', 'engineer', 'studio', 'videographer'],
    redirectTo = '/upgrade',
    showAccessDenied = true
  } = options;

  return withRoleProtection(Component, allowedRoles as any, {
    requireVerified: true,
    requireSignatureTier: true,
    redirectTo,
    showAccessDenied,
    allowBanned: false
  });
}

/**
 * Higher-order component that protects routes requiring verified user status
 */
export function withVerifiedProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    allowedRoles?: string[];
    redirectTo?: string;
    showAccessDenied?: boolean;
  } = {}
) {
  const {
    allowedRoles = ['artist', 'producer', 'engineer', 'studio', 'videographer', 'client'],
    redirectTo = '/profile/verification',
    showAccessDenied = true
  } = options;

  return withRoleProtection(Component, allowedRoles as any, {
    requireVerified: true,
    requireSignatureTier: false,
    redirectTo,
    showAccessDenied,
    allowBanned: false
  });
}
