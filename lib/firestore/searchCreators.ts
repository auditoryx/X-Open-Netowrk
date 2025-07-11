import { firestore } from '@/lib/firebase/firebaseAdmin';
import { doc, getDoc, query, collection, where, getDocs, limit, orderBy } from 'firebase/firestore';

export interface CreatorSearchResult {
  uid: string;
  displayName: string;
  role: string;
  profileImage?: string;
  rating?: number;
  verified: boolean;
  tier: string;
  genres?: string[];
  location?: string;
  bio?: string;
  roles?: string[];
}

export interface CreatorSearchFilters {
  searchTerm?: string;
  role?: string;
  tags?: string[];
  location?: string;
  verified?: boolean;
  tier?: string;
  limit?: number;
}

// Function to search for creators by role
export async function searchCreatorsByRole(
  role: string, 
  limit: number = 10
): Promise<CreatorSearchResult[]> {
  try {
    const usersCollection = collection(firestore, 'users');
    
    // Query users with the specified role
    const q = query(
      usersCollection,
      where('roles', 'array-contains', role),
      where('accountStatus', '==', 'active'),
      orderBy('rating', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const creators: CreatorSearchResult[] = [];
    
    querySnapshot.forEach(doc => {
      const userData = doc.data();
      creators.push({
        uid: doc.id,
        displayName: userData.displayName || 'Unknown Creator',
        role,
        profileImage: userData.profileImage,
        rating: userData.rating || 0,
        verified: userData.verified || false,
        tier: userData.tier || 'standard',
      });
    });
    
    return creators;
    
  } catch (error) {
    console.error('Error searching for creators:', error);
    return [];
  }
}

// Function to get creator details by UID
export async function getCreatorDetails(uid: string): Promise<CreatorSearchResult | null> {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', uid));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    return {
      uid: userDoc.id,
      displayName: userData.displayName || 'Unknown Creator',
      role: Array.isArray(userData.roles) ? userData.roles[0] : 'unknown',
      profileImage: userData.profileImage,
      rating: userData.rating || 0,
      verified: userData.verified || false,
      tier: userData.tier || 'standard',
    };
    
  } catch (error) {
    console.error('Error fetching creator details:', error);
    return null;
  }
}

// Advanced search function with multiple filters
export async function searchCreators(filters: CreatorSearchFilters): Promise<CreatorSearchResult[]> {
  try {
    const usersCollection = collection(firestore, 'users');
    const queryConditions: any[] = [
      where('accountStatus', '==', 'active')
    ];

    // Add role filter if specified
    if (filters.role) {
      queryConditions.push(where('roles', 'array-contains', filters.role));
    }

    // Add verified filter if specified
    if (filters.verified !== undefined) {
      queryConditions.push(where('verified', '==', filters.verified));
    }

    // Add tier filter if specified
    if (filters.tier) {
      queryConditions.push(where('tier', '==', filters.tier));
    }

    // Build the query
    const q = query(
      usersCollection,
      ...queryConditions,
      orderBy('rating', 'desc'),
      limit(filters.limit || 50)
    );

    const querySnapshot = await getDocs(q);
    let creators: CreatorSearchResult[] = [];

    querySnapshot.forEach(doc => {
      const userData = doc.data();
      creators.push({
        uid: doc.id,
        displayName: userData.displayName || 'Unknown Creator',
        role: Array.isArray(userData.roles) ? userData.roles[0] : 'unknown',
        roles: userData.roles || [],
        profileImage: userData.profileImage,
        rating: userData.rating || 0,
        verified: userData.verified || false,
        tier: userData.tier || 'standard',
        genres: userData.genres || [],
        location: userData.location || userData.city,
        bio: userData.bio || userData.description,
      });
    });

    // Apply client-side filters for more complex queries
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      creators = creators.filter(creator =>
        creator.displayName.toLowerCase().includes(searchTerm) ||
        creator.bio?.toLowerCase().includes(searchTerm) ||
        creator.location?.toLowerCase().includes(searchTerm) ||
        creator.roles?.some(role => role.toLowerCase().includes(searchTerm)) ||
        creator.genres?.some(genre => genre.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by tags/genres
    if (filters.tags && filters.tags.length > 0) {
      creators = creators.filter(creator =>
        creator.genres?.some(genre =>
          filters.tags!.some(tag => genre.toLowerCase().includes(tag.toLowerCase()))
        )
      );
    }

    // Filter by location
    if (filters.location) {
      const locationFilter = filters.location.toLowerCase();
      creators = creators.filter(creator =>
        creator.location?.toLowerCase().includes(locationFilter)
      );
    }

    return creators;

  } catch (error) {
    console.error('Error searching for creators:', error);
    return [];
  }
}

// Function to get all unique roles from creators
export async function getAvailableRoles(): Promise<string[]> {
  try {
    const usersCollection = collection(firestore, 'users');
    const q = query(
      usersCollection,
      where('accountStatus', '==', 'active'),
      limit(1000)
    );
    
    const querySnapshot = await getDocs(q);
    const rolesSet = new Set<string>();
    
    querySnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.roles && Array.isArray(userData.roles)) {
        userData.roles.forEach((role: string) => rolesSet.add(role));
      }
    });
    
    return Array.from(rolesSet).sort();
  } catch (error) {
    console.error('Error fetching available roles:', error);
    return [];
  }
}

// Function to get all unique genres/tags from creators
export async function getAvailableGenres(): Promise<string[]> {
  try {
    const usersCollection = collection(firestore, 'users');
    const q = query(
      usersCollection,
      where('accountStatus', '==', 'active'),
      limit(1000)
    );
    
    const querySnapshot = await getDocs(q);
    const genresSet = new Set<string>();
    
    querySnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.genres && Array.isArray(userData.genres)) {
        userData.genres.forEach((genre: string) => genresSet.add(genre));
      }
      if (userData.tags && Array.isArray(userData.tags)) {
        userData.tags.forEach((tag: string) => genresSet.add(tag));
      }
    });
    
    return Array.from(genresSet).sort();
  } catch (error) {
    console.error('Error fetching available genres:', error);
    return [];
  }
}

// Function to get all unique locations from creators
export async function getAvailableLocations(): Promise<string[]> {
  try {
    const usersCollection = collection(firestore, 'users');
    const q = query(
      usersCollection,
      where('accountStatus', '==', 'active'),
      limit(1000)
    );
    
    const querySnapshot = await getDocs(q);
    const locationsSet = new Set<string>();
    
    querySnapshot.forEach(doc => {
      const userData = doc.data();
      const location = userData.location || userData.city;
      if (location) {
        locationsSet.add(location);
      }
    });
    
    return Array.from(locationsSet).sort();
  } catch (error) {
    console.error('Error fetching available locations:', error);
    return [];
  }
}
