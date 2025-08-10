import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, Query } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { UserProfile } from '@/types/user';
import { getFlags } from '@/lib/FeatureFlags';

const db = getFirestore(app);

export interface ExploreFilters {
  role?: string;
  tier?: string;
  location?: string;
  genres?: string[];
  minRating?: number;
  onlyAvailable?: boolean;
  
  // AX Beta: Offer-based filters
  hasOffers?: boolean;
  priceRange?: [number, number];
  maxTurnaround?: number;
  
  // Role-specific offer filters
  licenseOptions?: string[]; // Producer
  bpmRange?: [number, number]; // Producer
  service?: string; // Engineer
  stemTier?: string; // Engineer
  category?: string; // Videographer
  drone?: boolean; // Videographer
  roomType?: string; // Studio
  engineerIncluded?: boolean; // Studio
}

export interface ExploreOptions {
  enableFirstScreenMix?: boolean;
  enableLaneNudges?: boolean;
  enableTierPrecedence?: boolean;
  limit?: number;
}

interface ExploreResult {
  top: UserProfile[];
  rising: UserProfile[];
  newThisWeek: UserProfile[];
  sponsored?: UserProfile[]; // Separate rail for sponsored content
  metadata: {
    totalResults: number;
    filters: ExploreFilters;
    timestamp: string;
    mixRatios: {
      top: number;
      rising: number;
      newThisWeek: number;
    };
  };
}

/**
 * Enhanced Explore API with server-side composition for merit-first exposure
 * GET /api/explore - Returns composed explore results with tier precedence and credibility scoring
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: ExploreFilters = {
      role: searchParams.get('role') || undefined,
      tier: searchParams.get('tier') || undefined,
      location: searchParams.get('location') || undefined,
      genres: searchParams.get('genres')?.split(',').filter(Boolean) || undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      onlyAvailable: searchParams.get('onlyAvailable') === 'true',
      
      // AX Beta: Offer-based filters
      hasOffers: searchParams.get('hasOffers') === 'true',
      priceRange: searchParams.get('priceRange') ? 
        searchParams.get('priceRange')!.split(',').map(Number) as [number, number] : undefined,
      maxTurnaround: searchParams.get('maxTurnaround') ? parseInt(searchParams.get('maxTurnaround')!) : undefined,
      
      // Role-specific offer filters
      licenseOptions: searchParams.get('licenseOptions')?.split(',').filter(Boolean) || undefined,
      bpmRange: searchParams.get('bpmRange') ? 
        searchParams.get('bpmRange')!.split(',').map(Number) as [number, number] : undefined,
      service: searchParams.get('service') || undefined,
      stemTier: searchParams.get('stemTier') || undefined,
      category: searchParams.get('category') || undefined,
      drone: searchParams.get('drone') === 'true' ? true : (searchParams.get('drone') === 'false' ? false : undefined),
      roomType: searchParams.get('roomType') || undefined,
      engineerIncluded: searchParams.get('engineerIncluded') === 'true' ? true : (searchParams.get('engineerIncluded') === 'false' ? false : undefined)
    };

    // Parse options and feature flags
    const flags = await getFlags();
    const options: ExploreOptions = {
      enableFirstScreenMix: !!flags.FIRST_SCREEN_MIX,
      enableLaneNudges: !!flags.LANE_NUDGES,
      enableTierPrecedence: !!flags.EXPOSE_SCORE_V1,
      limit: parseInt(searchParams.get('limit') || '30')
    };

    console.log('Explore API request:', { filters, options });

    // Get explore results using server-side composition
    const result = await getExploreResults(filters, options);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Explore API error:', error);
    return NextResponse.json(
      {
        error: 'Explore service temporarily unavailable',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : error : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Server-side composition for explore results with merit-first exposure
 */
async function getExploreResults(filters: ExploreFilters, options: ExploreOptions): Promise<ExploreResult> {
  const limit = options.limit || 30;
  
  if (options.enableFirstScreenMix) {
    // First-screen mix: ~70% Top, ~20% Rising, ~10% New This Week
    const topLimit = Math.ceil(limit * 0.7);
    const risingLimit = Math.ceil(limit * 0.2);
    const newLimit = Math.ceil(limit * 0.1);

    const [topResults, risingResults, newResults] = await Promise.all([
      getTopCreators(filters, topLimit, options),
      getRisingCreators(filters, risingLimit, options),
      getNewCreators(filters, newLimit, options)
    ]);

    // Light shuffle within each bucket to prevent staleness
    const shuffledTop = lightShuffle(topResults);
    const shuffledRising = lightShuffle(risingResults);
    const shuffledNew = lightShuffle(newResults);

    return {
      top: shuffledTop,
      rising: shuffledRising,
      newThisWeek: shuffledNew,
      metadata: {
        totalResults: shuffledTop.length + shuffledRising.length + shuffledNew.length,
        filters,
        timestamp: new Date().toISOString(),
        mixRatios: {
          top: shuffledTop.length / limit,
          rising: shuffledRising.length / limit,
          newThisWeek: shuffledNew.length / limit
        }
      }
    };
  } else {
    // Fallback: single tier-precedence sorted list
    const topResults = await getTopCreators(filters, limit, options);
    
    return {
      top: topResults,
      rising: [],
      newThisWeek: [],
      metadata: {
        totalResults: topResults.length,
        filters,
        timestamp: new Date().toISOString(),
        mixRatios: {
          top: 1.0,
          rising: 0,
          newThisWeek: 0
        }
      }
    };
  }
}

/**
 * Get top creators sorted by tier precedence → credibility score
 */
async function getTopCreators(filters: ExploreFilters, resultLimit: number, options: ExploreOptions): Promise<UserProfile[]> {
  try {
    let baseQuery: Query = collection(db, 'users');
    const constraints = [];

    // Base filters
    constraints.push(where('roles', 'array-contains', filters.role || 'creator'));
    constraints.push(where('status', '==', 'approved'));

    // Tier filter
    if (filters.tier) {
      constraints.push(where('tier', '==', filters.tier));
    }

    // Apply tier precedence ordering if enabled
    if (options.enableTierPrecedence) {
      // Order by tier (ASC) then credibilityScore (DESC) for tier precedence
      constraints.push(orderBy('tier', 'asc'));
      constraints.push(orderBy('credibilityScore', 'desc'));
    } else {
      // Fallback to existing rankScore
      constraints.push(orderBy('rankScore', 'desc'));
    }

    constraints.push(limit(resultLimit * 2)); // Get extra for filtering

    const querySnapshot = await getDocs(query(baseQuery, ...constraints));
    let results = querySnapshot.docs.map(doc => ({ 
      uid: doc.id, 
      ...doc.data() 
    })) as UserProfile[];

    // Apply additional filters
    results = await applyAdditionalFilters(results, filters);

    // Apply lane nudges if enabled
    if (options.enableLaneNudges && filters.role) {
      results = applyLaneNudges(results, filters.role, options.enableLaneNudges);
    }

    // Return up to the requested limit
    return results.slice(0, resultLimit);

  } catch (error) {
    console.error('Error fetching top creators:', error);
    return [];
  }
}

/**
 * Get rising creators (recent activity, high growth)
 */
async function getRisingCreators(filters: ExploreFilters, resultLimit: number, options: ExploreOptions): Promise<UserProfile[]> {
  try {
    // Look for creators with rising talent badge or recent high activity
    let baseQuery: Query = collection(db, 'users');
    const constraints = [];

    constraints.push(where('roles', 'array-contains', filters.role || 'creator'));
    constraints.push(where('status', '==', 'approved'));
    
    // Filter for users with rising talent badge OR recent activity
    constraints.push(where('badgeIds', 'array-contains-any', ['rising-talent', 'trending-now']));

    if (options.enableTierPrecedence) {
      constraints.push(orderBy('credibilityScore', 'desc'));
    } else {
      constraints.push(orderBy('rankScore', 'desc'));
    }

    constraints.push(limit(resultLimit * 2));

    const querySnapshot = await getDocs(query(baseQuery, ...constraints));
    let results = querySnapshot.docs.map(doc => ({ 
      uid: doc.id, 
      ...doc.data() 
    })) as UserProfile[];

    // Apply filters and lane nudges
    results = await applyAdditionalFilters(results, filters);
    if (options.enableLaneNudges && filters.role) {
      results = applyLaneNudges(results, filters.role, options.enableLaneNudges);
    }

    return results.slice(0, resultLimit);

  } catch (error) {
    console.error('Error fetching rising creators:', error);
    return [];
  }
}

/**
 * Get new creators (joined recently)
 */
async function getNewCreators(filters: ExploreFilters, resultLimit: number, options: ExploreOptions): Promise<UserProfile[]> {
  try {
    // Look for creators with new-this-week badge or created recently
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let baseQuery: Query = collection(db, 'users');
    const constraints = [];

    constraints.push(where('roles', 'array-contains', filters.role || 'creator'));
    constraints.push(where('status', '==', 'approved'));
    
    // Prefer users with new-this-week badge, fallback to recent creation
    constraints.push(where('badgeIds', 'array-contains', 'new-this-week'));

    if (options.enableTierPrecedence) {
      constraints.push(orderBy('credibilityScore', 'desc'));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    constraints.push(limit(resultLimit));

    const querySnapshot = await getDocs(query(baseQuery, ...constraints));
    let results = querySnapshot.docs.map(doc => ({ 
      uid: doc.id, 
      ...doc.data() 
    })) as UserProfile[];

    // Apply filters
    results = await applyAdditionalFilters(results, filters);

    return results;

  } catch (error) {
    console.error('Error fetching new creators:', error);
    return [];
  }
}

/**
 * Apply additional client-side filters including offer-based criteria
 */
async function applyAdditionalFilters(results: UserProfile[], filters: ExploreFilters): Promise<UserProfile[]> {
  // If we have offer-specific filters, we need to fetch and check offers
  const hasOfferFilters = filters.hasOffers || filters.priceRange || filters.maxTurnaround || 
    filters.licenseOptions || filters.bpmRange || filters.service || filters.stemTier || 
    filters.category || filters.drone !== undefined || filters.roomType || filters.engineerIncluded !== undefined;

  let filteredResults = results.filter(profile => {
    // Location filter
    if (filters.location) {
      // TODO: Implement location-based filtering
      // This would need a proper location field in the profile
    }

    // Genres filter
    if (filters.genres && filters.genres.length > 0) {
      if (!profile.genres || !profile.genres.some(genre => 
        filters.genres!.some(filterGenre => 
          genre.toLowerCase().includes(filterGenre.toLowerCase())
        )
      )) {
        return false;
      }
    }

    // Only available filter
    if (filters.onlyAvailable) {
      if (!profile.availability || profile.availability.length === 0) {
        return false;
      }
    }

    return true;
  });

  // Apply offer-based filters if needed
  if (hasOfferFilters) {
    const userOfferMap = new Map<string, any[]>();
    
    // Fetch offers for all users in batch
    const userIds = filteredResults.map(p => p.uid);
    if (userIds.length > 0) {
      const offersQuery = query(
        collection(db, 'offers'),
        where('userId', 'in', userIds.slice(0, 10)), // Firestore limit
        where('active', '==', true)
      );
      
      const offersSnapshot = await getDocs(offersQuery);
      
      offersSnapshot.docs.forEach(doc => {
        const offer = doc.data();
        if (!userOfferMap.has(offer.userId)) {
          userOfferMap.set(offer.userId, []);
        }
        userOfferMap.get(offer.userId)!.push(offer);
      });
    }

    // Filter based on offer criteria
    filteredResults = filteredResults.filter(profile => {
      const userOffers = userOfferMap.get(profile.uid) || [];

      // Has offers filter
      if (filters.hasOffers && userOffers.length === 0) {
        return false;
      }

      // If user has no offers but we have offer-specific filters, exclude them
      if (userOffers.length === 0 && hasOfferFilters && !filters.hasOffers) {
        return false;
      }

      // Role-specific offer filters
      const roleOffers = userOffers.filter(offer => offer.role === filters.role);
      
      if (roleOffers.length === 0 && (filters.role && hasOfferFilters)) {
        return false;
      }

      // Price range filter
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange;
        const hasMatchingPrice = roleOffers.some(offer => 
          offer.price >= minPrice && offer.price <= maxPrice
        );
        if (!hasMatchingPrice) return false;
      }

      // Max turnaround filter
      if (filters.maxTurnaround) {
        const hasMatchingTurnaround = roleOffers.some(offer => 
          offer.turnaroundDays <= filters.maxTurnaround!
        );
        if (!hasMatchingTurnaround) return false;
      }

      // Producer-specific filters
      if (filters.role === 'producer') {
        if (filters.licenseOptions && filters.licenseOptions.length > 0) {
          const hasMatchingLicense = roleOffers.some(offer => 
            offer.licenseOptions && filters.licenseOptions!.some(option => 
              offer.licenseOptions.includes(option)
            )
          );
          if (!hasMatchingLicense) return false;
        }

        if (filters.bpmRange) {
          const [minBpm, maxBpm] = filters.bpmRange;
          const hasMatchingBpm = roleOffers.some(offer => 
            offer.bpm && offer.bpm >= minBpm && offer.bpm <= maxBpm
          );
          if (!hasMatchingBpm) return false;
        }
      }

      // Engineer-specific filters
      if (filters.role === 'engineer') {
        if (filters.service) {
          const hasMatchingService = roleOffers.some(offer => offer.service === filters.service);
          if (!hasMatchingService) return false;
        }

        if (filters.stemTier) {
          const hasMatchingStemTier = roleOffers.some(offer => offer.stemTier === filters.stemTier);
          if (!hasMatchingStemTier) return false;
        }
      }

      // Videographer-specific filters
      if (filters.role === 'videographer') {
        if (filters.category) {
          const hasMatchingCategory = roleOffers.some(offer => offer.category === filters.category);
          if (!hasMatchingCategory) return false;
        }

        if (filters.drone !== undefined) {
          const hasMatchingDrone = roleOffers.some(offer => offer.drone === filters.drone);
          if (!hasMatchingDrone) return false;
        }
      }

      // Studio-specific filters
      if (filters.role === 'studio') {
        if (filters.roomType) {
          const hasMatchingRoomType = roleOffers.some(offer => offer.roomType === filters.roomType);
          if (!hasMatchingRoomType) return false;
        }

        if (filters.engineerIncluded !== undefined) {
          const hasMatchingEngineer = roleOffers.some(offer => offer.engineerIncluded === filters.engineerIncluded);
          if (!hasMatchingEngineer) return false;
        }
      }

      return true;
    });
  }

  return filteredResults;
}

/**
 * Apply lane nudges for role-specific boosts
 */
function applyLaneNudges(results: UserProfile[], role: string, enabled: boolean): UserProfile[] {
  if (!enabled) return results;

  // Apply small boosts based on role-specific criteria
  return results.map(profile => {
    let nudgeScore = 0;

    switch (role) {
      case 'videographer':
        // Boost videographers with media portfolio
        if (profile.media && profile.media.length > 3) {
          nudgeScore += 10;
        }
        break;
      case 'producer':
        // Boost producers with high completion rate
        if (profile.stats?.completedBookings && profile.stats.completedBookings > 10) {
          nudgeScore += 15;
        }
        break;
      case 'engineer':
        // Boost engineers with fast response time
        if (profile.stats?.avgResponseTimeHours && profile.stats.avgResponseTimeHours < 4) {
          nudgeScore += 12;
        }
        break;
      case 'studio':
        // Boost studios with multiple rooms
        if (profile.rooms && profile.rooms.length > 1) {
          nudgeScore += 8;
        }
        break;
    }

    // Apply nudge to credibility score (temporary boost for sorting)
    return {
      ...profile,
      credibilityScore: (profile.credibilityScore || 0) + nudgeScore
    };
  }).sort((a, b) => (b.credibilityScore || 0) - (a.credibilityScore || 0));
}

/**
 * Light shuffle within buckets to prevent staleness while maintaining general order
 */
function lightShuffle<T>(array: T[]): T[] {
  const result = [...array];
  const shuffleCount = Math.min(3, Math.floor(array.length / 4)); // Shuffle up to 3 items or 25%
  
  for (let i = 0; i < shuffleCount; i++) {
    const idx1 = Math.floor(Math.random() * result.length);
    const idx2 = Math.floor(Math.random() * result.length);
    [result[idx1], result[idx2]] = [result[idx2], result[idx1]];
  }
  
  return result;
}