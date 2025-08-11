import { NextRequest, NextResponse } from 'next/server';
import { getSearchService } from '@/lib/search';

/**
 * Search Suggestions API
 * 
 * Provides autocomplete suggestions for search queries
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get(SCHEMA_FIELDS.NOTIFICATION.TYPE) as 'users' | 'services' || 'users';

    if (query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        query,
        type,
      });
    }

    const searchService = getSearchService();
    const suggestions = await searchService.getSuggestions(query, type);

    return NextResponse.json({
      suggestions,
      query,
      type,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    
    return NextResponse.json(
      {
        error: 'Suggestions service temporarily unavailable',
        suggestions: [],
        query: '',
        type: 'users',
      },
      { status: 500 }
    );
  }
}