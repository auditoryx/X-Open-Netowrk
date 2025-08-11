import { NextRequest, NextResponse } from 'next/server';
import { getSearchService, SearchFilters } from '@/lib/search';
import { getAuthContext } from '@/lib/unified-models/auth';

/**
 * Services Search API
 * 
 * Dedicated endpoint for searching services
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Service-specific filters
    const filters: SearchFilters = {};
    
    if (searchParams.get('category')) {
      // Map to role for services (services are categorized by creator role)
      filters.role = searchParams.get('category')!;
    }
    
    if (searchParams.get('minPrice')) {
      filters.minPrice = parseFloat(searchParams.get('minPrice')!);
    }
    
    if (searchParams.get('maxPrice')) {
      filters.maxPrice = parseFloat(searchParams.get('maxPrice')!);
    }
    
    if (searchParams.get('minRating')) {
      filters.minRating = parseFloat(searchParams.get('minRating')!);
    }
    
    if (searchParams.get('location')) {
      filters.location = searchParams.get('location')!;
    }
    
    if (searchParams.get('tier')) {
      filters.tier = searchParams.get('tier')!;
    }

    // Geographic search
    if (searchParams.get('lat') && searchParams.get('lng')) {
      filters.lat = parseFloat(searchParams.get('lat')!);
      filters.lng = parseFloat(searchParams.get('lng')!);
      
      if (searchParams.get('radius')) {
        filters.radiusKm = parseInt(searchParams.get('radius')!);
      }
    }

    const sortBy = searchParams.get('sort') as 'relevance' | 'rating' | 'price' | 'created_at' || 'relevance';

    const options = {
      hitsPerPage: Math.min(limit, 50),
      page,
      sortBy,
    };

    const searchService = getSearchService();
    const results = await searchService.searchServices(query, filters, options);

    // Add service-specific metadata
    const response = {
      ...results,
      metadata: {
        type: 'services',
        query,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        timestamp: new Date().toISOString(),
      },
      facets: {
        categories: results.facets?.role || {},
        tiers: results.facets?.tier || {},
        priceRanges: buildPriceRanges(results.hits),
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Services search error:', error);
    
    return NextResponse.json(
      {
        error: 'Services search temporarily unavailable',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : error : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Build price range facets from search results
 */
function buildPriceRanges(hits: any[]): Record<string, number> {
  const ranges = {
    'under-50': 0,
    '50-100': 0,
    '100-250': 0,
    '250-500': 0,
    '500-plus': 0,
  };

  hits.forEach(hit => {
    const price = hit.price || 0;
    if (price < 50) ranges['under-50']++;
    else if (price < 100) ranges['50-100']++;
    else if (price < 250) ranges['100-250']++;
    else if (price < 500) ranges['250-500']++;
    else ranges['500-plus']++;
  });

  return ranges;
}