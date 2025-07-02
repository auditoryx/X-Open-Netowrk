/**
 * Comprehensive user access checking utilities
 * for verification, signature tier, and role-based access control
 */

interface UserData {
  uid: string;
  role?: string;
  banned?: boolean;
  isVerified?: boolean;
  verified?: boolean;
  signature?: boolean;
  proTier?: 'standard' | 'verified' | 'signature';
  rank?: 'verified' | 'signature' | 'top5';
}

export interface AccessCheckResult {
  hasAccess: boolean;
  reason?: string;
  redirectTo?: string;
}

/**
 * Check if user can access signature-tier services
 */
export function canAccessSignatureTier(userData: UserData): AccessCheckResult {
  // Must be verified to access signature tier
  if (!isUserVerified(userData)) {
    return {
      hasAccess: false,
      reason: 'You must be verified to access Signature-tier services.',
      redirectTo: '/profile/verification'
    };
  }

  // Must have signature tier
  if (!hasSignatureTier(userData)) {
    return {
      hasAccess: false,
      reason: 'This service requires Signature tier access.',
      redirectTo: '/upgrade'
    };
  }

  return { hasAccess: true };
}

/**
 * Check if user can access verified-only services
 */
export function canAccessVerifiedServices(userData: UserData): AccessCheckResult {
  if (!isUserVerified(userData)) {
    return {
      hasAccess: false,
      reason: 'This service requires verified account status.',
      redirectTo: '/profile/verification'
    };
  }

  return { hasAccess: true };
}

/**
 * Check if user is verified through any verification method
 */
export function isUserVerified(userData: UserData): boolean {
  return !!(
    userData?.isVerified ||
    userData?.verified ||
    userData?.proTier === 'verified' ||
    userData?.proTier === 'signature' ||
    userData?.rank === 'verified' ||
    userData?.rank === 'signature' ||
    userData?.rank === 'top5'
  );
}

/**
 * Check if user has signature tier access
 */
export function hasSignatureTier(userData: UserData): boolean {
  return !!(
    userData?.signature ||
    userData?.proTier === 'signature' ||
    userData?.rank === 'signature' ||
    userData?.rank === 'top5'
  );
}

/**
 * Check if user is banned
 */
export function isUserBanned(userData: UserData): boolean {
  return !!userData?.banned;
}

/**
 * Check user's tier level (0 = standard, 1 = verified, 2 = signature, 3 = top5)
 */
export function getUserTierLevel(userData: UserData): number {
  if (userData?.rank === 'top5') return 3;
  if (hasSignatureTier(userData)) return 2;
  if (isUserVerified(userData)) return 1;
  return 0;
}

/**
 * Check if user meets minimum tier requirement
 */
export function meetsMinimumTier(userData: UserData, minTier: 'verified' | 'signature' | 'top5'): AccessCheckResult {
  const userLevel = getUserTierLevel(userData);
  
  const tierLevels = {
    'verified': 1,
    'signature': 2,
    'top5': 3
  };

  const requiredLevel = tierLevels[minTier];

  if (userLevel >= requiredLevel) {
    return { hasAccess: true };
  }

  const tierNames = {
    'verified': 'Verified',
    'signature': 'Signature',
    'top5': 'Top 5%'
  };

  return {
    hasAccess: false,
    reason: `This service requires ${tierNames[minTier]} tier access.`,
    redirectTo: minTier === 'verified' ? '/profile/verification' : '/upgrade'
  };
}

/**
 * Check service booking access (combines verification and tier checks)
 */
export function canBookService(userData: UserData, serviceRequirements: {
  requiresVerification?: boolean;
  minTier?: 'verified' | 'signature' | 'top5';
  inviteOnly?: boolean;
  allowedUids?: string[];
}): AccessCheckResult {
  const { requiresVerification, minTier, inviteOnly, allowedUids } = serviceRequirements;

  // Check if user is banned
  if (isUserBanned(userData)) {
    return {
      hasAccess: false,
      reason: 'Your account is currently banned.',
      redirectTo: '/banned'
    };
  }

  // Check invite-only access
  if (inviteOnly && allowedUids && !allowedUids.includes(userData.uid)) {
    // Not in allowed list, check if they meet tier requirements
    if (minTier) {
      return meetsMinimumTier(userData, minTier);
    } else {
      return {
        hasAccess: false,
        reason: 'This service is invite-only.'
      };
    }
  }

  // Check verification requirement
  if (requiresVerification && !isUserVerified(userData)) {
    return {
      hasAccess: false,
      reason: 'This service requires account verification.',
      redirectTo: '/profile/verification'
    };
  }

  // Check minimum tier requirement
  if (minTier) {
    return meetsMinimumTier(userData, minTier);
  }

  return { hasAccess: true };
}
