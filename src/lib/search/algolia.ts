import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';
import { UnifiedUser } from '@/lib/unified-models/user';

/**
 * Algolia Search Service
 * 
 * Provides real search functionality to replace the mock implementation
 * Handles indexing and searching of users, services, and other content
 */

export interface SearchFilters {
  role?: string;
  tier?: string;
  verificationStatus?: string;
  location?: string;
  genres?: string[];
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  availableNow?: boolean;
  proTier?: string;
  verifiedOnly?: boolean;
  radiusKm?: number;
  lat?: number;
  lng?: number;
}

export interface SearchOptions {
  hitsPerPage?: number;
  page?: number;
  sortBy?: 'relevance' | 'rating' | 'price' | 'distance' | 'created_at';
  facetFilters?: string[];
  numericFilters?: string[];
  aroundLatLng?: string;
  aroundRadius?: number;
}

export interface SearchResult<T = any> {
  objectID: string;
  _highlightResult?: any;
  _snippetResult?: any;
  [key: string]: any;
}

export interface SearchResponse<T = any> {
  hits: SearchResult<T>[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
  query: string;
  facets?: Record<string, Record<string, number>>;
}

class AlgoliaService {
  private adminClient: SearchClient;
  private searchClient: SearchClient;
  private usersIndex: SearchIndex;
  private servicesIndex: SearchIndex;

  constructor() {
    const appId = process.env.ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;
    const searchKey = process.env.ALGOLIA_SEARCH_KEY;

    if (!appId || !adminKey || !searchKey) {
      throw new Error('Algolia configuration missing. Please set ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY, and ALGOLIA_SEARCH_KEY');
    }

    this.adminClient = algoliasearch(appId, adminKey);
    this.searchClient = algoliasearch(appId, searchKey);
    this.usersIndex = this.searchClient.initIndex('users');
    this.servicesIndex = this.searchClient.initIndex('services');
  }

  /**
   * Search for creators and users
   */
  async searchUsers(
    query: string, 
    filters: SearchFilters = {}, 
    options: SearchOptions = {}
  ): Promise<SearchResponse<UnifiedUser>> {
    const searchOptions = this.buildSearchOptions(filters, options);
    
    try {
      const results = await this.usersIndex.search(query, searchOptions);
      return this.transformSearchResponse(results);
    } catch (error) {
      console.error('Algolia user search error:', error);
      throw new Error('Search service temporarily unavailable');
    }
  }

  /**
   * Search for services
   */
  async searchServices(
    query: string, 
    filters: SearchFilters = {}, 
    options: SearchOptions = {}
  ): Promise<SearchResponse> {
    const searchOptions = this.buildSearchOptions(filters, options);
    
    try {
      const results = await this.servicesIndex.search(query, searchOptions);
      return this.transformSearchResponse(results);
    } catch (error) {
      console.error('Algolia service search error:', error);
      throw new Error('Search service temporarily unavailable');
    }
  }

  /**
   * Get search suggestions/autocomplete
   */
  async getSuggestions(query: string, type: 'users' | 'services' = 'users'): Promise<string[]> {
    if (query.length < 2) return [];

    const index = type === 'users' ? this.usersIndex : this.servicesIndex;
    
    try {
      const results = await index.search(query, {
        hitsPerPage: 5,
        attributesToRetrieve: ['displayName', 'title', 'role', 'category'],
        attributesToHighlight: [],
      });

      return results.hits.map(hit => 
        hit.displayName || hit.title || hit.role || hit.category
      ).filter(Boolean).slice(0, 5);
    } catch (error) {
      console.error('Algolia suggestions error:', error);
      return [];
    }
  }

  /**
   * Index a user for search
   */
  async indexUser(user: UnifiedUser): Promise<void> {
    try {
      const searchableUser = this.prepareUserForIndex(user);
      await this.usersIndex.saveObject(searchableUser);
    } catch (error) {
      console.error('Error indexing user:', error);
      throw new Error('Failed to index user for search');
    }
  }

  /**
   * Index a service for search
   */
  async indexService(service: any): Promise<void> {
    try {
      const searchableService = this.prepareServiceForIndex(service);
      await this.servicesIndex.saveObject(searchableService);
    } catch (error) {
      console.error('Error indexing service:', error);
      throw new Error('Failed to index service for search');
    }
  }

  /**
   * Remove user from search index
   */
  async removeUser(userId: string): Promise<void> {
    try {
      await this.usersIndex.deleteObject(userId);
    } catch (error) {
      console.error('Error removing user from index:', error);
    }
  }

  /**
   * Remove service from search index
   */
  async removeService(serviceId: string): Promise<void> {
    try {
      await this.servicesIndex.deleteObject(serviceId);
    } catch (error) {
      console.error('Error removing service from index:', error);
    }
  }

  /**
   * Bulk index users
   */
  async bulkIndexUsers(users: UnifiedUser[]): Promise<void> {
    try {
      const searchableUsers = users.map(user => this.prepareUserForIndex(user));
      await this.usersIndex.saveObjects(searchableUsers);
    } catch (error) {
      console.error('Error bulk indexing users:', error);
      throw new Error('Failed to bulk index users');
    }
  }

  /**
   * Clear all indexes (use with caution)
   */
  async clearIndexes(): Promise<void> {
    try {
      await Promise.all([
        this.usersIndex.clearObjects(),
        this.servicesIndex.clearObjects(),
      ]);
    } catch (error) {
      console.error('Error clearing indexes:', error);
      throw new Error('Failed to clear search indexes');
    }
  }

  /**
   * Configure index settings
   */
  async configureIndexes(): Promise<void> {
    try {
      // Users index configuration
      await this.usersIndex.setSettings({
        searchableAttributes: [
          'displayName',
          'name',
          'bio',
          'location',
          'role',
          'genres',
          'services',
        ],
        attributesForFaceting: [
          'role',
          'tier',
          'verificationStatus',
          'location',
          'genres',
          'averageRating',
        ],
        ranking: [
          'typo',
          'geo',
          'words',
          'filters',
          'proximity',
          'attribute',
          'exact',
          'custom',
        ],
        customRanking: [
          'desc(averageRating)',
          'desc(reviewCount)',
          'desc(xp)',
          'desc(createdAt)',
        ],
        attributesToHighlight: [
          'displayName',
          'bio',
          'location',
        ],
        attributesToSnippet: [
          'bio:20',
        ],
        hitsPerPage: 20,
        maxValuesPerFacet: 100,
      });

      // Services index configuration
      await this.servicesIndex.setSettings({
        searchableAttributes: [
          'title',
          'description',
          'category',
          'tags',
          'creatorName',
        ],
        attributesForFaceting: [
          'category',
          'price',
          'duration',
          'tier',
          'creatorRole',
        ],
        ranking: [
          'typo',
          'geo',
          'words',
          'filters',
          'proximity',
          'attribute',
          'exact',
          'custom',
        ],
        customRanking: [
          'desc(averageRating)',
          'desc(bookingCount)',
          'asc(price)',
          'desc(createdAt)',
        ],
        attributesToHighlight: [
          'title',
          'description',
          'category',
        ],
        attributesToSnippet: [
          'description:30',
        ],
      });
    } catch (error) {
      console.error('Error configuring indexes:', error);
      throw new Error('Failed to configure search indexes');
    }
  }

  /**
   * Build Algolia search options from filters
   */
  private buildSearchOptions(filters: SearchFilters, options: SearchOptions): any {
    const searchOptions: any = {
      hitsPerPage: options.hitsPerPage || 20,
      page: options.page || 0,
      facets: ['*'],
    };

    // Build facet filters
    const facetFilters: string[] = [];
    
    if (filters.role) {
      facetFilters.push(`role:${filters.role}`);
    }
    
    if (filters.tier) {
      facetFilters.push(`tier:${filters.tier}`);
    }
    
    if (filters.verificationStatus) {
      facetFilters.push(`verificationStatus:${filters.verificationStatus}`);
    }
    
    if (filters.verifiedOnly) {
      facetFilters.push('verificationStatus:verified');
    }

    if (filters.genres && filters.genres.length > 0) {
      const genreFilters = filters.genres.map(genre => `genres:${genre}`);
      facetFilters.push(genreFilters);
    }

    if (facetFilters.length > 0) {
      searchOptions.facetFilters = facetFilters;
    }

    // Build numeric filters
    const numericFilters: string[] = [];
    
    if (filters.minRating) {
      numericFilters.push(`averageRating >= ${filters.minRating}`);
    }
    
    if (filters.minPrice) {
      numericFilters.push(`price >= ${filters.minPrice}`);
    }
    
    if (filters.maxPrice) {
      numericFilters.push(`price <= ${filters.maxPrice}`);
    }

    if (numericFilters.length > 0) {
      searchOptions.numericFilters = numericFilters;
    }

    // Geographic search
    if (filters.lat && filters.lng) {
      searchOptions.aroundLatLng = `${filters.lat},${filters.lng}`;
      if (filters.radiusKm) {
        searchOptions.aroundRadius = filters.radiusKm * 1000; // Convert to meters
      }
    }

    // Sorting
    if (options.sortBy && options.sortBy !== 'relevance') {
      const sortMapping: Record<string, string> = {
        'rating': 'users_rating_desc',
        'price': 'services_price_asc',
        'distance': 'users_geo',
        'created_at': 'users_created_desc',
      };
      
      const sortIndex = sortMapping[options.sortBy];
      if (sortIndex) {
        searchOptions.indexName = sortIndex;
      }
    }

    return searchOptions;
  }

  /**
   * Transform Algolia response to our standard format
   */
  private transformSearchResponse(response: any): SearchResponse {
    return {
      hits: response.hits,
      nbHits: response.nbHits,
      page: response.page,
      nbPages: response.nbPages,
      hitsPerPage: response.hitsPerPage,
      processingTimeMS: response.processingTimeMS,
      query: response.query,
      facets: response.facets,
    };
  }

  /**
   * Prepare user data for Algolia indexing
   */
  private prepareUserForIndex(user: UnifiedUser): any {
    return {
      objectID: user.uid,
      displayName: user.displayName,
      name: user.name,
      email: user.email, // Only for admin searches
      role: user.role,
      tier: user.tier,
      verificationStatus: user.verificationStatus,
      bio: user.bio,
      location: user.location,
      averageRating: user.averageRating || 0,
      reviewCount: user.reviewCount || 0,
      xp: user.xp || 0,
      profilePicture: user.profilePicture,
      isActive: user.isActive,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
      // Geographic data (if available)
      _geoloc: user.location ? this.parseLocationToGeoLoc(user.location) : undefined,
    };
  }

  /**
   * Prepare service data for Algolia indexing
   */
  private prepareServiceForIndex(service: any): any {
    return {
      objectID: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      duration: service.duration,
      creatorId: service.creatorId,
      creatorName: service.creatorName,
      creatorRole: service.creatorRole,
      averageRating: service.averageRating || 0,
      bookingCount: service.bookingCount || 0,
      isActive: service.isActive,
      createdAt: service.createdAt.getTime(),
      updatedAt: service.updatedAt?.getTime(),
      tags: service.tags || [],
    };
  }

  /**
   * Parse location string to Algolia geoLoc format
   */
  private parseLocationToGeoLoc(location: string): { lat: number; lng: number } | undefined {
    // This is a simplified implementation
    // In production, you'd want to use a geocoding service
    const coordinates = location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (coordinates) {
      return {
        lat: parseFloat(coordinates[1]),
        lng: parseFloat(coordinates[2]),
      };
    }
    return undefined;
  }
}

// Singleton instance
let algoliaService: AlgoliaService | null = null;

export function getAlgoliaService(): AlgoliaService {
  if (!algoliaService) {
    algoliaService = new AlgoliaService();
  }
  return algoliaService;
}

export default AlgoliaService;