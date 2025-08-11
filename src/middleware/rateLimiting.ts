import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
  message?: string;
}

// Rate limit types for different endpoints with environment variable overrides
export const RATE_LIMIT_CONFIGS = {
  auth: {
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_AUTH_REQUESTS || '5'),
    message: 'Too many authentication attempts, please try again later.',
  },
  api: {
    windowMs: parseInt(process.env.RATE_LIMIT_API_WINDOW || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_API_REQUESTS || '100'),
    message: 'Too many API requests, please try again later.',
  },
  public: {
    windowMs: parseInt(process.env.RATE_LIMIT_PUBLIC_WINDOW || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_PUBLIC_REQUESTS || '20'),
    message: 'Too many requests, please try again later.',
  },
  admin: {
    windowMs: parseInt(process.env.RATE_LIMIT_ADMIN_WINDOW || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_ADMIN_REQUESTS || '50'),
    message: 'Too many admin requests, please try again later.',
  },
} as const;

// Redis client for distributed rate limiting
let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!redisClient && process.env.REDIS_URL) {
    try {
      redisClient = new Redis(process.env.REDIS_URL);
    } catch (error) {
      console.warn('Failed to connect to Redis for rate limiting:', error);
    }
  }
  return redisClient;
}

// In-memory store fallback when Redis is not available
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Default IP-based key generator
function defaultKeyGenerator(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
  return `rate_limit:${ip}`;
}

// User-based key generator for authenticated requests
export function userKeyGenerator(req: NextRequest): string {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split('Bearer ')[1];
  
  if (token) {
    try {
      // Extract user ID from token (simplified)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return `rate_limit:user:${payload.id || payload.uid}`;
    } catch {
      // Fall back to IP-based limiting
    }
  }
  
  return defaultKeyGenerator(req);
}

// IP whitelist/blacklist functionality
const IP_WHITELIST = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
const IP_BLACKLIST = process.env.RATE_LIMIT_BLACKLIST?.split(',') || [];

function isIPWhitelisted(ip: string): boolean {
  return IP_WHITELIST.some(whitelistIP => 
    ip === whitelistIP || (whitelistIP.includes('/') && isIPInCIDR(ip, whitelistIP))
  );
}

function isIPBlacklisted(ip: string): boolean {
  return IP_BLACKLIST.some(blacklistIP => 
    ip === blacklistIP || (blacklistIP.includes('/') && isIPInCIDR(ip, blacklistIP))
  );
}

function isIPInCIDR(ip: string, cidr: string): boolean {
  // Simplified CIDR matching - in production, use a proper IP library
  const [network, prefixLength] = cidr.split('/');
  if (!prefixLength) return ip === network;
  
  // For this implementation, just do exact match
  return ip === network;
}

// Rate limiting middleware
export function createRateLimit(config: RateLimitConfig) {
  return async function rateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
    const keyGenerator = config.keyGenerator || defaultKeyGenerator;
    const key = keyGenerator(req);
    
    // Extract IP for whitelist/blacklist check
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
    
    // Check blacklist first
    if (isIPBlacklisted(ip)) {
      return new NextResponse(
        JSON.stringify({ error: 'Access denied' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Skip rate limiting for whitelisted IPs
    if (isIPWhitelisted(ip)) {
      return null; // Continue to next middleware
    }
    
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    let currentCount = 0;
    let resetTime = now + config.windowMs;
    
    try {
      const redis = getRedisClient();
      
      if (redis) {
        // Use Redis for distributed rate limiting
        const pipe = redis.pipeline();
        pipe.zremrangebyscore(key, 0, windowStart); // Remove old entries
        pipe.zcard(key); // Count current entries
        pipe.zadd(key, now, now); // Add current request
        pipe.expire(key, Math.ceil(config.windowMs / 1000)); // Set expiration
        
        const results = await pipe.exec();
        currentCount = (results?.[1]?.[1] as number) || 0;
      } else {
        // Fallback to memory store
        const stored = memoryStore.get(key);
        
        if (!stored || stored.resetTime <= now) {
          currentCount = 1;
          memoryStore.set(key, { count: 1, resetTime });
        } else {
          currentCount = stored.count + 1;
          memoryStore.set(key, { count: currentCount, resetTime: stored.resetTime });
          resetTime = stored.resetTime;
        }
      }
      
      // Check if limit exceeded
      if (currentCount > config.maxRequests) {
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        
        return new NextResponse(
          JSON.stringify({ 
            error: config.message || 'Rate limit exceeded',
            retryAfter 
          }),
          { 
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': resetTime.toString(),
              'Retry-After': retryAfter.toString(),
            }
          }
        );
      }
      
      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', (config.maxRequests - currentCount).toString());
      response.headers.set('X-RateLimit-Reset', resetTime.toString());
      
      return response;
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      // In case of error, allow the request to proceed
      return null;
    }
  };
}

// Middleware factories for different endpoint types
export const authRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.auth);
export const apiRateLimit = createRateLimit({
  ...RATE_LIMIT_CONFIGS.api,
  keyGenerator: userKeyGenerator
});
export const publicRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.public);
export const adminRateLimit = createRateLimit({
  ...RATE_LIMIT_CONFIGS.admin,
  keyGenerator: userKeyGenerator
});

// Pattern-based rate limiting for different API routes
export function getPatternBasedRateLimit(pathname: string) {
  if (pathname.startsWith('/api/auth/')) {
    return authRateLimit;
  }
  if (pathname.startsWith('/api/admin/')) {
    return adminRateLimit;
  }
  if (pathname.startsWith('/api/')) {
    return apiRateLimit;
  }
  return publicRateLimit;
}