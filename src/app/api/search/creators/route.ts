import { NextRequest, NextResponse } from 'next/server';
import { getSearchService, SearchFilters } from '@/lib/search';
import { getAuthContext } from '@/lib/unified-models/auth';
import { toPublicUser } from '@/lib/unified-models/user';

/**
 * Creators Search API
 * 
 * Dedicated endpoint for searching creators/users
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Creator-specific filters
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
    
    if (searchParams.get('verifiedOnly') === 'true') {
      filters.verifiedOnly = true;
    }
    
    if (searchParams.get('availableNow') === 'true') {
      filters.availableNow = true;
    }

    // Geographic search
    if (searchParams.get('lat') && searchParams.get('lng')) {
      filters.lat = parseFloat(searchParams.get('lat')!);
      filters.lng = parseFloat(searchParams.get('lng')!);
      
      if (searchParams.get('radius')) {
        filters.radiusKm = parseInt(searchParams.get('radius')!);
      }
    }

    const sortBy = searchParams.get('sort') as 'relevance' | 'rating' | 'distance' | 'created_at' || 'relevance';

    const options = {
      hitsPerPage: Math.min(limit, 50),
      page,
      sortBy,
    };

    const searchService = getSearchService();
    const results = await searchService.searchUsers(query, filters, options);

    // Filter results based on authentication
    const authContext = await getAuthContext(request);
    
    if (!authContext.isAuthenticated) {
      // Return only public data for unauthenticated users
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
        xp: hit.xp,
        _highlightResult: hit._highlightResult,
        _snippetResult: hit._snippetResult,
      }));
    } else if (!authContext.isAdmin) {
      // Remove sensitive data for non-admin users
      results.hits = results.hits.map(hit => {
        const { email, walletId, paymentMethodsSetup, ...publicData } = hit;
        return publicData;
      });
    }

    // Add creator-specific metadata and facets
    const response = {
      ...results,
      metadata: {
        type: 'creators',
        query,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        authenticated: authContext.isAuthenticated,
        timestamp: new Date().toISOString(),
      },
      facets: {
        roles: results.facets?.role || {},
        tiers: results.facets?.tier || {},
        verificationStatus: results.facets?.verificationStatus || {},
        locations: buildLocationFacets(results.hits),
        ratingRanges: buildRatingRanges(results.hits),
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Creators search error:', error);
    
    return NextResponse.json(
      {
        error: 'Creators search temporarily unavailable',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : error : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Build location facets from search results
 */
function buildLocationFacets(hits: any[]): Record<string, number> {
  const locations: Record<string, number> = {};
  
  hits.forEach(hit => {
    if (hit.location) {
      // Extract city from location string
      const city = hit.location.split(',')[0]?.trim();
      if (city) {
        locations[city] = (locations[city] || 0) + 1;
      }
    }
  });

  // Return top 10 locations
  return Object.entries(locations)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .reduce((acc, [location, count]) => {
      acc[location] = count;
      return acc;
    }, {} as Record<string, number>);
}

/**
 * Build rating range facets from search results
 */
function buildRatingRanges(hits: any[]): Record<string, number> {
  const ranges = {
    '4.5-plus': 0,
    '4.0-4.5': 0,
    '3.5-4.0': 0,
    '3.0-3.5': 0,
    'under-3.0': 0,
  };

  hits.forEach(hit => {
    const rating = hit.averageRating || 0;
    if (rating >= 4.5) ranges['4.5-plus']++;
    else if (rating >= 4.0) ranges['4.0-4.5']++;
    else if (rating >= 3.5) ranges['3.5-4.0']++;
    else if (rating >= 3.0) ranges['3.0-3.5']++;
    else if (rating > 0) ranges['under-3.0']++;
  });

  return ranges;
}