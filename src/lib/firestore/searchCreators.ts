/**
 * Firestore helper for searching creators with advanced filtering and service data
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  DocumentData,
  QueryConstraint 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { filterCreatorsByKeywords, SearchableCreator, SearchResult } from '../utils/filterByKeyword';

export interface SearchCreatorsOptions {
  maxResults?: number;
  includeServices?: boolean;
  useFirestoreFiltering?: boolean;
  filters?: {
    role?: string;
    location?: string;
    tier?: string;
    genres?: string[];
    minRating?: number;
    isAvailable?: boolean;
  };
}

export interface SearchSuggestion {
  text: string;
  type: 'creator' | 'service' | 'genre' | 'location';
  count?: number;
}

/**
 * Search creators using a combination of Firestore queries and client-side filtering
 */
export async function searchCreators(
  searchQuery: string,
  options: SearchCreatorsOptions = {}
): Promise<SearchResult[]> {
  const {
    maxResults = 50,
    includeServices = true,
    useFirestoreFiltering = false,
    filters = {}
  } = options;

  try {
    // If using Firestore filtering, build query constraints
    const constraints: QueryConstraint[] = [];
    
    // Always filter for active creators
    constraints.push(where('isActive', '==', true));
    
    // Apply filters
    if (filters.role) {
      constraints.push(where('role', '==', filters.role));
    }
    
    if (filters.tier) {
      constraints.push(where('tier', '==', filters.tier));
    }
    
    if (filters.minRating) {
      constraints.push(where('averageRating', '>=', filters.minRating));
    }
    
    if (filters.isAvailable) {
      constraints.push(where('isAvailable', '==', true));
    }

    // For location and genre filters, we'll apply them client-side
    // since Firestore doesn't support array-contains queries combined with other where clauses efficiently

    // Add ordering and limit
    constraints.push(orderBy('rankScore', 'desc'));
    constraints.push(limit(Math.min(maxResults * 2, 200))); // Fetch more than needed for client-side filtering

    // Execute the query
    const creatorsQuery = query(collection(db, 'creators'), ...constraints);
    const creatorsSnapshot = await getDocs(creatorsQuery);
    
    let creators: SearchableCreator[] = [];
    
    // Process creators
    for (const doc of creatorsSnapshot.docs) {
      const data = doc.data() as DocumentData;
      
      // Apply client-side filters that couldn't be done in Firestore
      if (filters.location && !data.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        continue;
      }
      
      if (filters.genres && filters.genres.length > 0) {
        const creatorGenres = data.genres || [];
        const hasMatchingGenre = filters.genres.some(genre => 
          creatorGenres.some((cGenre: string) => 
            cGenre.toLowerCase().includes(genre.toLowerCase())
          )
        );
        if (!hasMatchingGenre) continue;
      }

      const creator: SearchableCreator = {
        uid: doc.id,
        displayName: data.displayName,
        name: data.name,
        bio: data.bio,
        photoURL: data.photoURL,
        location: data.location,
        tier: data.tier,
        price: data.price,
        averageRating: data.averageRating,
        reviewCount: data.reviewCount,
        xp: data.xp,
        rankScore: data.rankScore,
        tierFrozen: data.tierFrozen,
        signature: data.signature,
        genres: data.genres || [],
        tags: data.tags || [],
        services: []
      };

      // Fetch services if requested
      if (includeServices) {
        try {
          const servicesQuery = query(
            collection(db, 'services'),
            where('creatorId', '==', doc.id),
            where('isActive', '==', true),
            limit(10)
          );
          const servicesSnapshot = await getDocs(servicesQuery);
          
          creator.services = servicesSnapshot.docs.map(serviceDoc => {
            const serviceData = serviceDoc.data();
            return {
              id: serviceDoc.id,
              title: serviceData.title,
              description: serviceData.description,
              price: serviceData.price,
              category: serviceData.category,
              tags: serviceData.tags || []
            };
          });
        } catch (serviceError) {
          console.warn(`Failed to fetch services for creator ${doc.id}:`, serviceError);
          creator.services = [];
        }
      }

      creators.push(creator);
    }

    // Apply keyword filtering and scoring
    const searchResults = filterCreatorsByKeywords(creators, searchQuery, {
      minScore: searchQuery.trim() ? 1 : 0,
      maxResults
    });

    return searchResults;

  } catch (error) {
    console.error('Error searching creators:', error);
    return [];
  }
}

/**
 * Get search suggestions based on existing data
 */
export async function getSearchSuggestions(
  partialQuery: string,
  maxSuggestions: number = 8
): Promise<SearchSuggestion[]> {
  if (!partialQuery.trim() || partialQuery.length < 2) {
    return [];
  }

  const suggestions: SearchSuggestion[] = [];
  const lowerQuery = partialQuery.toLowerCase();

  try {
    // Get popular creators (names)
    const creatorsQuery = query(
      collection(db, 'creators'),
      where('isActive', '==', true),
      orderBy('reviewCount', 'desc'),
      limit(20)
    );
    const creatorsSnapshot = await getDocs(creatorsQuery);
    
    for (const doc of creatorsSnapshot.docs) {
      const data = doc.data();
      const name = data.displayName || data.name || '';
      
      if (name.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: name,
          type: 'creator',
          count: data.reviewCount || 0
        });
      }
    }

    // Get popular services
    const servicesQuery = query(
      collection(db, 'services'),
      where('isActive', '==', true),
      limit(30)
    );
    const servicesSnapshot = await getDocs(servicesQuery);
    
    const serviceCategories = new Set<string>();
    const serviceTitles = new Set<string>();
    
    for (const doc of servicesSnapshot.docs) {
      const data = doc.data();
      
      if (data.category && data.category.toLowerCase().includes(lowerQuery)) {
        serviceCategories.add(data.category);
      }
      
      if (data.title && data.title.toLowerCase().includes(lowerQuery)) {
        serviceTitles.add(data.title);
      }
    }

    // Add service categories
    for (const category of Array.from(serviceCategories).slice(0, 3)) {
      suggestions.push({
        text: category,
        type: 'service'
      });
    }

    // Add service titles
    for (const title of Array.from(serviceTitles).slice(0, 3)) {
      suggestions.push({
        text: title,
        type: 'service'
      });
    }

    // Add common genres/locations (you might want to maintain these in a separate collection)
    const commonGenres = [
      'Hip-Hop', 'Electronic', 'Pop', 'R&B', 'Rock', 'Jazz', 'Classical',
      'Country', 'Folk', 'Reggae', 'Latin', 'Blues', 'Funk', 'House',
      'Techno', 'Dubstep', 'Trap', 'Ambient', 'Indie'
    ];
    
    const commonLocations = [
      'Tokyo', 'New York', 'Los Angeles', 'London', 'Berlin', 'Nashville',
      'Atlanta', 'Miami', 'Chicago', 'San Francisco', 'Austin', 'Montreal'
    ];

    for (const genre of commonGenres) {
      if (genre.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: genre,
          type: 'genre'
        });
      }
    }

    for (const location of commonLocations) {
      if (location.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: location,
          type: 'location'
        });
      }
    }

    // Sort by relevance and type priority
    suggestions.sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.text.toLowerCase() === lowerQuery;
      const bExact = b.text.toLowerCase() === lowerQuery;
      if (aExact !== bExact) return aExact ? -1 : 1;
      
      // Then by type (creators first, then services, then genres/locations)
      const typeOrder = { creator: 0, service: 1, genre: 2, location: 3 };
      const aOrder = typeOrder[a.type];
      const bOrder = typeOrder[b.type];
      if (aOrder !== bOrder) return aOrder - bOrder;
      
      // Finally by count (if available)
      return (b.count || 0) - (a.count || 0);
    });

    return suggestions.slice(0, maxSuggestions);

  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
}
