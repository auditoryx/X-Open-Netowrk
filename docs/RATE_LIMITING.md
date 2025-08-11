# Rate Limiting & DDoS Protection Documentation

This document describes the comprehensive rate limiting and DDoS protection system implemented for the X-Open-Network platform.

## Overview

The rate limiting system provides multi-layered protection against abuse and DDoS attacks:

- **Pattern-based rate limiting** for different endpoint types
- **IP-based and user-based rate limiting**
- **DDoS protection with traffic analysis**
- **Redis-based distributed rate limiting** with memory fallback
- **Security event logging and alerting**
- **Admin dashboard for monitoring**

## Rate Limit Configuration

### Default Limits

| Endpoint Type | Requests/Minute | Basis | Example Endpoints |
|---------------|-----------------|-------|-------------------|
| Authentication | 5 | IP Address | `/api/auth/*` |
| API Endpoints | 100 | User ID | `/api/users/*`, `/api/bookings/*` |
| Public Endpoints | 20 | IP Address | `/api/explore/*` |
| Admin Endpoints | 50 | User ID | `/api/admin/*` |

### Environment Variables

Configure rate limits via environment variables:

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379

# IP Whitelist/Blacklist (comma-separated)
RATE_LIMIT_WHITELIST=127.0.0.1,::1,192.168.1.0/24
RATE_LIMIT_BLACKLIST=192.168.100.50

# Security Webhooks
SECURITY_WEBHOOK_URL=https://hooks.slack.com/webhook-url

# Rate Limit Configuration
RATE_LIMIT_AUTH_REQUESTS=5
RATE_LIMIT_AUTH_WINDOW=60000
RATE_LIMIT_API_REQUESTS=100
RATE_LIMIT_API_WINDOW=60000
RATE_LIMIT_PUBLIC_REQUESTS=20
RATE_LIMIT_PUBLIC_WINDOW=60000
RATE_LIMIT_ADMIN_REQUESTS=50
RATE_LIMIT_ADMIN_WINDOW=60000
```

## Architecture

### Components

1. **Next.js Middleware** (`middleware.ts`)
   - Applies rate limiting to all API routes
   - Integrates DDoS protection
   - Handles feature flags

2. **Rate Limiting Middleware** (`src/middleware/rateLimiting.ts`)
   - Pattern-based rate limit selection
   - Redis/memory store management
   - IP whitelist/blacklist functionality

3. **DDoS Protection** (`src/lib/security/ddosProtection.ts`)
   - Traffic pattern analysis
   - Suspicious user agent detection
   - Security event logging

4. **Express Backend** (`backend/middleware/rateLimiting.js`)
   - Backend API protection
   - Separate rate limiting for Node.js server

### Data Flow

```
Request → Next.js Middleware → DDoS Analysis → Rate Limiting → API Route
                          ↓
                    Security Logging → Monitoring Dashboard
```

## DDoS Protection Features

### Traffic Analysis

The system analyzes incoming requests for suspicious patterns:

- **Rapid requests**: > 10 requests/second from single IP
- **Burst traffic**: > 100 requests in 10 seconds
- **Suspicious user agents**: Bots, crawlers, automated tools
- **Request patterns**: Identical requests repeated > 20 times

### Actions

Based on confidence score:
- **< 0.3**: Allow (normal traffic)
- **0.3 - 0.7**: Throttle (apply stricter rate limits)
- **> 0.7**: Block (reject requests)

### Security Events

All suspicious activity is logged with severity levels:
- **Low**: Minor anomalies
- **Medium**: Rate limit exceeded, suspicious patterns
- **High**: Potential attacks
- **Critical**: Active DDoS attempts

## API Endpoints

### Monitoring API

Access monitoring data via `/api/monitoring`:

```bash
# Health check
GET /api/monitoring?action=health

# Traffic metrics
GET /api/monitoring?action=metrics

# Security events
GET /api/monitoring?action=events&limit=100
```

### Test Endpoint

Test rate limiting with `/api/test-rate-limit`:

```bash
# Basic test
GET /api/test-rate-limit

# With delay simulation
GET /api/test-rate-limit?delay=1000
```

## Response Headers

Rate-limited responses include headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1640995200000
Retry-After: 60
```

## Error Responses

### Rate Limit Exceeded (429)

```json
{
  "error": "Too many requests, please try again later.",
  "retryAfter": 60
}
```

### DDoS Protection Blocked (429)

```json
{
  "error": "Request blocked due to suspicious activity",
  "retryAfter": 300
}
```

### Blacklisted IP (403)

```json
{
  "error": "Access denied"
}
```

## Admin Dashboard

Access the rate limiting dashboard at `/admin/security` (admin role required):

### Features

- **Real-time metrics**: Requests, unique IPs, suspicious activity
- **Security events**: Recent attacks and anomalies
- **System status**: Rate limiting and DDoS protection status
- **Configuration display**: Current rate limit settings

### Metrics

- **Total Requests**: Last hour
- **Unique IPs**: Active IP addresses
- **Suspicious Activity**: Detected anomalies
- **Blocked Requests**: Rejected requests

## Testing

### Manual Testing

Use the provided test script:

```bash
# Run rate limiting tests
node scripts/test-rate-limiting.js

# Test against different base URL
TEST_BASE_URL=https://your-domain.com node scripts/test-rate-limiting.js
```

### Unit Tests

```bash
# Run rate limiting tests
npm test -- __tests__/rateLimitingSimple.test.ts
```

## Production Deployment

### Redis Setup

1. **Standalone Redis**:
   ```bash
   # Install Redis
   sudo apt install redis-server
   
   # Configure connection
   REDIS_URL=redis://localhost:6379
   ```

2. **Redis Cloud/Cluster**:
   ```bash
   # Use connection string
   REDIS_URL=redis://username:password@host:port
   ```

### Security Configuration

1. **IP Whitelisting**:
   ```bash
   # Whitelist trusted IPs
   RATE_LIMIT_WHITELIST=192.168.1.0/24,10.0.0.0/8
   ```

2. **Blacklisting**:
   ```bash
   # Block known bad actors
   RATE_LIMIT_BLACKLIST=192.168.100.50,203.0.113.0/24
   ```

3. **Alerting**:
   ```bash
   # Configure webhook for alerts
   SECURITY_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

### Performance Considerations

- **Memory Usage**: In-memory fallback stores up to 1000 events
- **Redis Performance**: Use Redis for distributed deployments
- **Cleanup**: Memory stores auto-cleanup every hour
- **Logging**: Security events logged to console (configure external logging)

## Monitoring & Alerting

### Metrics to Monitor

- Rate limit hit rate
- Security event frequency
- Response time impact
- Memory usage (fallback store)

### Alert Thresholds

- **High**: > 10 security events/minute
- **Critical**: > 5 DDoS attempts/minute
- **System**: Redis connectivity issues

### Log Analysis

Security events include:
- Timestamp
- Event type
- Source IP
- User agent
- Severity level
- Detailed context

## Troubleshooting

### Common Issues

1. **Rate limits too strict**:
   - Adjust environment variables
   - Check whitelist configuration
   - Review endpoint patterns

2. **Redis connection issues**:
   - Verify REDIS_URL configuration
   - Check network connectivity
   - Monitor Redis performance

3. **False positives**:
   - Whitelist legitimate IPs
   - Adjust DDoS thresholds
   - Review user agent patterns

### Debug Mode

Enable debug logging:

```bash
# Set log level
LOG_LEVEL=debug

# Monitor security events
tail -f logs/security.log
```

## Security Best Practices

1. **Regular Updates**: Keep rate limit configurations updated
2. **Monitoring**: Set up proper alerting for security events
3. **Backup**: Use Redis persistence for rate limit data
4. **Testing**: Regularly test rate limiting effectiveness
5. **Documentation**: Keep IP whitelist/blacklist documented

## API Integration

### Client-Side Handling

```javascript
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, options);
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
    }
    
    return response.json();
  } catch (error) {
    // Handle rate limiting errors
    console.warn('API call failed:', error.message);
    throw error;
  }
}
```

### Graceful Degradation

```javascript
// Implement exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('Rate limited') && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

## Further Reading

- [Express Rate Limiting](https://github.com/express-rate-limit/express-rate-limit)
- [Redis Rate Limiting Patterns](https://redis.io/commands/incr#pattern-rate-limiter)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [DDoS Protection Strategies](https://en.wikipedia.org/wiki/DDoS_mitigation)