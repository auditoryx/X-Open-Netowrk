import { NextRequest, NextResponse } from 'next/server'
import { getPatternBasedRateLimit } from '@/middleware/rateLimiting'
import { analyzeTrafficPattern, logSecurityEvent } from '@/lib/security/ddosProtection'

/**
 * Route-level auth used to run here using Firebase Admin to verify session
 * cookies (see `src/middleware/profileCheck.ts.bak`). That approach isn't
 * compatible with Next.js Middleware's Edge runtime, so authentication and
 * role checks are now handled client-side via `withRoleProtection` and
 * `withAdminProtection` HOCs. 
 * 
 * This middleware now handles:
 * 1. Feature flag-based route protection
 * 2. Basic request processing
 * 3. Rate limiting and DDoS protection
 */

// Feature flag route mapping (duplicated from lib/featureFlags.ts for edge runtime)
const ROUTE_FEATURE_MAP: Record<string, string[]> = {
  '/leaderboard': ['leaderboards'],
  '/leaderboards': ['leaderboards'],
  '/dashboard/leaderboard': ['leaderboards'],
  '/dashboard/challenges': ['challenges'],
  '/top-creators': ['rankings'],
  '/booking/.*?/chat': ['booking-chat'],
  '/beats': ['beat-marketplace'],
  '/dashboard/enhanced-portfolio': ['portfolio-advanced'],
  '/dashboard/enhanced-profile': ['portfolio-advanced'],
  '/dashboard/analytics': ['creator-analytics'],
  '/verify-info': ['creator-verification'],
  '/admin/dashboard': ['admin-dashboard'],
  '/admin/disputes': ['admin-disputes'],
  '/admin/reports': ['admin-reports'],
  '/dashboard/admin': ['admin-dashboard'],
  '/dashboard/reviews': ['reviews-system'],
  '/dashboard/testimonials': ['testimonials'],
  '/dashboard/favorites': ['social-profiles'],
  '/saved': ['social-profiles'],
  '/dashboard/enterprise': ['enterprise-dashboard'],
  '/dashboard/collabs': ['team-collaboration'],
  '/dashboard/earnings': ['creator-payouts'],
  '/dashboard/finances': ['revenue-splitting'],
  '/legal/escrow': ['escrow-system'],
  '/offline': ['offline-support'],
  '/test': ['test-pages'],
};

/**
 * Parse feature flags from environment variable
 */
function parseFeatureFlags(): Record<string, boolean> {
  const flagsString = process.env.NEXT_PUBLIC_BETA_FLAGS || '';
  
  if (!flagsString) {
    return {};
  }
  
  const flags: Record<string, boolean> = {};
  
  try {
    const pairs = flagsString.split(',');
    for (const pair of pairs) {
      const [key, value] = pair.split(':');
      if (key && value) {
        flags[key] = value.toLowerCase() === 'true';
      }
    }
  } catch (error) {
    console.warn('Error parsing NEXT_PUBLIC_BETA_FLAGS:', error);
  }
  
  return flags;
}

/**
 * Check if route is feature-flagged and accessible
 */
function isRouteAccessible(pathname: string, flags: Record<string, boolean>): boolean {
  for (const [route, requiredFlags] of Object.entries(ROUTE_FEATURE_MAP)) {
    const routePattern = new RegExp(`^${route.replace(/\*/g, '.*')}$`);
    
    if (routePattern.test(pathname)) {
      // Check if all required flags are enabled
      return requiredFlags.every(flag => flags[flag] === true);
    }
  }
  
  // Route has no feature flag requirements
  return true;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Apply DDoS protection for all requests
  try {
    const ddosAnalysis = await analyzeTrafficPattern(req);
    
    if (ddosAnalysis.action === 'block') {
      logSecurityEvent({
        type: 'ddos_attempt',
        ip: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || '',
        severity: 'critical',
        details: {
          reasons: ddosAnalysis.reasons,
          confidence: ddosAnalysis.confidence,
          pathname
        }
      });
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Request blocked due to suspicious activity',
          retryAfter: 300 
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '300',
          }
        }
      );
    }
    
    if (ddosAnalysis.action === 'throttle') {
      logSecurityEvent({
        type: 'suspicious_activity',
        ip: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || '',
        severity: 'medium',
        details: {
          reasons: ddosAnalysis.reasons,
          confidence: ddosAnalysis.confidence,
          pathname
        }
      });
    }
  } catch (error) {
    console.warn('DDoS protection error:', error);
  }
  
  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    try {
      const rateLimitMiddleware = getPatternBasedRateLimit(pathname);
      const rateLimitResult = await rateLimitMiddleware(req);
      
      if (rateLimitResult && rateLimitResult.status === 429) {
        logSecurityEvent({
          type: 'rate_limit_exceeded',
          ip: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown',
          userAgent: req.headers.get('user-agent') || '',
          severity: 'medium',
          details: { pathname }
        });
        
        return rateLimitResult;
      }
      
      if (rateLimitResult) {
        return rateLimitResult;
      }
    } catch (error) {
      console.warn('Rate limiting error:', error);
    }
  }
  
  // Parse feature flags
  const featureFlags = parseFeatureFlags();
  
  // Check if route is accessible based on feature flags
  if (!isRouteAccessible(pathname, featureFlags)) {
    // Redirect to 404 or feature-unavailable page
    const url = req.nextUrl.clone();
    url.pathname = '/not-found';
    url.searchParams.set('reason', 'feature-disabled');
    return NextResponse.redirect(url);
  }
  
  // Add feature flags to response headers for client-side access
  const response = NextResponse.next();
  response.headers.set('x-feature-flags', JSON.stringify(featureFlags));
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*', // Apply rate limiting to all API routes
    '/dashboard/:path*',
    '/admin/:path*',
    '/leaderboard/:path*',
    '/beats/:path*',
    '/verify-info/:path*',
    '/test/:path*',
    '/offline/:path*',
    '/saved/:path*',
  ],
}
