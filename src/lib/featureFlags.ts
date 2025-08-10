/**
 * Feature Flag System
 * 
 * Controls access to incomplete or experimental features before production release.
 * Features are gated by environment variables and configuration flags.
 */

export interface FeatureFlags {
  ENABLE_2FA: boolean;
  ENABLE_KYC_WEBHOOK: boolean;
  ENABLE_ANALYTICS_DASHBOARD: boolean;
  ENABLE_ADVANCED_SEARCH: boolean;
  ENABLE_CHAT_ENCRYPTION: boolean;
}

/**
 * Get current feature flag configuration
 */
export function getFeatureFlags(): FeatureFlags {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    // 2FA is disabled in production until security audit is complete
    ENABLE_2FA: process.env.ENABLE_2FA === 'true' && !isProduction,
    
    // KYC webhook disabled until Stripe Identity integration is finalized
    ENABLE_KYC_WEBHOOK: process.env.ENABLE_KYC_WEBHOOK === 'true' && !isProduction,
    
    // Analytics dashboard disabled until data privacy compliance is verified
    ENABLE_ANALYTICS_DASHBOARD: process.env.ENABLE_ANALYTICS_DASHBOARD === 'true' && !isProduction,
    
    // Advanced search enabled for testing
    ENABLE_ADVANCED_SEARCH: process.env.ENABLE_ADVANCED_SEARCH !== 'false',
    
    // Chat encryption enabled for testing
    ENABLE_CHAT_ENCRYPTION: process.env.ENABLE_CHAT_ENCRYPTION !== 'false'
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

/**
 * Middleware to protect feature-flagged routes
 */
export function requireFeatureFlag(feature: keyof FeatureFlags) {
  return (handler: Function) => {
    return async (req: any, res: any, ...args: any[]) => {
      if (!isFeatureEnabled(feature)) {
        if (typeof Response !== 'undefined') {
          // Next.js App Router
          return new Response(
            JSON.stringify({
              error: 'Feature not available',
              feature,
              message: `The ${feature} feature is currently disabled.`
            }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        } else {
          // Next.js Pages Router
          return res.status(404).json({
            error: 'Feature not available',
            feature,
            message: `The ${feature} feature is currently disabled.`
          });
        }
      }
      
      return handler(req, res, ...args);
    };
  };
}

/**
 * Feature flag configuration for development
 */
export const DEVELOPMENT_FEATURES = {
  ENABLE_2FA: 'true',
  ENABLE_KYC_WEBHOOK: 'true', 
  ENABLE_ANALYTICS_DASHBOARD: 'true'
};

/**
 * Get feature availability status for client-side
 */
export function getClientFeatureFlags() {
  if (typeof window === 'undefined') {
    // Server-side
    return getFeatureFlags();
  }
  
  // Client-side: only return safe flags
  return {
    ENABLE_ADVANCED_SEARCH: isFeatureEnabled('ENABLE_ADVANCED_SEARCH'),
    ENABLE_CHAT_ENCRYPTION: isFeatureEnabled('ENABLE_CHAT_ENCRYPTION'),
    // Sensitive features not exposed to client
    ENABLE_2FA: false,
    ENABLE_KYC_WEBHOOK: false,
    ENABLE_ANALYTICS_DASHBOARD: false
  };
}