import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client (using Upstash Redis for serverless)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// In-memory cache fallback when Redis is not available
const memoryCache = new Map<string, { data: any; expiry: number; tags: string[] }>();

interface CacheRequest {
  key: string;
  data?: any;
  ttl?: number;
  tags?: string[];
}

/**
 * GET - Retrieve data from cache
 */
export async function POST(request: NextRequest) {
  try {
    const { key }: { key: string } = await request.json();
    
    if (!key) {
      return NextResponse.json(
        { error: 'Cache key is required' },
        { status: 400 }
      );
    }

    const cacheKey = `auditoryx:cache:${key}`;
    let result = null;

    // Try Redis first
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          result = typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
      } catch (error) {
        console.warn('Redis get failed, falling back to memory cache:', error);
      }
    }

    // Fallback to memory cache
    if (!result) {
      const memoryCached = memoryCache.get(cacheKey);
      if (memoryCached && Date.now() < memoryCached.expiry) {
        result = memoryCached.data;
      } else if (memoryCached) {
        // Expired entry, remove it
        memoryCache.delete(cacheKey);
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      cached: !!result,
      source: result ? (redis ? 'redis' : 'memory') : 'miss'
    });

  } catch (error) {
    console.error('Cache get error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve from cache' },
      { status: 500 }
    );
  }
}
