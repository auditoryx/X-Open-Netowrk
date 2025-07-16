import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { featuredCreatorsData } from '@/lib/data/featuredCreators';

export async function getFeaturedCreators() {
  try {
    const db = getFirestore(app);
    const q = query(
      collection(db, 'users'),
      where('verified', '==', true),
      orderBy(SCHEMA_FIELDS.USER.AVERAGE_RATING, 'desc'),
      limit(4)
    );
    const snap = await getDocs(q);
    const results = snap.docs.map(doc => ({ uid: doc.id, ...(doc.data() as any) }));
    
    // If no results from database, return sample data
    if (results.length === 0) {
      return featuredCreatorsData.slice(0, 7); // Return first 7 featured creators
    }
    
    return results;
  } catch (error) {
    console.warn('Error fetching featured creators from database, using sample data:', error);
    // Return sample data as fallback
    return featuredCreatorsData.slice(0, 7);
  }
}
