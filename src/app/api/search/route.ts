import { NextRequest, NextResponse } from 'next/server';
import { getSearchService, SearchFilters } from '@/lib/search';
import { getAuthContext } from '@/lib/unified-models/auth';

/**
 * Enhanced Search API
 * 
 * Provides real search functionality using Algolia
 * Replaces the previous mock implementation
 */

// Rate limiting
const windowMs = 60_000; // 1 minute
const maxRequests = 30;
const buckets: Map<string, { count: number; ts: number }> =
  (globalThis as any).__searchLimiter ||
  ((globalThis as any).__searchLimiter = new Map());

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = buckets.get(ip) || { count: 0, ts: now };
  if (now - entry.ts > windowMs) {
    entry.count = 0;
    entry.ts = now;
  }
  entry.count++;
  buckets.set(ip, entry);
  return entry.count > maxRequests;
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        { status: 429 }
      );
    }

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get(SCHEMA_FIELDS.NOTIFICATION.TYPE) || 'users'; // 'users' or 'services'
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filters from query parameters
    const filters: SearchFilters = {};
    
    if (searchParams.get(SCHEMA_FIELDS.USER.ROLE)) {
      filters.role = searchParams.get(SCHEMA_FIELDS.USER.ROLE)!;
    }
    
    if (searchParams.get(SCHEMA_FIELDS.USER.TIER)) {
      filters.tier = searchParams.get(SCHEMA_FIELDS.USER.TIER)!;
    }
    
    if (searchParams.get('verificationStatus')) {
      filters.verificationStatus = searchParams.get('verificationStatus')!;
    }
    
    if (searchParams.get('location')) {
      filters.location = searchParams.get('location')!;
    }
    
    if (searchParams.get('genres')) {
      filters.genres = searchParams.get('genres')!.split(',').filter(Boolean);
    }
    
    if (searchParams.get('minRating')) {
      filters.minRating = parseFloat(searchParams.get('minRating')!);
    }
    
    if (searchParams.get('minPrice')) {
      filters.minPrice = parseFloat(searchParams.get('minPrice')!);
    }
    
    if (searchParams.get('maxPrice')) {
      filters.maxPrice = parseFloat(searchParams.get('maxPrice')!);
    }
    
    if (searchParams.get('verifiedOnly') === 'true') {
      filters.verifiedOnly = true;
    }
    
    if (searchParams.get('availableNow') === 'true') {
      filters.availableNow = true;
    }

    // Geographic filters
    if (searchParams.get('lat') && searchParams.get('lng')) {
      filters.lat = parseFloat(searchParams.get('lat')!);
      filters.lng = parseFloat(searchParams.get('lng')!);
      
      if (searchParams.get('radiusKm')) {
        filters.radiusKm = parseInt(searchParams.get('radiusKm')!);
      }
    }

    // Search options
    const sortBy = searchParams.get('sort') as 'relevance' | 'rating' | 'price' | 'distance' | 'created_at' || 'relevance';
    
    const options = {
      hitsPerPage: Math.min(limit, 100), // Max 100 results per page
      page,
      sortBy,
    };

    // Get search service and perform search
    const searchService = getSearchService();
    
    let results;
    if (type === 'services') {
      results = await searchService.searchServices(query, filters, options);
    } else {
      results = await searchService.searchUsers(query, filters, options);
    }

    // Filter results based on user permissions
    const authContext = await getAuthContext(request);
    
    // For non-authenticated users, only return public data
    if (!authContext.isAuthenticated) {
      results.hits = results.hits.map(hit => ({
        objectID: hit.objectID,
        displayName: hit.displayName,
        role: hit.role,
        tier: hit.tier,
        verificationStatus: hit.verificationStatus,
        averageRating: hit.averageRating,
        reviewCount: hit.reviewCount,
        bio: hit.bio,
        location: hit.location,
        profilePicture: hit.profilePicture,
        _highlightResult: hit._highlightResult,
        _snippetResult: hit._snippetResult,
      }));
    }

    // Add metadata
    const response = {
      ...results,
      metadata: {
        query,
        type,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        authenticated: authContext.isAuthenticated,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Search API error:', error);
    
    return NextResponse.json(
      {
        error: 'Search service temporarily unavailable',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : error : undefined,
      },
      { status: 500 }
    );
  }
}
