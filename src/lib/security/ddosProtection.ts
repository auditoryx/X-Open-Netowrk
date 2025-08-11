import { NextRequest } from 'next/server';
import Redis from 'ioredis';

// DDoS Protection Configuration
interface DDoSConfig {
  // Suspicious activity thresholds
  rapidRequestThreshold: number; // Requests per second to trigger alert
  rapidRequestWindow: number; // Time window in seconds
  
  // Burst protection
  burstThreshold: number; // Maximum requests in burst window
  burstWindow: number; // Burst window in seconds
  
  // User agent analysis
  suspiciousUserAgents: string[];
  
  // Geographic analysis
  enableGeoBlocking: boolean;
  blockedCountries?: string[];
  
  // Request pattern analysis
  enablePatternAnalysis: boolean;
  maxIdenticalRequests: number; // Max identical requests in time window
}

const DEFAULT_DDOS_CONFIG: DDoSConfig = {
  rapidRequestThreshold: 10, // 10 requests per second
  rapidRequestWindow: 1,
  burstThreshold: 100, // 100 requests in 10 seconds
  burstWindow: 10,
  suspiciousUserAgents: [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'python-requests',
    'curl/',
    'wget/',
  ],
  enableGeoBlocking: false,
  blockedCountries: [],
  enablePatternAnalysis: true,
  maxIdenticalRequests: 20,
};

// Redis client for DDoS tracking
let ddosRedisClient: Redis | null = null;

function getDDoSRedisClient(): Redis | null {
  if (!ddosRedisClient && process.env.REDIS_URL) {
    try {
      ddosRedisClient = new Redis(process.env.REDIS_URL);
    } catch (error) {
      console.warn('Failed to connect to Redis for DDoS protection:', error);
    }
  }
  return ddosRedisClient;
}

// In-memory fallback for DDoS tracking
const ddosMemoryStore = new Map<string, any>();

// Request fingerprinting for pattern analysis
function generateRequestFingerprint(req: NextRequest): string {
  const url = req.nextUrl.pathname + req.nextUrl.search;
  const method = req.method;
  const userAgent = req.headers.get('user-agent') || '';
  const contentType = req.headers.get('content-type') || '';
  
  return `${method}:${url}:${userAgent.slice(0, 50)}:${contentType}`;
}

// Get client IP with proper forwarded header handling
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return req.ip || 'unknown';
}

// Analyze user agent for suspicious patterns
function analyzeUserAgent(userAgent: string): { suspicious: boolean; reason?: string } {
  if (!userAgent) {
    return { suspicious: true, reason: 'Missing user agent' };
  }
  
  const ua = userAgent.toLowerCase();
  
  // Check against known suspicious patterns
  for (const pattern of DEFAULT_DDOS_CONFIG.suspiciousUserAgents) {
    if (ua.includes(pattern)) {
      return { suspicious: true, reason: `Suspicious user agent: ${pattern}` };
    }
  }
  
  // Check for very short or very long user agents
  if (userAgent.length < 10 || userAgent.length > 500) {
    return { suspicious: true, reason: 'Unusual user agent length' };
  }
  
  return { suspicious: false };
}

// Traffic pattern analysis
interface TrafficAnalysis {
  isAttack: boolean;
  confidence: number; // 0-1 confidence score
  reasons: string[];
  action: 'allow' | 'throttle' | 'block';
}

export async function analyzeTrafficPattern(req: NextRequest): Promise<TrafficAnalysis> {
  const ip = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || '';
  const fingerprint = generateRequestFingerprint(req);
  const now = Date.now();
  
  const analysis: TrafficAnalysis = {
    isAttack: false,
    confidence: 0,
    reasons: [],
    action: 'allow'
  };
  
  try {
    const redis = getDDoSRedisClient();
    
    // 1. Rapid request analysis
    const rapidKey = `ddos:rapid:${ip}`;
    let rapidCount = 0;
    
    if (redis) {
      await redis.zadd(rapidKey, now, now);
      await redis.zremrangebyscore(rapidKey, 0, now - (DEFAULT_DDOS_CONFIG.rapidRequestWindow * 1000));
      rapidCount = await redis.zcard(rapidKey);
      await redis.expire(rapidKey, DEFAULT_DDOS_CONFIG.rapidRequestWindow);
    } else {
      // Memory fallback
      const stored = ddosMemoryStore.get(rapidKey) || [];
      const filtered = stored.filter((timestamp: number) => timestamp > now - (DEFAULT_DDOS_CONFIG.rapidRequestWindow * 1000));
      filtered.push(now);
      ddosMemoryStore.set(rapidKey, filtered);
      rapidCount = filtered.length;
    }
    
    if (rapidCount > DEFAULT_DDOS_CONFIG.rapidRequestThreshold) {
      analysis.isAttack = true;
      analysis.confidence += 0.4;
      analysis.reasons.push(`Rapid requests: ${rapidCount}/sec`);
      analysis.action = 'block';
    }
    
    // 2. Burst analysis
    const burstKey = `ddos:burst:${ip}`;
    let burstCount = 0;
    
    if (redis) {
      await redis.zadd(burstKey, now, now);
      await redis.zremrangebyscore(burstKey, 0, now - (DEFAULT_DDOS_CONFIG.burstWindow * 1000));
      burstCount = await redis.zcard(burstKey);
      await redis.expire(burstKey, DEFAULT_DDOS_CONFIG.burstWindow);
    } else {
      // Memory fallback
      const stored = ddosMemoryStore.get(burstKey) || [];
      const filtered = stored.filter((timestamp: number) => timestamp > now - (DEFAULT_DDOS_CONFIG.burstWindow * 1000));
      filtered.push(now);
      ddosMemoryStore.set(burstKey, filtered);
      burstCount = filtered.length;
    }
    
    if (burstCount > DEFAULT_DDOS_CONFIG.burstThreshold) {
      analysis.isAttack = true;
      analysis.confidence += 0.3;
      analysis.reasons.push(`Burst traffic: ${burstCount} requests in ${DEFAULT_DDOS_CONFIG.burstWindow}s`);
      if (analysis.action === 'allow') analysis.action = 'throttle';
    }
    
    // 3. User agent analysis
    const uaAnalysis = analyzeUserAgent(userAgent);
    if (uaAnalysis.suspicious) {
      analysis.confidence += 0.2;
      analysis.reasons.push(uaAnalysis.reason!);
      if (analysis.action === 'allow') analysis.action = 'throttle';
    }
    
    // 4. Request pattern analysis
    if (DEFAULT_DDOS_CONFIG.enablePatternAnalysis) {
      const patternKey = `ddos:pattern:${ip}:${fingerprint}`;
      let patternCount = 0;
      
      if (redis) {
        await redis.incr(patternKey);
        patternCount = await redis.get(patternKey).then(val => parseInt(val || '0'));
        await redis.expire(patternKey, 300); // 5 minute window
      } else {
        const stored = ddosMemoryStore.get(patternKey) || 0;
        patternCount = stored + 1;
        ddosMemoryStore.set(patternKey, patternCount);
      }
      
      if (patternCount > DEFAULT_DDOS_CONFIG.maxIdenticalRequests) {
        analysis.isAttack = true;
        analysis.confidence += 0.1;
        analysis.reasons.push(`Identical request pattern: ${patternCount} times`);
        if (analysis.action === 'allow') analysis.action = 'throttle';
      }
    }
    
    // 5. Final decision based on confidence
    if (analysis.confidence >= 0.7) {
      analysis.isAttack = true;
      analysis.action = 'block';
    } else if (analysis.confidence >= 0.3) {
      analysis.action = 'throttle';
    }
    
  } catch (error) {
    console.error('DDoS analysis error:', error);
    // In case of error, allow the request but log the incident
  }
  
  return analysis;
}

// Security event logging
interface SecurityEvent {
  type: 'ddos_attempt' | 'rate_limit_exceeded' | 'suspicious_activity';
  ip: string;
  userAgent: string;
  timestamp: number;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const securityEvents: SecurityEvent[] = [];

export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: Date.now()
  };
  
  securityEvents.push(fullEvent);
  
  // Keep only last 1000 events in memory
  if (securityEvents.length > 1000) {
    securityEvents.shift();
  }
  
  // Log to console (in production, send to monitoring service)
  console.warn('Security Event:', {
    type: event.type,
    ip: event.ip,
    severity: event.severity,
    details: event.details
  });
  
  // Send alerts for high severity events
  if (event.severity === 'high' || event.severity === 'critical') {
    sendSecurityAlert(fullEvent);
  }
}

export function getRecentSecurityEvents(limit = 100): SecurityEvent[] {
  return securityEvents.slice(-limit);
}

// Security alerting (placeholder - implement with your alerting system)
async function sendSecurityAlert(event: SecurityEvent): Promise<void> {
  // In production, integrate with your alerting system (Slack, email, PagerDuty, etc.)
  console.error('SECURITY ALERT:', {
    type: event.type,
    ip: event.ip,
    severity: event.severity,
    timestamp: new Date(event.timestamp).toISOString(),
    details: event.details
  });
  
  // Example: Send to monitoring endpoint
  if (process.env.SECURITY_WEBHOOK_URL) {
    try {
      await fetch(process.env.SECURITY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }
}

// Monitoring for unusual traffic patterns
export function getTrafficMetrics(): {
  totalRequests: number;
  uniqueIPs: number;
  suspiciousActivity: number;
  blockedRequests: number;
} {
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  
  const recentEvents = securityEvents.filter(event => event.timestamp > hourAgo);
  const uniqueIPs = new Set(recentEvents.map(event => event.ip)).size;
  
  return {
    totalRequests: recentEvents.length,
    uniqueIPs,
    suspiciousActivity: recentEvents.filter(event => 
      event.type === 'suspicious_activity' || event.type === 'ddos_attempt'
    ).length,
    blockedRequests: recentEvents.filter(event => 
      event.severity === 'high' || event.severity === 'critical'
    ).length
  };
}

// Cleanup function for memory stores
export function cleanupDDoSMemoryStores(): void {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour
  
  for (const [key, value] of ddosMemoryStore.entries()) {
    if (Array.isArray(value)) {
      const filtered = value.filter((timestamp: number) => timestamp > now - maxAge);
      if (filtered.length === 0) {
        ddosMemoryStore.delete(key);
      } else {
        ddosMemoryStore.set(key, filtered);
      }
    }
  }
}