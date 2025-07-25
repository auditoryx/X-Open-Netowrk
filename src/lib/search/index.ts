import { getAlgoliaService, SearchFilters, SearchOptions, SearchResponse } from './algolia';
import { getSearchIndexingService } from './indexing';
import { UnifiedUser } from '@/lib/unified-models/user';

/**
 * Main Search Service Interface
 * 
 * Provides a unified interface for all search operations
 * Abstracts the underlying search implementation (Algolia)
 */

export interface SearchService {
  // Search operations
  searchUsers(query: string, filters?: SearchFilters, options?: SearchOptions): Promise<SearchResponse<UnifiedUser>>;
  searchServices(query: string, filters?: SearchFilters, options?: SearchOptions): Promise<SearchResponse>;
  getSuggestions(query: string, type?: 'users' | 'services'): Promise<string[]>;
  
  // Indexing operations
  indexUser(uid: string, userData?: any): Promise<void>;
  indexService(serviceId: string, serviceData?: any): Promise<void>;
  removeUser(uid: string): Promise<void>;
  removeService(serviceId: string): Promise<void>;
  
  // Bulk operations
  bulkIndexUsers(limit?: number): Promise<any>;
  bulkIndexServices(limit?: number): Promise<any>;
  
  // System operations
  setupIndexes(): Promise<void>;
  healthCheck(): Promise<any>;
}

/**
 * Main search service implementation using Algolia
 */
class MainSearchService implements SearchService {
  private algolia = getAlgoliaService();
  private indexing = getSearchIndexingService();

  /**
   * Search for users/creators
   */
  async searchUsers(
    query: string, 
    filters: SearchFilters = {}, 
    options: SearchOptions = {}
  ): Promise<SearchResponse<UnifiedUser>> {
    return this.algolia.searchUsers(query, filters, options);
  }

  /**
   * Search for services
   */
  async searchServices(
    query: string, 
    filters: SearchFilters = {}, 
    options: SearchOptions = {}
  ): Promise<SearchResponse> {
    return this.algolia.searchServices(query, filters, options);
  }

  /**
   * Get search suggestions/autocomplete
   */
  async getSuggestions(query: string, type: 'users' | 'services' = 'users'): Promise<string[]> {
    return this.algolia.getSuggestions(query, type);
  }

  /**
   * Index a user for search
   */
  async indexUser(uid: string, userData?: any): Promise<void> {
    return this.indexing.indexUser(uid, userData);
  }

  /**
   * Index a service for search
   */
  async indexService(serviceId: string, serviceData?: any): Promise<void> {
    return this.indexing.indexService(serviceId, serviceData);
  }

  /**
   * Remove user from search index
   */
  async removeUser(uid: string): Promise<void> {
    return this.indexing.removeUserFromIndex(uid);
  }

  /**
   * Remove service from search index
   */
  async removeService(serviceId: string): Promise<void> {
    return this.indexing.removeServiceFromIndex(serviceId);
  }

  /**
   * Bulk index users
   */
  async bulkIndexUsers(limit: number = 1000): Promise<any> {
    return this.indexing.bulkIndexUsers(limit);
  }

  /**
   * Bulk index services
   */
  async bulkIndexServices(limit: number = 1000): Promise<any> {
    return this.indexing.bulkIndexServices(limit);
  }

  /**
   * Setup search indexes
   */
  async setupIndexes(): Promise<void> {
    return this.indexing.setupIndexes();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    return this.indexing.healthCheck();
  }
}

/**
 * Fallback search service using Firestore (for development/backup)
 */
class FirestoreSearchService implements SearchService {
  async searchUsers(
    query: string, 
    filters: SearchFilters = {}, 
    options: SearchOptions = {}
  ): Promise<SearchResponse<UnifiedUser>> {
    // This is a simplified fallback implementation
    // In production, you'd want more sophisticated Firestore queries
    console.warn('Using fallback Firestore search - limited functionality');
    
    const { admin } = await import('@/lib/firebase-admin');
    
    let firestoreQuery = admin.firestore()
      .collection('users')
      .where('isActive', '==', true);

    if (filters.role) {
      firestoreQuery = firestoreQuery.where('role', '==', filters.role);
    }

    if (filters.tier) {
      firestoreQuery = firestoreQuery.where('tier', '==', filters.tier);
    }

    if (filters.verificationStatus) {
      firestoreQuery = firestoreQuery.where('verificationStatus', '==', filters.verificationStatus);
    }

    // Basic text search on displayName (very limited)
    if (query) {
      firestoreQuery = firestoreQuery
        .where('displayName', '>=', query)
        .where('displayName', '<=', query + '\uf8ff');
    }

    firestoreQuery = firestoreQuery.limit(options.hitsPerPage || 20);

    const snapshot = await firestoreQuery.get();
    const hits = snapshot.docs.map(doc => ({
      objectID: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    return {
      hits,
      nbHits: hits.length,
      page: 0,
      nbPages: 1,
      hitsPerPage: hits.length,
      processingTimeMS: 0,
      query,
    };
  }

  async searchServices(
    query: string, 
    filters: SearchFilters = {}, 
    options: SearchOptions = {}
  ): Promise<SearchResponse> {
    console.warn('Using fallback Firestore search for services - limited functionality');
    
    const { admin } = await import('@/lib/firebase-admin');
    
    let firestoreQuery = admin.firestore()
      .collection('services')
      .where('isActive', '==', true);

    // Basic text search on title
    if (query) {
      firestoreQuery = firestoreQuery
        .where('title', '>=', query)
        .where('title', '<=', query + '\uf8ff');
    }

    firestoreQuery = firestoreQuery.limit(options.hitsPerPage || 20);

    const snapshot = await firestoreQuery.get();
    const hits = snapshot.docs.map(doc => ({
      objectID: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    return {
      hits,
      nbHits: hits.length,
      page: 0,
      nbPages: 1,
      hitsPerPage: hits.length,
      processingTimeMS: 0,
      query,
    };
  }

  async getSuggestions(query: string, type: 'users' | 'services' = 'users'): Promise<string[]> {
    // Very basic suggestions from Firestore
    return [];
  }

  async indexUser(uid: string, userData?: any): Promise<void> {
    // No-op for Firestore fallback
    console.log(`Fallback search: would index user ${uid}`);
  }

  async indexService(serviceId: string, serviceData?: any): Promise<void> {
    // No-op for Firestore fallback
    console.log(`Fallback search: would index service ${serviceId}`);
  }

  async removeUser(uid: string): Promise<void> {
    // No-op for Firestore fallback
    console.log(`Fallback search: would remove user ${uid}`);
  }

  async removeService(serviceId: string): Promise<void> {
    // No-op for Firestore fallback
    console.log(`Fallback search: would remove service ${serviceId}`);
  }

  async bulkIndexUsers(): Promise<any> {
    return { success: true, indexed: 0, errors: [] };
  }

  async bulkIndexServices(): Promise<any> {
    return { success: true, indexed: 0, errors: [] };
  }

  async setupIndexes(): Promise<void> {
    console.log('Fallback search: no index setup needed');
  }

  async healthCheck(): Promise<any> {
    return { status: 'healthy', details: { fallback: true } };
  }
}

/**
 * Get the appropriate search service instance
 */
function getSearchService(): SearchService {
  const useAlgolia = process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_ADMIN_KEY;
  
  if (useAlgolia) {
    try {
      return new MainSearchService();
    } catch (error) {
      console.error('Failed to initialize Algolia search service, falling back to Firestore:', error);
      return new FirestoreSearchService();
    }
  } else {
    console.warn('Algolia not configured, using Firestore fallback search');
    return new FirestoreSearchService();
  }
}

// Singleton instance
let searchService: SearchService | null = null;

export function getSearchService(): SearchService {
  if (!searchService) {
    searchService = getSearchServiceInternal();
  }
  return searchService;
}

// Export types and utilities
export type { SearchFilters, SearchOptions, SearchResponse };
export { SearchFilters as SearchFiltersType, SearchOptions as SearchOptionsType };

export default getSearchService;