import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// In-memory cache fallback
const memoryCache = new Map<string, { data: any; expiry: number; tags: string[] }>();

interface CacheSetRequest {
  key: string;
  data: any;
  ttl?: number;
  tags?: string[];
}

/**
 * POST - Store data in cache
 */
export async function POST(request: NextRequest) {
  try {
    const { key, data, ttl = 300, tags = [] }: CacheSetRequest = await request.json();
    
    if (!key || data === undefined) {
      return NextResponse.json(
        { error: 'Cache key and data are required' },
        { status: 400 }
      );
    }

    const cacheKey = `auditoryx:cache:${key}`;
    const expiry = Date.now() + (ttl * 1000);
    
    let redisSuccess = false;
    let memorySuccess = false;

    // Store in Redis
    if (redis) {
      try {
        const cacheData = {
          data,
          tags,
          timestamp: Date.now(),
          ttl
        };

        await redis.setex(cacheKey, ttl, JSON.stringify(cacheData));
        
        // Also store tags for invalidation
        if (tags.length > 0) {
          for (const tag of tags) {
            const tagKey = `auditoryx:tag:${tag}`;
            await redis.sadd(tagKey, cacheKey);
            await redis.expire(tagKey, ttl + 60); // Tag TTL slightly longer
          }
        }
        
        redisSuccess = true;
      } catch (error) {
        console.warn('Redis set failed, using memory cache:', error);
      }
    }

    // Store in memory cache as fallback
    memoryCache.set(cacheKey, {
      data,
      expiry,
      tags
    });
    memorySuccess = true;

    // Cleanup expired entries periodically
    if (Math.random() < 0.1) { // 10% chance
      cleanupExpiredMemoryCache();
    }

    return NextResponse.json({
      success: true,
      key: cacheKey,
      ttl,
      tags,
      stored: {
        redis: redisSuccess,
        memory: memorySuccess
      }
    });

  } catch (error) {
    console.error('Cache set error:', error);
    return NextResponse.json(
      { error: 'Failed to store in cache' },
      { status: 500 }
    );
  }
}

/**
 * Cleanup expired entries from memory cache
 */
function cleanupExpiredMemoryCache(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [key, entry] of memoryCache.entries()) {
    if (now >= entry.expiry) {
      expiredKeys.push(key);
    }
  }

  expiredKeys.forEach(key => memoryCache.delete(key));
  
  if (expiredKeys.length > 0) {
    console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
  }
}
