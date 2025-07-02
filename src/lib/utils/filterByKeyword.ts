/**
 * Utility functions for filtering and searching creators by keywords
 */

export interface SearchableCreator {
  uid: string;
  displayName?: string;
  name?: string;
  bio?: string;
  photoURL?: string;
  location?: string;
  tier?: string;
  price?: number;
  averageRating?: number;
  reviewCount?: number;
  xp?: number;
  rankScore?: number;
  tierFrozen?: boolean;
  signature?: any;
  genres?: string[];
  tags?: string[];
  services?: SearchableService[];
}

export interface SearchableService {
  id: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  tags?: string[];
}

export interface SearchResult extends SearchableCreator {
  _searchScore?: number;
  _highlightedFields?: {
    displayName?: string;
    name?: string;
    bio?: string;
    location?: string;
    services?: Array<{
      title?: string;
      description?: string;
    }>;
  };
}

/**
 * Extract keywords from a search query
 */
export function extractKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,]+/)
    .map(term => term.trim())
    .filter(term => term.length >= 2);
}

/**
 * Calculate search score for a creator based on keyword matches
 */
export function calculateSearchScore(
  creator: SearchableCreator,
  keywords: string[]
): number {
  let score = 0;
  const lowerKeywords = keywords.map(k => k.toLowerCase());

  // Helper to check if any keyword matches a field
  const hasMatch = (text: string | undefined, multiplier: number = 1) => {
    if (!text) return 0;
    const lowerText = text.toLowerCase();
    let fieldScore = 0;
    
    for (const keyword of lowerKeywords) {
      if (lowerText.includes(keyword)) {
        // Exact word match gets higher score than partial match
        const isExactWord = new RegExp(`\\b${keyword}\\b`).test(lowerText);
        fieldScore += (isExactWord ? 2 : 1) * multiplier;
      }
    }
    return fieldScore;
  };

  // Name matches get highest priority
  score += hasMatch(creator.displayName, 10);
  score += hasMatch(creator.name, 10);

  // Bio and location get medium priority
  score += hasMatch(creator.bio, 5);
  score += hasMatch(creator.location, 3);

  // Genres and tags get medium priority
  if (creator.genres) {
    creator.genres.forEach(genre => {
      score += hasMatch(genre, 4);
    });
  }
  
  if (creator.tags) {
    creator.tags.forEach(tag => {
      score += hasMatch(tag, 4);
    });
  }

  // Service matches get lower priority but still important
  if (creator.services) {
    creator.services.forEach(service => {
      score += hasMatch(service.title, 3);
      score += hasMatch(service.description, 2);
      score += hasMatch(service.category, 2);
      
      if (service.tags) {
        service.tags.forEach(tag => {
          score += hasMatch(tag, 2);
        });
      }
    });
  }

  return score;
}

/**
 * Filter creators by keywords and return scored results
 */
export function filterCreatorsByKeywords(
  creators: SearchableCreator[],
  query: string,
  options: {
    minScore?: number;
    maxResults?: number;
  } = {}
): SearchResult[] {
  const { minScore = 1, maxResults = 50 } = options;
  
  if (!query.trim()) {
    return creators.map(c => ({ ...c, _searchScore: 0 }));
  }

  const keywords = extractKeywords(query);
  if (keywords.length === 0) {
    return creators.map(c => ({ ...c, _searchScore: 0 }));
  }

  const results: SearchResult[] = [];

  for (const creator of creators) {
    const score = calculateSearchScore(creator, keywords);
    
    if (score >= minScore) {
      results.push({
        ...creator,
        _searchScore: score
      });
    }
  }

  // Sort by score (descending), then by rating, then by review count
  results.sort((a, b) => {
    if (a._searchScore !== b._searchScore) {
      return (b._searchScore || 0) - (a._searchScore || 0);
    }
    if (a.averageRating !== b.averageRating) {
      return (b.averageRating || 0) - (a.averageRating || 0);
    }
    return (b.reviewCount || 0) - (a.reviewCount || 0);
  });

  return results.slice(0, maxResults);
}

/**
 * Highlight matched terms in text
 */
export function highlightMatches(
  text: string,
  keywords: string[],
  highlightClass: string = 'bg-yellow-200 text-black'
): string {
  if (!text || keywords.length === 0) return text;

  let result = text;
  
  // Sort keywords by length (longest first) to avoid partial replacements
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
  
  for (const keyword of sortedKeywords) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    result = result.replace(regex, `<span class="${highlightClass}">$1</span>`);
  }
  
  return result;
}

/**
 * Create highlighted version of a creator with matched terms highlighted
 */
export function createHighlightedCreator(
  creator: SearchableCreator,
  keywords: string[]
): SearchResult {
  if (keywords.length === 0) return creator;

  const highlighted: SearchResult['_highlightedFields'] = {};

  if (creator.displayName) {
    highlighted.displayName = highlightMatches(creator.displayName, keywords);
  }
  
  if (creator.name) {
    highlighted.name = highlightMatches(creator.name, keywords);
  }
  
  if (creator.bio) {
    highlighted.bio = highlightMatches(creator.bio, keywords);
  }
  
  if (creator.location) {
    highlighted.location = highlightMatches(creator.location, keywords);
  }

  if (creator.services) {
    highlighted.services = creator.services.map(service => ({
      title: service.title ? highlightMatches(service.title, keywords) : undefined,
      description: service.description ? highlightMatches(service.description, keywords) : undefined
    }));
  }

  return {
    ...creator,
    _highlightedFields: highlighted
  };
}
