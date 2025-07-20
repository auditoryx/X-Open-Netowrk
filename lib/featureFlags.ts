/**
 * Feature Flags Configuration
 * 
 * Controls which features are available in different environments
 * Reads from NEXT_PUBLIC_BETA_FLAGS environment variable
 */

// Feature flag types
export type FeatureFlag = 
  // Gamification features
  | 'leaderboards'
  | 'challenges' 
  | 'badges'
  | 'rankings'
  
  // Advanced booking features
  | 'split-bookings'
  | 'booking-chat'
  | 'booking-escrow'
  | 'booking-revisions'
  
  // Creator features  
  | 'beat-marketplace'
  | 'portfolio-advanced'
  | 'creator-verification'
  | 'creator-analytics'
  
  // Admin features
  | 'admin-dashboard'
  | 'admin-disputes'
  | 'admin-analytics'
  | 'admin-reports'
  
  // Social features
  | 'reviews-system'
  | 'testimonials'
  | 'social-profiles'
  | 'creator-following'
  
  // Enterprise features
  | 'enterprise-dashboard'
  | 'label-management'
  | 'bulk-booking'
  | 'team-collaboration'
  
  // Payment features
  | 'creator-payouts'
  | 'revenue-splitting'
  | 'escrow-system'
  | 'subscription-tiers'
  
  // PWA features
  | 'offline-support'
  | 'push-notifications'
  | 'app-install'
  
  // Testing features
  | 'test-pages'
  | 'debug-tools';

// Default feature flag configuration
const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  // Gamification - flagged for beta testing
  'leaderboards': false,
  'challenges': false, 
  'badges': true, // Basic badges are stable
  'rankings': false,
  
  // Advanced booking - needs testing
  'split-bookings': false,
  'booking-chat': false,
  'booking-escrow': false,
  'booking-revisions': false,
  
  // Creator features - partial rollout
  'beat-marketplace': false,
  'portfolio-advanced': false,
  'creator-verification': false,
  'creator-analytics': false,
  
  // Admin features - restricted access
  'admin-dashboard': false,
  'admin-disputes': false,
  'admin-analytics': false,  
  'admin-reports': false,
  
  // Social features - needs moderation
  'reviews-system': false,
  'testimonials': false,
  'social-profiles': true, // Basic profiles are ready
  'creator-following': false,
  
  // Enterprise - post-MVP
  'enterprise-dashboard': false,
  'label-management': false,
  'bulk-booking': false,
  'team-collaboration': false,
  
  // Payment - needs compliance review
  'creator-payouts': false,
  'revenue-splitting': false,
  'escrow-system': false,
  'subscription-tiers': false,
  
  // PWA - basic support ready
  'offline-support': true,
  'push-notifications': false,
  'app-install': true,
  
  // Testing - dev only
  'test-pages': false,
  'debug-tools': false,
};

/**
 * Parse feature flags from environment variable
 * Format: "flag1:true,flag2:false,flag3:true"
 */
function parseFeatureFlags(): Record<FeatureFlag, boolean> {
  const flagsString = process.env.NEXT_PUBLIC_BETA_FLAGS || '';
  
  if (!flagsString) {
    return DEFAULT_FLAGS;
  }
  
  const flags = { ...DEFAULT_FLAGS };
  
  try {
    const pairs = flagsString.split(',');
    for (const pair of pairs) {
      const [key, value] = pair.split(':');
      if (key && value && key in DEFAULT_FLAGS) {
        flags[key as FeatureFlag] = value.toLowerCase() === 'true';
      }
    }
  } catch (error) {
    console.warn('Error parsing NEXT_PUBLIC_BETA_FLAGS:', error);
  }
  
  return flags;
}

// Initialize feature flags
const FEATURE_FLAGS = parseFeatureFlags();

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag] || false;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([flag, _]) => flag as FeatureFlag);
}

/**
 * Get all disabled features  
 */
export function getDisabledFeatures(): FeatureFlag[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => !enabled)
    .map(([flag, _]) => flag as FeatureFlag);
}

/**
 * Development helper - log current feature flag status
 */
export function logFeatureFlags(): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚩 Feature Flags Status');
    console.table(FEATURE_FLAGS);
    console.groupEnd();
  }
}

/**
 * React hook for feature flags (client-side)
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  return isFeatureEnabled(flag);
}

/**
 * React hook to check multiple feature flags
 */
export function useFeatureFlags(flags: FeatureFlag[]): Record<FeatureFlag, boolean> {
  return flags.reduce((acc, flag) => {
    acc[flag] = isFeatureEnabled(flag);
    return acc;
  }, {} as Record<FeatureFlag, boolean>);
}

/**
 * Higher-order component for feature gating
 */
export function withFeatureFlag<P extends object>(
  flag: FeatureFlag,
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>
) {
  return function FeatureGatedComponent(props: P) {
    if (isFeatureEnabled(flag)) {
      return <Component {...props} />;
    }
    
    if (FallbackComponent) {
      return <FallbackComponent {...props} />;
    }
    
    return null;
  };
}

/**
 * Conditional rendering based on feature flag
 */
export function FeatureGate({ 
  flag, 
  children, 
  fallback 
}: { 
  flag: FeatureFlag;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (isFeatureEnabled(flag)) {
    return <>{children}</>;
  }
  
  return <>{fallback || null}</>;
}

/**
 * Route-level feature gating configuration
 * Maps routes to required feature flags
 */
export const ROUTE_FEATURE_MAP: Record<string, FeatureFlag[]> = {
  // Gamification routes
  '/leaderboard': ['leaderboards'],
  '/leaderboards/[city]/[role]': ['leaderboards'],
  '/dashboard/leaderboard': ['leaderboards'],
  '/dashboard/challenges': ['challenges'],
  '/top-creators': ['rankings'],
  
  // Advanced booking
  '/booking/[bookingId]/chat': ['booking-chat'],
  
  // Creator features
  '/beats': ['beat-marketplace'],
  '/dashboard/enhanced-portfolio': ['portfolio-advanced'],
  '/dashboard/enhanced-profile': ['portfolio-advanced'],
  '/dashboard/analytics': ['creator-analytics'],
  '/verify-info': ['creator-verification'],
  
  // Admin routes
  '/admin/dashboard': ['admin-dashboard'],
  '/admin/disputes': ['admin-disputes'],
  '/admin/reports': ['admin-reports'],
  '/dashboard/admin/reports': ['admin-analytics'],
  '/dashboard/admin/analytics': ['admin-analytics'],
  
  // Social features
  '/dashboard/reviews': ['reviews-system'],
  '/dashboard/testimonials': ['testimonials'],
  '/dashboard/favorites': ['social-profiles'],
  '/saved': ['social-profiles'],
  
  // Enterprise features  
  '/dashboard/enterprise/label-dashboard': ['enterprise-dashboard'],
  '/dashboard/collabs': ['team-collaboration'],
  '/dashboard/collabs/[bookingId]': ['team-collaboration'],
  
  // Payment features
  '/dashboard/earnings': ['creator-payouts'],
  '/dashboard/finances': ['revenue-splitting'],
  '/legal/escrow': ['escrow-system'],
  
  // PWA features
  '/offline': ['offline-support'],
  
  // Test pages
  '/test-admin-verification': ['test-pages'],
  '/test-booking': ['test-pages'],
  '/test-components': ['test-pages'],
  '/test-verification': ['test-pages'],
  '/test/badge-display': ['test-pages'],
  '/test/ranking-components': ['test-pages'],
  '/test/verification-components': ['test-pages'],
  '/test/xp-display': ['test-pages'],
};

/**
 * Check if a route is accessible based on feature flags
 */
export function isRouteAccessible(route: string): boolean {
  const requiredFlags = ROUTE_FEATURE_MAP[route];
  
  if (!requiredFlags) {
    return true; // Route has no feature flag requirements
  }
  
  return requiredFlags.every(flag => isFeatureEnabled(flag));
}

/**
 * Get inaccessible routes based on current feature flags
 */
export function getInaccessibleRoutes(): string[] {
  return Object.keys(ROUTE_FEATURE_MAP).filter(route => !isRouteAccessible(route));
}

// Export types and configuration
export { DEFAULT_FLAGS, FEATURE_FLAGS };
export type { FeatureFlag };