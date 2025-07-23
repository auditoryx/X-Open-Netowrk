import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, orderBy, limit, startAfter, getDocs, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// In-memory cache for search results
interface CacheEntry {
  data: any[];
  timestamp: number;
  expiresAt: number;
}

const searchCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000;

// Rate limiting
const windowMs = 60_000; // 1 minute
const maxRequests = 100; // More generous for search
const rateLimitBuckets: Map<string, { count: number; ts: number }> = new Map();

// Search schema validation
const searchParamsSchema = z.object({
  q: z.string().min(1).max(100).optional(), // Search query
  role: z.enum(['artist', 'engineer', 'producer', 'studio', 'videographer']).optional(),
  location: z.string().max(100).optional(),
  service: z.string().max(50).optional(),
  genres: z.string().max(200).optional(), // Comma-separated
  verified: z.enum(['true', 'false']).optional(),
  available: z.enum(['true', 'false']).optional(),
  minPrice: z.string().regex(/^\d+$/).optional(),
  maxPrice: z.string().regex(/^\d+$/).optional(),
  sort: z.enum(['relevance', SCHEMA_FIELDS.REVIEW.RATING, 'price_low', 'price_high', 'distance', 'newest']).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  cursor: z.string().optional(),
  lat: z.string().regex(/^-?\d+\.?\d*$/).optional(),
  lng: z.string().regex(/^-?\d+\.?\d*$/).optional(),
  radius: z.string().regex(/^\d+$/).optional()
});

interface SearchFilters {
  role?: string;
  location?: string;
  service?: string;
  genres?: string[];
  verified?: boolean;
  available?: boolean;
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  radius?: number;
}

interface SearchOptions {
  sort: string;
  limit: number;
  cursor?: string;
}

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many search requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    // Parse and validate search parameters
    const { searchParams } = req.nextUrl;
    const rawParams = Object.fromEntries(searchParams.entries());
    
    const validatedParams = searchParamsSchema.safeParse(rawParams);
    if (!validatedParams.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validatedParams.error.format() },
        { status: 400 }
      );
    }

    const params = validatedParams.data;
    
    // Create cache key
    const cacheKey = createCacheKey(params);
    
    // Check cache first
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) {
      return NextResponse.json({
        results: cachedResult.data,
        cached: true,
        timestamp: cachedResult.timestamp
      });
    }

    // Parse filters and options
    const filters = parseFilters(params);
    const options = parseOptions(params);
    
    // Perform search
    const searchResults = await performSearch(params.q, filters, options);
    
    // Cache results
    setCache(cacheKey, searchResults);
    
    // Return results
    return NextResponse.json({
      results: searchResults,
      cached: false,
      timestamp: Date.now()
    });

  } catch (error) {
    logger.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Check if IP is rate limited
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitBuckets.get(ip) || { count: 0, ts: now };
  
  if (now - entry.ts > windowMs) {
    entry.count = 0;
    entry.ts = now;
  }
  
  entry.count++;
  rateLimitBuckets.set(ip, entry);
  
  return entry.count > maxRequests;
}

/**
 * Create cache key from search parameters
 */
function createCacheKey(params: any): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `search:${sortedParams}`;
}

/**
 * Get result from cache
 */
function getFromCache(key: string): CacheEntry | null {
  const entry = searchCache.get(key);
  
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    searchCache.delete(key);
    return null;
  }
  
  return entry;
}

/**
 * Set result in cache
 */
function setCache(key: string, data: any[]): void {
  // Clean cache if it's getting too large
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = searchCache.keys().next().value;
    searchCache.delete(oldestKey);
  }
  
  searchCache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_DURATION
  });
}

/**
 * Parse search filters from parameters
 */
function parseFilters(params: any): SearchFilters {
  const filters: SearchFilters = {};
  
  if (params.role) filters.role = params.role;
  if (params.location) filters.location = params.location.toLowerCase();
  if (params.service) filters.service = params.service;
  if (params.genres) filters.genres = params.genres.split(',').filter(Boolean);
  if (params.verified) filters.verified = params.verified === 'true';
  if (params.available) filters.available = params.available === 'true';
  if (params.minPrice) filters.minPrice = parseInt(params.minPrice);
  if (params.maxPrice) filters.maxPrice = parseInt(params.maxPrice);
  if (params.lat) filters.lat = parseFloat(params.lat);
  if (params.lng) filters.lng = parseFloat(params.lng);
  if (params.radius) filters.radius = parseInt(params.radius);
  
  return filters;
}

/**
 * Parse search options from parameters
 */
function parseOptions(params: any): SearchOptions {
  return {
    sort: params.sort || 'relevance',
    limit: Math.min(parseInt(params.limit || '20'), 50), // Max 50 results
    cursor: params.cursor
  };
}

/**
 * Perform the actual search
 */
async function performSearch(searchQuery: string | undefined, filters: SearchFilters, options: SearchOptions): Promise<any[]> {
  const searchRef = collection(db, 'users');
  
  // Apply filters
  const constraints = [];
  
  // Role filter
  if (filters.role) {
    constraints.push(where(SCHEMA_FIELDS.USER.ROLE, '==', filters.role));
  }
  
  // Verification filter
  if (filters.verified) {
    constraints.push(where('verified', '==', true));
  }
  
  // Availability filter
  if (filters.available) {
    constraints.push(where('available', '==', true));
  }
  
  // Price range filters
  if (filters.minPrice !== undefined) {
    constraints.push(where('minPrice', '>=', filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    constraints.push(where('maxPrice', '<=', filters.maxPrice));
  }
  
  // Apply sorting
  if (options.sort === 'rating') {
    constraints.push(orderBy(SCHEMA_FIELDS.USER.AVERAGE_RATING, 'desc'));
  } else if (options.sort === 'price_low') {
    constraints.push(orderBy('minPrice', 'asc'));
  } else if (options.sort === 'price_high') {
    constraints.push(orderBy('minPrice', 'desc'));
  } else if (options.sort === 'newest') {
    constraints.push(orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'));
  } else {
    // Default sort by relevance (based on rating and activity)
    constraints.push(orderBy('lastActive', 'desc'));
  }
  
  // Add limit
  constraints.push(limit(options.limit));
  
  // Create query
  const searchQuery_ = query(searchRef, ...constraints);
  
  try {
    const snapshot = await getDocs(searchQuery_);
    let results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Apply additional filters that can't be done in Firestore query
    results = applyClientSideFilters(results, searchQuery, filters);
    
    // Calculate relevance scores
    results = calculateRelevanceScores(results, searchQuery, filters);
    
    // Apply final sorting if needed
    if (options.sort === 'relevance') {
      results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }
    
    return results;
    
  } catch (error) {
    logger.error('Firestore search error:', error);
    throw new Error('Search query failed');
  }
}

/**
 * Apply filters that can't be done efficiently in Firestore
 */
function applyClientSideFilters(results: any[], searchQuery: string | undefined, filters: SearchFilters): any[] {
  return results.filter(user => {
    // Text search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        user.displayName,
        user.bio,
        user.location,
        ...(user.services || []).map((s: any) => s.title + ' ' + s.description),
        ...(user.genres || [])
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }
    
    // Location filter (basic text matching)
    if (filters.location) {
      const userLocation = (user.location || '').toLowerCase();
      if (!userLocation.includes(filters.location)) {
        return false;
      }
    }
    
    // Service filter
    if (filters.service) {
      const hasService = (user.services || []).some((s: any) => 
        s.title.toLowerCase().includes(filters.service!.toLowerCase()) ||
        s.category.toLowerCase().includes(filters.service!.toLowerCase())
      );
      if (!hasService) {
        return false;
      }
    }
    
    // Genre filter
    if (filters.genres && filters.genres.length > 0) {
      const userGenres = user.genres || [];
      const hasMatchingGenre = filters.genres.some(genre => 
        userGenres.some((userGenre: string) => 
          userGenre.toLowerCase().includes(genre.toLowerCase())
        )
      );
      if (!hasMatchingGenre) {
        return false;
      }
    }
    
    // Geographic distance filter (basic implementation)
    if (filters.lat && filters.lng && filters.radius && user.coordinates) {
      const distance = calculateDistance(
        filters.lat, filters.lng,
        user.coordinates.lat, user.coordinates.lng
      );
      if (distance > filters.radius) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Calculate relevance scores for search results
 */
function calculateRelevanceScores(results: any[], searchQuery: string | undefined, filters: SearchFilters): any[] {
  return results.map(user => {
    let score = 0;
    
    // Base score from rating and review count
    score += (user.averageRating || 0) * 10;
    score += Math.min(user.reviewCount || 0, 50); // Cap at 50
    
    // Boost for verification
    if (user.verified) score += 20;
    
    // Boost for availability
    if (user.available) score += 15;
    
    // Boost for recent activity
    const daysSinceActive = user.lastActive 
      ? (Date.now() - user.lastActive.toMillis()) / (1000 * 60 * 60 * 24)
      : 30;
    score += Math.max(0, 30 - daysSinceActive);
    
    // Text relevance scoring
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      // Exact name match gets highest boost
      if (user.displayName?.toLowerCase().includes(query)) {
        score += 50;
      }
      
      // Bio relevance
      if (user.bio?.toLowerCase().includes(query)) {
        score += 25;
      }
      
      // Service relevance
      const serviceMatches = (user.services || []).filter((s: any) => 
        s.title.toLowerCase().includes(query) || 
        s.description.toLowerCase().includes(query)
      ).length;
      score += serviceMatches * 15;
      
      // Genre relevance
      const genreMatches = (user.genres || []).filter((g: string) => 
        g.toLowerCase().includes(query)
      ).length;
      score += genreMatches * 10;
    }
    
    return {
      ...user,
      relevanceScore: score
    };
  });
}

/**
 * Calculate distance between two coordinates in kilometers
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}