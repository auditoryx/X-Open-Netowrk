import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  startAfter,
  QueryDocumentSnapshot,
  updateDoc,
  increment
} from 'firebase/firestore';
import { CollabPackage, CollabPackageFilters } from '@/src/lib/types/CollabPackage';

/**
 * Get a single collaboration package by ID
 */
export async function getCollabPackageById(packageId: string): Promise<CollabPackage | null> {
  try {
    if (!packageId) {
      throw new Error('Package ID is required');
    }

    const packageRef = doc(db, 'collabPackages', packageId);
    const packageDoc = await getDoc(packageRef);

    if (!packageDoc.exists()) {
      return null;
    }

    const packageData = {
      id: packageDoc.id,
      ...packageDoc.data()
    } as CollabPackage;

    // Increment view count
    try {
      await updateDoc(packageRef, {
        viewCount: increment(1)
      });
    } catch (error) {
      console.warn('Failed to increment view count:', error);
    }

    return packageData;

  } catch (error) {
    console.error('Error getting collaboration package:', error);
    throw error;
  }
}

/**
 * Get collaboration packages for a specific user
 */
export async function getCollabPackagesForUser(
  uid: string,
  limitCount: number = 10
): Promise<CollabPackage[]> {
  try {
    if (!uid) {
      throw new Error('User UID is required');
    }

    const packagesRef = collection(db, 'collabPackages');
    
    // Query for packages where user is creator or member
    const creatorQuery = query(
      packagesRef,
      where('createdBy', '==', uid),
      where('status', '!=', 'archived'),
      orderBy('status'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const memberQueries = [
      query(packagesRef, where('roles.artistUid', '==', uid), where('status', '!=', 'archived'), orderBy('status'), orderBy('createdAt', 'desc'), limit(limitCount)),
      query(packagesRef, where('roles.producerUid', '==', uid), where('status', '!=', 'archived'), orderBy('status'), orderBy('createdAt', 'desc'), limit(limitCount)),
      query(packagesRef, where('roles.engineerUid', '==', uid), where('status', '!=', 'archived'), orderBy('status'), orderBy('createdAt', 'desc'), limit(limitCount)),
      query(packagesRef, where('roles.videographerUid', '==', uid), where('status', '!=', 'archived'), orderBy('status'), orderBy('createdAt', 'desc'), limit(limitCount)),
      query(packagesRef, where('roles.studioUid', '==', uid), where('status', '!=', 'archived'), orderBy('status'), orderBy('createdAt', 'desc'), limit(limitCount))
    ];

    // Execute all queries
    const [creatorSnapshot, ...memberSnapshots] = await Promise.all([
      getDocs(creatorQuery),
      ...memberQueries.map(q => getDocs(q))
    ]);

    // Combine and deduplicate results
    const packageMap = new Map<string, CollabPackage>();

    // Add creator packages
    creatorSnapshot.docs.forEach(doc => {
      packageMap.set(doc.id, {
        id: doc.id,
        ...doc.data()
      } as CollabPackage);
    });

    // Add member packages
    memberSnapshots.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        if (!packageMap.has(doc.id)) {
          packageMap.set(doc.id, {
            id: doc.id,
            ...doc.data()
          } as CollabPackage);
        }
      });
    });

    // Convert to array and sort by creation date
    const packages = Array.from(packageMap.values()).sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return packages.slice(0, limitCount);

  } catch (error) {
    console.error('Error getting user collaboration packages:', error);
    throw error;
  }
}

/**
 * Get public collaboration packages with filters
 */
export async function getPublicCollabPackages(
  filters: CollabPackageFilters = {},
  limitCount: number = 20,
  lastDoc?: QueryDocumentSnapshot
): Promise<{packages: CollabPackage[], hasMore: boolean, lastDoc?: QueryDocumentSnapshot}> {
  try {
    const packagesRef = collection(db, 'collabPackages');
    let q = query(
      packagesRef,
      where('isPublic', '==', true),
      where('status', '==', 'active')
    );

    // Apply filters
    if (filters.packageType) {
      q = query(q, where('packageType', '==', filters.packageType));
    }

    if (filters.featured) {
      q = query(q, where('featured', '==', true));
    }

    if (filters.tags && filters.tags.length > 0) {
      q = query(q, where('tags', 'array-contains-any', filters.tags));
    }

    if (filters.genre && filters.genre.length > 0) {
      q = query(q, where('genre', 'array-contains-any', filters.genre));
    }

    // Add ordering and pagination
    q = query(q, orderBy('featured', 'desc'), orderBy('createdAt', 'desc'));
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    q = query(q, limit(limitCount + 1)); // Get one extra to check if there are more

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    
    const hasMore = docs.length > limitCount;
    const packages = docs.slice(0, limitCount).map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CollabPackage));

    // Apply client-side filters that can't be done in Firestore
    let filteredPackages = packages;

    if (filters.priceRange) {
      filteredPackages = filteredPackages.filter(pkg => 
        pkg.totalPrice >= filters.priceRange!.min && 
        pkg.totalPrice <= filters.priceRange!.max
      );
    }

    if (filters.duration) {
      filteredPackages = filteredPackages.filter(pkg => 
        pkg.durationMinutes >= filters.duration!.min && 
        pkg.durationMinutes <= filters.duration!.max
      );
    }

    if (filters.roles && filters.roles.length > 0) {
      filteredPackages = filteredPackages.filter(pkg => {
        const packageRoles = Object.keys(pkg.roles).map(role => 
          role.replace('Uid', '') as CollabPackageFilters['roles'][0]
        );
        return filters.roles!.some(role => packageRoles.includes(role));
      });
    }

    if (filters.location) {
      filteredPackages = filteredPackages.filter(pkg => 
        pkg.availableLocations?.some(loc => 
          loc.toLowerCase().includes(filters.location!.toLowerCase())
        )
      );
    }

    return {
      packages: filteredPackages,
      hasMore: hasMore && filteredPackages.length === limitCount,
      lastDoc: hasMore ? docs[limitCount - 1] : undefined
    };

  } catch (error) {
    console.error('Error getting public collaboration packages:', error);
    throw error;
  }
}

/**
 * Get featured collaboration packages
 */
export async function getFeaturedCollabPackages(limitCount: number = 6): Promise<CollabPackage[]> {
  try {
    const packagesRef = collection(db, 'collabPackages');
    const q = query(
      packagesRef,
      where('isPublic', '==', true),
      where('status', '==', 'active'),
      where('featured', '==', true),
      orderBy('viewCount', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const packages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CollabPackage));

    return packages;

  } catch (error) {
    console.error('Error getting featured collaboration packages:', error);
    throw error;
  }
}

/**
 * Search collaboration packages by text
 */
export async function searchCollabPackages(
  searchTerm: string,
  filters: CollabPackageFilters = {},
  limitCount: number = 20
): Promise<CollabPackage[]> {
  try {
    if (!searchTerm.trim()) {
      const result = await getPublicCollabPackages(filters, limitCount);
      return result.packages;
    }

    // Get all public packages (Firestore doesn't support full-text search)
    const packagesRef = collection(db, 'collabPackages');
    const q = query(
      packagesRef,
      where('isPublic', '==', true),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(100) // Get more for client-side filtering
    );

    const snapshot = await getDocs(q);
    const allPackages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CollabPackage));

    // Client-side text search
    const searchTermLower = searchTerm.toLowerCase();
    const matchingPackages = allPackages.filter(pkg => {
      return (
        pkg.title.toLowerCase().includes(searchTermLower) ||
        pkg.description.toLowerCase().includes(searchTermLower) ||
        pkg.tags.some(tag => tag.includes(searchTermLower)) ||
        pkg.genre?.some(g => g.toLowerCase().includes(searchTermLower)) ||
        Object.values(pkg.roleDetails || {}).some(detail => 
          detail?.name.toLowerCase().includes(searchTermLower)
        )
      );
    });

    // Apply additional filters
    let filteredPackages = matchingPackages;

    if (filters.roles && filters.roles.length > 0) {
      filteredPackages = filteredPackages.filter(pkg => {
        const packageRoles = Object.keys(pkg.roles).map(role => 
          role.replace('Uid', '') as CollabPackageFilters['roles'][0]
        );
        return filters.roles!.some(role => packageRoles.includes(role));
      });
    }

    if (filters.priceRange) {
      filteredPackages = filteredPackages.filter(pkg => 
        pkg.totalPrice >= filters.priceRange!.min && 
        pkg.totalPrice <= filters.priceRange!.max
      );
    }

    if (filters.packageType) {
      filteredPackages = filteredPackages.filter(pkg => pkg.packageType === filters.packageType);
    }

    // Sort by relevance (basic scoring)
    filteredPackages.sort((a, b) => {
      const scoreA = getSearchScore(a, searchTermLower);
      const scoreB = getSearchScore(b, searchTermLower);
      return scoreB - scoreA;
    });

    return filteredPackages.slice(0, limitCount);

  } catch (error) {
    console.error('Error searching collaboration packages:', error);
    throw error;
  }
}

/**
 * Get collaboration packages statistics for a user
 */
export async function getCollabPackageStats(uid: string): Promise<{
  total: number;
  active: number;
  draft: number;
  bookings: number;
  revenue: number;
}> {
  try {
    if (!uid) {
      throw new Error('User UID is required');
    }

    const packages = await getCollabPackagesForUser(uid, 100);
    
    const stats = {
      total: packages.length,
      active: packages.filter(pkg => pkg.status === 'active').length,
      draft: packages.filter(pkg => pkg.status === 'draft').length,
      bookings: packages.reduce((sum, pkg) => sum + (pkg.bookingCount || 0), 0),
      revenue: 0 // This would be calculated from actual bookings
    };

    return stats;

  } catch (error) {
    console.error('Error getting collaboration package stats:', error);
    throw error;
  }
}

/**
 * Helper function to calculate search relevance score
 */
function getSearchScore(collabPackage: CollabPackage, searchTerm: string): number {
  let score = 0;
  
  // Title matches are most important
  if (collabPackage.title.toLowerCase().includes(searchTerm)) {
    score += 10;
  }
  
  // Description matches
  if (collabPackage.description.toLowerCase().includes(searchTerm)) {
    score += 5;
  }
  
  // Tag matches
  score += collabPackage.tags.filter(tag => tag.includes(searchTerm)).length * 3;
  
  // Genre matches
  score += (collabPackage.genre || []).filter(g => g.toLowerCase().includes(searchTerm)).length * 2;
  
  // Creator name matches
  const creatorMatches = Object.values(collabPackage.roleDetails || {}).filter(detail => 
    detail?.name.toLowerCase().includes(searchTerm)
  ).length;
  score += creatorMatches * 4;
  
  // Boost for featured packages
  if (collabPackage.featured) {
    score += 2;
  }
  
  // Boost for packages with more bookings
  score += (collabPackage.bookingCount || 0) * 0.1;
  
  return score;
}
