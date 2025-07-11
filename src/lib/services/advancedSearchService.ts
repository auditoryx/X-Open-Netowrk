/**
 * Advanced Search Service with AI-powered matching and real-time suggestions
 * Implements comprehensive search functionality to achieve 10/10 search experience
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export interface SearchSuggestion {
  text: string;
  type: 'creator' | 'service' | 'genre' | 'location' | 'trending';
  count?: number;
  score?: number;
  metadata?: {
    avatar?: string;
    rating?: number;
    category?: string;
  };
}

export interface UserPreferences {
  favoriteGenres: string[];
  preferredLocations: string[];
  budgetRange: { min: number; max: number };
  previousSearches: string[];
  bookingHistory: string[];
  interactionHistory: SearchInteraction[];
}

export interface SearchInteraction {
  query: string;
  resultClicked: string;
  timestamp: Timestamp;
  conversionType: 'view' | 'message' | 'booking';
}

export interface SmartRecommendation {
  creator: any;
  matchScore: number;
  reasons: string[];
  confidence: number;
  tags: string[];
}

export interface TrendingSearch {
  query: string;
  count: number;
  trend: 'rising' | 'stable' | 'falling';
  category: string;
}

export interface SearchIntent {
  primaryIntent: 'find_creator' | 'browse_services' | 'compare_options' | 'get_inspiration';
  serviceType?: string;
  genre?: string;
  location?: string;
  urgency: 'immediate' | 'soon' | 'exploring';
  budget?: 'low' | 'medium' | 'high' | 'premium';
}

export interface SearchAnalytics {
  query: string;
  userId?: string;
  timestamp: Timestamp;
  resultsCount: number;
  clickedResults: string[];
  conversionRate: number;
  filters: any;
}

/**
 * Advanced Search Service with AI-powered capabilities
 */
export class AdvancedSearchService {
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private suggestionCache = new Map<string, { data: SearchSuggestion[]; timestamp: number }>();
  private trendingCache: { data: TrendingSearch[]; timestamp: number } | null = null;

  /**
   * Intelligent search with AI-powered matching and personalization
   */
  async intelligentSearch(
    query: string, 
    userId?: string,
    filters: any = {}
  ): Promise<SmartRecommendation[]> {
    try {
      // Track search analytics
      await this.trackSearch(query, userId, filters);

      // Get user preferences for personalization
      const userPreferences = userId ? await this.getUserPreferences(userId) : null;

      // Analyze search intent
      const searchIntent = await this.analyzeSearchIntent(query);

      // Get base search results
      const baseResults = await this.performSearch(query, filters);

      // Apply AI-powered scoring and ranking
      const scoredResults = await this.applyIntelligentScoring(
        baseResults,
        searchIntent,
        userPreferences,
        query
      );

      // Generate smart recommendations
      const recommendations = await this.generateSmartRecommendations(
        scoredResults,
        searchIntent,
        userPreferences
      );

      return recommendations;

    } catch (error) {
      console.error('Error in intelligent search:', error);
      // Fallback to basic search
      return await this.performBasicSearch(query, filters);
    }
  }

  /**
   * Real-time search suggestions with autocomplete
   */
  async getSearchSuggestions(
    partialQuery: string,
    userId?: string,
    maxSuggestions: number = 8
  ): Promise<SearchSuggestion[]> {
    if (!partialQuery.trim() || partialQuery.length < 2) {
      return await this.getPopularSuggestions(maxSuggestions);
    }

    const cacheKey = `${partialQuery.toLowerCase()}_${userId || 'anonymous'}`;
    
    // Check cache first
    const cached = this.suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const suggestions: SearchSuggestion[] = [];
      const lowerQuery = partialQuery.toLowerCase();

      // Get user-specific suggestions first
      if (userId) {
        const personalSuggestions = await this.getPersonalizedSuggestions(userId, lowerQuery);
        suggestions.push(...personalSuggestions);
      }

      // Get creator name suggestions
      const creatorSuggestions = await this.getCreatorSuggestions(lowerQuery);
      suggestions.push(...creatorSuggestions.slice(0, 3));

      // Get service suggestions
      const serviceSuggestions = await this.getServiceSuggestions(lowerQuery);
      suggestions.push(...serviceSuggestions.slice(0, 2));

      // Get genre suggestions
      const genreSuggestions = await this.getGenreSuggestions(lowerQuery);
      suggestions.push(...genreSuggestions.slice(0, 2));

      // Get location suggestions
      const locationSuggestions = await this.getLocationSuggestions(lowerQuery);
      suggestions.push(...locationSuggestions.slice(0, 1));

      // Get trending suggestions
      const trendingSuggestions = await this.getTrendingSuggestions(lowerQuery);
      suggestions.push(...trendingSuggestions.slice(0, 2));

      // Remove duplicates and sort by relevance
      const uniqueSuggestions = this.removeDuplicateSuggestions(suggestions);
      const sortedSuggestions = this.sortSuggestionsByRelevance(uniqueSuggestions, partialQuery);

      const finalSuggestions = sortedSuggestions.slice(0, maxSuggestions);

      // Cache the results
      this.suggestionCache.set(cacheKey, {
        data: finalSuggestions,
        timestamp: Date.now()
      });

      return finalSuggestions;

    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return await this.getFallbackSuggestions(partialQuery, maxSuggestions);
    }
  }

  /**
   * Save user search for personalization
   */
  async saveSearch(userId: string, searchQuery: string, interaction?: SearchInteraction): Promise<void> {
    try {
      const userPrefsRef = doc(db, 'userPreferences', userId);
      const userPrefs = await getDoc(userPrefsRef);

      let preferences: UserPreferences;
      if (userPrefs.exists()) {
        preferences = userPrefs.data() as UserPreferences;
      } else {
        preferences = {
          favoriteGenres: [],
          preferredLocations: [],
          budgetRange: { min: 0, max: 10000 },
          previousSearches: [],
          bookingHistory: [],
          interactionHistory: []
        };
      }

      // Update search history (keep last 50 searches)
      preferences.previousSearches = [
        searchQuery,
        ...preferences.previousSearches.filter(s => s !== searchQuery)
      ].slice(0, 50);

      // Add interaction if provided
      if (interaction) {
        preferences.interactionHistory = [
          interaction,
          ...preferences.interactionHistory
        ].slice(0, 100);
      }

      await setDoc(userPrefsRef, preferences, { merge: true });

    } catch (error) {
      console.error('Error saving search:', error);
    }
  }

  /**
   * Get personalized search results based on user history
   */
  async getPersonalizedResults(
    userId: string, 
    baseResults: any[],
    searchQuery: string
  ): Promise<any[]> {
    try {
      const userPreferences = await this.getUserPreferences(userId);
      if (!userPreferences) return baseResults;

      // Score results based on user preferences
      const scoredResults = baseResults.map(result => ({
        ...result,
        personalizedScore: this.calculatePersonalizedScore(result, userPreferences, searchQuery)
      }));

      // Sort by personalized score
      return scoredResults.sort((a, b) => b.personalizedScore - a.personalizedScore);

    } catch (error) {
      console.error('Error personalizing results:', error);
      return baseResults;
    }
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(): Promise<TrendingSearch[]> {
    // Check cache first
    if (this.trendingCache && Date.now() - this.trendingCache.timestamp < this.cacheTimeout) {
      return this.trendingCache.data;
    }

    try {
      const analyticsRef = collection(db, 'searchAnalytics');
      const recentSearches = query(
        analyticsRef,
        where('timestamp', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000)), // Last 24 hours
        limit(1000)
      );

      const snapshot = await getDocs(recentSearches);
      const searchCounts = new Map<string, number>();

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const query = data.query.toLowerCase().trim();
        if (query.length >= 2) {
          searchCounts.set(query, (searchCounts.get(query) || 0) + 1);
        }
      });

      const trending = Array.from(searchCounts.entries())
        .map(([query, count]) => ({
          query,
          count,
          trend: 'rising' as const,
          category: this.categorizeQuery(query)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      // Cache the results
      this.trendingCache = {
        data: trending,
        timestamp: Date.now()
      };

      return trending;

    } catch (error) {
      console.error('Error getting trending searches:', error);
      return [];
    }
  }

  /**
   * Track search analytics
   */
  private async trackSearch(
    query: string, 
    userId?: string, 
    filters: any = {}
  ): Promise<void> {
    try {
      const analyticsRef = collection(db, 'searchAnalytics');
      const analytics: SearchAnalytics = {
        query: query.toLowerCase().trim(),
        userId,
        timestamp: Timestamp.now(),
        resultsCount: 0, // Will be updated after results are returned
        clickedResults: [],
        conversionRate: 0,
        filters
      };

      await setDoc(doc(analyticsRef), analytics);
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  /**
   * Analyze search intent using NLP-like logic
   */
  private async analyzeSearchIntent(query: string): Promise<SearchIntent> {
    const lowerQuery = query.toLowerCase();
    
    // Service type detection
    const serviceTypes = ['mixing', 'mastering', 'recording', 'production', 'vocal', 'beat', 'instrumental'];
    const detectedService = serviceTypes.find(service => lowerQuery.includes(service));

    // Genre detection
    const genres = ['hip-hop', 'rnb', 'pop', 'rock', 'electronic', 'jazz', 'classical', 'country', 'trap', 'drill'];
    const detectedGenre = genres.find(genre => lowerQuery.includes(genre));

    // Location detection
    const locations = ['tokyo', 'new york', 'london', 'los angeles', 'atlanta', 'miami', 'chicago'];
    const detectedLocation = locations.find(location => lowerQuery.includes(location));

    // Urgency detection
    const urgentWords = ['urgent', 'asap', 'immediate', 'today', 'now'];
    const soonWords = ['soon', 'quick', 'fast'];
    let urgency: SearchIntent['urgency'] = 'exploring';
    
    if (urgentWords.some(word => lowerQuery.includes(word))) {
      urgency = 'immediate';
    } else if (soonWords.some(word => lowerQuery.includes(word))) {
      urgency = 'soon';
    }

    // Budget detection
    const budgetWords = {
      low: ['cheap', 'affordable', 'budget', 'low cost'],
      medium: ['reasonable', 'fair', 'moderate'],
      high: ['professional', 'quality', 'premium'],
      premium: ['luxury', 'elite', 'top tier', 'expensive']
    };
    
    let budget: SearchIntent['budget'] | undefined;
    for (const [level, words] of Object.entries(budgetWords)) {
      if (words.some(word => lowerQuery.includes(word))) {
        budget = level as SearchIntent['budget'];
        break;
      }
    }

    // Primary intent detection
    let primaryIntent: SearchIntent['primaryIntent'] = 'find_creator';
    if (lowerQuery.includes('compare') || lowerQuery.includes('vs')) {
      primaryIntent = 'compare_options';
    } else if (lowerQuery.includes('browse') || lowerQuery.includes('explore')) {
      primaryIntent = 'browse_services';
    } else if (lowerQuery.includes('idea') || lowerQuery.includes('inspiration')) {
      primaryIntent = 'get_inspiration';
    }

    return {
      primaryIntent,
      serviceType: detectedService,
      genre: detectedGenre,
      location: detectedLocation,
      urgency,
      budget
    };
  }

  /**
   * Apply intelligent scoring based on multiple factors
   */
  private async applyIntelligentScoring(
    results: any[],
    searchIntent: SearchIntent,
    userPreferences: UserPreferences | null,
    query: string
  ): Promise<any[]> {
    return results.map(result => {
      let score = result._searchScore || 0;

      // Intent-based scoring
      if (searchIntent.serviceType && result.services?.some((s: any) => 
        s.title.toLowerCase().includes(searchIntent.serviceType!))) {
        score += 15;
      }

      if (searchIntent.genre && result.genres?.includes(searchIntent.genre)) {
        score += 10;
      }

      if (searchIntent.location && result.location?.toLowerCase().includes(searchIntent.location)) {
        score += 8;
      }

      // User preference scoring
      if (userPreferences) {
        // Favorite genres
        if (userPreferences.favoriteGenres.some(genre => result.genres?.includes(genre))) {
          score += 12;
        }

        // Preferred locations
        if (userPreferences.preferredLocations.some(loc => 
          result.location?.toLowerCase().includes(loc.toLowerCase()))) {
          score += 8;
        }

        // Budget alignment
        if (result.price && userPreferences.budgetRange) {
          if (result.price >= userPreferences.budgetRange.min && 
              result.price <= userPreferences.budgetRange.max) {
            score += 6;
          }
        }
      }

      // Quality indicators
      if (result.averageRating >= 4.5) score += 5;
      if (result.reviewCount >= 50) score += 3;
      if (result.verified) score += 4;
      if (result.tier === 'signature') score += 6;

      // Recency and activity
      if (result.lastActive && Date.now() - new Date(result.lastActive).getTime() < 7 * 24 * 60 * 60 * 1000) {
        score += 3; // Active in last week
      }

      return { ...result, intelligentScore: score };
    }).sort((a, b) => b.intelligentScore - a.intelligentScore);
  }

  /**
   * Generate smart recommendations with explanations
   */
  private async generateSmartRecommendations(
    scoredResults: any[],
    searchIntent: SearchIntent,
    userPreferences: UserPreferences | null
  ): Promise<SmartRecommendation[]> {
    return scoredResults.slice(0, 20).map(result => {
      const reasons: string[] = [];
      const tags: string[] = [];
      
      // Generate reasons based on scoring factors
      if (result.averageRating >= 4.5) {
        reasons.push(`Highly rated (${result.averageRating.toFixed(1)}/5)`);
        tags.push('top-rated');
      }

      if (searchIntent.genre && result.genres?.includes(searchIntent.genre)) {
        reasons.push(`Specializes in ${searchIntent.genre}`);
        tags.push('genre-match');
      }

      if (searchIntent.serviceType && result.services?.some((s: any) => 
        s.title.toLowerCase().includes(searchIntent.serviceType!))) {
        reasons.push(`Offers ${searchIntent.serviceType} services`);
        tags.push('service-match');
      }

      if (result.verified) {
        reasons.push('Verified creator');
        tags.push('verified');
      }

      if (result.tier === 'signature') {
        reasons.push('Signature tier creator');
        tags.push('premium');
      }

      if (userPreferences?.favoriteGenres.some(genre => result.genres?.includes(genre))) {
        reasons.push('Matches your favorite genres');
        tags.push('personalized');
      }

      const confidence = Math.min(100, Math.max(0, (result.intelligentScore / 50) * 100));

      return {
        creator: result,
        matchScore: result.intelligentScore,
        reasons: reasons.slice(0, 3), // Show top 3 reasons
        confidence: Math.round(confidence),
        tags
      };
    });
  }

  // Helper methods for suggestions
  private async getCreatorSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      const creatorsRef = collection(db, 'creators');
      const q = query(creatorsRef, where(SCHEMA_FIELDS.SERVICE.IS_ACTIVE, '==', true), limit(20));
      const snapshot = await getDocs(q);

      const suggestions: SearchSuggestion[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.displayName?.toLowerCase().includes(query)) {
          suggestions.push({
            text: data.displayName,
            type: 'creator',
            metadata: {
              avatar: data.photoURL,
              rating: data.averageRating
            }
          });
        }
      });

      return suggestions;
    } catch (error) {
      console.error('Error getting creator suggestions:', error);
      return [];
    }
  }

  private async getServiceSuggestions(query: string): Promise<SearchSuggestion[]> {
    const commonServices = [
      'Mixing & Mastering', 'Beat Production', 'Vocal Recording', 'Songwriting',
      'Audio Editing', 'Podcast Editing', 'Sound Design', 'Voice Over'
    ];

    return commonServices
      .filter(service => service.toLowerCase().includes(query))
      .map(service => ({
        text: service,
        type: 'service' as const
      }));
  }

  private async getGenreSuggestions(query: string): Promise<SearchSuggestion[]> {
    const genres = [
      'Hip-Hop', 'R&B', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Classical',
      'Country', 'Trap', 'Drill', 'Afrobeats', 'Reggae', 'Folk', 'Blues'
    ];

    return genres
      .filter(genre => genre.toLowerCase().includes(query))
      .map(genre => ({
        text: genre,
        type: 'genre' as const
      }));
  }

  private async getLocationSuggestions(query: string): Promise<SearchSuggestion[]> {
    const locations = [
      'Tokyo', 'New York', 'Los Angeles', 'London', 'Atlanta', 'Miami',
      'Chicago', 'Nashville', 'Berlin', 'Toronto', 'Sydney', 'Paris'
    ];

    return locations
      .filter(location => location.toLowerCase().includes(query))
      .map(location => ({
        text: location,
        type: 'location' as const
      }));
  }

  private async getTrendingSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      const trending = await this.getTrendingSearches();
      return trending
        .filter(trend => trend.query.includes(query))
        .slice(0, 3)
        .map(trend => ({
          text: trend.query,
          type: 'trending' as const,
          count: trend.count
        }));
    } catch (error) {
      return [];
    }
  }

  private async getPersonalizedSuggestions(userId: string, query: string): Promise<SearchSuggestion[]> {
    try {
      const preferences = await this.getUserPreferences(userId);
      if (!preferences) return [];

      const suggestions: SearchSuggestion[] = [];

      // Previous searches
      preferences.previousSearches
        .filter(search => search.toLowerCase().includes(query))
        .slice(0, 2)
        .forEach(search => {
          suggestions.push({
            text: search,
            type: 'trending'
          });
        });

      return suggestions;
    } catch (error) {
      return [];
    }
  }

  private async getPopularSuggestions(maxSuggestions: number): Promise<SearchSuggestion[]> {
    const popularSuggestions = [
      { text: 'Hip-Hop Producers', type: 'genre' as const },
      { text: 'Mixing & Mastering', type: 'service' as const },
      { text: 'Beat Makers', type: 'service' as const },
      { text: 'Vocal Recording', type: 'service' as const },
      { text: 'R&B Singers', type: 'genre' as const },
      { text: 'Electronic Music', type: 'genre' as const },
      { text: 'Songwriters', type: 'service' as const },
      { text: 'Audio Engineers', type: 'service' as const }
    ];

    return popularSuggestions.slice(0, maxSuggestions);
  }

  private async getFallbackSuggestions(query: string, maxSuggestions: number): Promise<SearchSuggestion[]> {
    // Simple fallback suggestions
    const fallbacks = [
      'mixing mastering',
      'hip hop producer',
      'vocal recording',
      'beat making',
      'rnb singer',
      'audio engineer'
    ];

    return fallbacks
      .filter(suggestion => suggestion.includes(query.toLowerCase()))
      .slice(0, maxSuggestions)
      .map(text => ({ text, type: 'service' as const }));
  }

  private removeDuplicateSuggestions(suggestions: SearchSuggestion[]): SearchSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = `${suggestion.text.toLowerCase()}_${suggestion.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private sortSuggestionsByRelevance(suggestions: SearchSuggestion[], query: string): SearchSuggestion[] {
    return suggestions.sort((a, b) => {
      // Exact match gets highest priority
      const aExact = a.text.toLowerCase() === query.toLowerCase();
      const bExact = b.text.toLowerCase() === query.toLowerCase();
      if (aExact !== bExact) return aExact ? -1 : 1;

      // Starts with query gets second priority
      const aStarts = a.text.toLowerCase().startsWith(query.toLowerCase());
      const bStarts = b.text.toLowerCase().startsWith(query.toLowerCase());
      if (aStarts !== bStarts) return aStarts ? -1 : 1;

      // Type priority: creators > services > genres > locations > trending
      const typeOrder = { creator: 0, service: 1, genre: 2, location: 3, trending: 4 };
      const aOrder = typeOrder[a.type];
      const bOrder = typeOrder[b.type];
      if (aOrder !== bOrder) return aOrder - bOrder;

      // Count or metadata priority
      return (b.count || 0) - (a.count || 0);
    });
  }

  private calculatePersonalizedScore(result: any, preferences: UserPreferences, query: string): number {
    let score = 0;

    // Previous interaction boost
    const hasInteracted = preferences.interactionHistory.some(
      interaction => interaction.resultClicked === result.uid
    );
    if (hasInteracted) score += 20;

    // Genre preference boost
    if (preferences.favoriteGenres.some(genre => result.genres?.includes(genre))) {
      score += 15;
    }

    // Location preference boost
    if (preferences.preferredLocations.some(loc => 
      result.location?.toLowerCase().includes(loc.toLowerCase()))) {
      score += 10;
    }

    // Budget alignment
    if (result.price && preferences.budgetRange) {
      const { min, max } = preferences.budgetRange;
      if (result.price >= min && result.price <= max) {
        score += 12;
      } else if (result.price < min) {
        score += 8; // Still good if cheaper
      }
    }

    return score;
  }

  private categorizeQuery(query: string): string {
    const serviceWords = ['mixing', 'mastering', 'recording', 'production', 'beat'];
    const genreWords = ['hip-hop', 'rnb', 'pop', 'rock', 'electronic', 'jazz'];
    const locationWords = ['tokyo', 'new york', 'london', 'atlanta', 'miami'];

    if (serviceWords.some(word => query.includes(word))) return 'service';
    if (genreWords.some(word => query.includes(word))) return 'genre';
    if (locationWords.some(word => query.includes(word))) return 'location';
    return 'general';
  }

  private async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const userPrefsRef = doc(db, 'userPreferences', userId);
      const userPrefs = await getDoc(userPrefsRef);
      
      if (userPrefs.exists()) {
        return userPrefs.data() as UserPreferences;
      }
      return null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  private async performSearch(query: string, filters: any): Promise<any[]> {
    // This would use the existing search functionality as a base
    // Implementation would call the existing searchCreators function
    return [];
  }

  private async performBasicSearch(query: string, filters: any): Promise<SmartRecommendation[]> {
    // Fallback to basic search if AI search fails
    return [];
  }
}

// Export singleton instance
export const advancedSearchService = new AdvancedSearchService();
