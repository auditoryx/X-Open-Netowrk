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
