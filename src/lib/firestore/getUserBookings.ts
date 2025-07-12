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

export interface UserBooking {
  id: string;
  clientUid: string;
  providerUid: string;
  clientName: string;
  providerName: string;
  serviceTitle: string;
  price: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'paid';
  bookingDate: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  stripeSessionId?: string;
  notes?: string;
}

/**
 * Get bookings for a user (as client or provider)
 * @param uid - User ID
 * @param role - 'client' or 'provider' or 'both'
 * @param limitCount - Number of bookings to return (default: 5)
 * @param status - Filter by status (optional)
 * @returns Promise<UserBooking[]>
 */
export async function getUserBookings(
  uid: string,
  role: 'client' | 'provider' | 'both' = 'both',
  limitCount: number = 5,
  status?: string
): Promise<UserBooking[]> {
  if (!uid) {
    throw new Error('User ID is required');
  }

  try {
    const db = getFirestore(app);
    const bookingsRef = collection(db, 'bookings');
    
    let bookings: UserBooking[] = [];

    // Fetch as provider
    if (role === 'provider' || role === 'both') {
      let providerQuery = query(
        bookingsRef,
        where('providerUid', '==', uid),
        orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'),
        limit(limitCount)
      );

      if (status) {
        providerQuery = query(
          bookingsRef,
          where('providerUid', '==', uid),
          where(SCHEMA_FIELDS.BOOKING.STATUS, '==', status),
          orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'),
          limit(limitCount)
        );
      }

      const providerSnapshot = await getDocs(providerQuery);
      const providerBookings = providerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserBooking[];

      bookings = [...bookings, ...providerBookings];
    }

    // Fetch as client
    if (role === 'client' || role === 'both') {
      let clientQuery = query(
        bookingsRef,
        where('clientUid', '==', uid),
        orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'),
        limit(limitCount)
      );

      if (status) {
        clientQuery = query(
          bookingsRef,
          where('clientUid', '==', uid),
          where(SCHEMA_FIELDS.BOOKING.STATUS, '==', status),
          orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'),
          limit(limitCount)
        );
      }

      const clientSnapshot = await getDocs(clientQuery);
      const clientBookings = clientSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserBooking[];

      bookings = [...bookings, ...clientBookings];
    }

    // Remove duplicates and sort by date
    const uniqueBookings = bookings.filter((booking, index, self) => 
      index === self.findIndex(b => b.id === booking.id)
    );

    return uniqueBookings
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      .slice(0, limitCount);

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw new Error('Failed to fetch bookings');
  }
}

/**
 * Get booking statistics for a user
 * @param uid - User ID
 * @param role - 'client' or 'provider' or 'both'
 * @returns Promise<{total: number, pending: number, active: number, completed: number}>
 */
export async function getUserBookingStats(
  uid: string,
  role: 'client' | 'provider' | 'both' = 'both'
): Promise<{
  total: number;
  pending: number;
  active: number;
  completed: number;
}> {
  try {
    const allBookings = await getUserBookings(uid, role, 100); // Get more for stats
    
    const stats = {
      total: allBookings.length,
      pending: allBookings.filter(b => b.status === 'pending').length,
      active: allBookings.filter(b => ['accepted', 'paid'].includes(b.status)).length,
      completed: allBookings.filter(b => b.status === 'completed').length,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    return { total: 0, pending: 0, active: 0, completed: 0 };
  }
}

export default getUserBookings;
