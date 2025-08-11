const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Redis client for rate limiting
let redisClient;
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL);
    console.log('✅ Connected to Redis for rate limiting');
  } catch (error) {
    console.warn('⚠️ Failed to connect to Redis for rate limiting:', error.message);
  }
}

// Rate limit configurations
const createRateLimiter = (options) => {
  const config = {
    windowMs: options.windowMs || 60 * 1000, // Default 1 minute
    max: options.max || 100, // Default 100 requests
    message: {
      error: options.message || 'Too many requests, please try again later.',
      retryAfter: Math.ceil(options.windowMs / 1000)
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || ((req) => {
      // Use IP address by default
      return req.ip || req.connection.remoteAddress || 'unknown';
    }),
    skip: (req) => {
      // Skip rate limiting for whitelisted IPs
      const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
      const ip = req.ip || req.connection.remoteAddress;
      return whitelist.includes(ip);
    },
    onLimitReached: (req, res, options) => {
      console.warn('Rate limit exceeded:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        limit: options.max,
        windowMs: options.windowMs
      });
    }
  };

  // Use Redis store if available
  if (redisClient) {
    config.store = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: 'rl:backend:'
    });
  }

  return rateLimit(config);
};

// Authentication endpoints rate limiter
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many authentication attempts, please try again later.'
});

// General API rate limiter
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: (req) => {
    // Try to use user ID for authenticated requests
    if (req.user && req.user.id) {
      return `user:${req.user.id}`;
    }
    // Fall back to IP
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

// Strict rate limiter for sensitive operations
const strictLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests for this operation, please try again later.'
});

// DDoS protection middleware
const ddosProtection = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress;
  
  // Check for suspicious user agents
  const suspiciousPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 
    'python-requests', 'curl/', 'wget/'
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  );
  
  if (isSuspicious) {
    console.warn('Suspicious user agent detected:', {
      ip,
      userAgent,
      endpoint: req.originalUrl
    });
    
    // Apply stricter rate limiting for suspicious requests
    return strictLimiter(req, res, next);
  }
  
  next();
};

// IP blacklist middleware
const ipBlacklist = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const blacklist = process.env.RATE_LIMIT_BLACKLIST?.split(',') || [];
  
  if (blacklist.includes(ip)) {
    console.warn('Blacklisted IP blocked:', { ip, endpoint: req.originalUrl });
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};

module.exports = {
  authLimiter,
  apiLimiter,
  strictLimiter,
  ddosProtection,
  ipBlacklist,
  createRateLimiter
};