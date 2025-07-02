import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

export interface UserService {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: 'active' | 'paused' | 'draft';
  creatorId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  bookingCount?: number;
  imageUrl?: string;
  duration?: string;
  tags?: string[];
}

/**
 * Get services created by a user
 * @param uid - User ID (creator)
 * @param limitCount - Number of services to return (default: 10)
 * @param status - Filter by status (optional)
 * @returns Promise<UserService[]>
 */
export async function getUserServices(
  uid: string, 
  limitCount: number = 10,
  status?: 'active' | 'paused' | 'draft'
): Promise<UserService[]> {
  if (!uid) {
    throw new Error('User ID is required');
  }

  try {
    const db = getFirestore(app);
    const servicesRef = collection(db, 'services');
    
    let q = query(
      servicesRef,
      where('creatorId', '==', uid),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );

    // Add status filter if provided
    if (status) {
      q = query(
        servicesRef,
        where('creatorId', '==', uid),
        where('status', '==', status),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserService[];
  } catch (error) {
    console.error('Error fetching user services:', error);
    throw new Error('Failed to fetch services');
  }
}

/**
 * Get service statistics for a user
 * @param uid - User ID (creator)
 * @returns Promise<{total: number, active: number, paused: number, draft: number}>
 */
export async function getUserServiceStats(uid: string): Promise<{
  total: number;
  active: number;
  paused: number;
  draft: number;
}> {
  if (!uid) {
    return { total: 0, active: 0, paused: 0, draft: 0 };
  }

  try {
    const db = getFirestore(app);
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, where('creatorId', '==', uid));

    const snapshot = await getDocs(q);
    const services = snapshot.docs.map(doc => doc.data());

    const stats = {
      total: services.length,
      active: services.filter(s => s.status === 'active').length,
      paused: services.filter(s => s.status === 'paused').length,
      draft: services.filter(s => s.status === 'draft').length,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching service stats:', error);
    return { total: 0, active: 0, paused: 0, draft: 0 };
  }
}

export default getUserServices;
