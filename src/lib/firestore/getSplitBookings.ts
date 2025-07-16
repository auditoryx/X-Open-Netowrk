import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { SplitBooking, isUserInSplitBooking } from '@/src/lib/types/Booking';

/**
 * Get all split bookings for a specific user
 */
export async function getSplitBookingsForUser(uid: string): Promise<SplitBooking[]> {
  try {
    if (!uid) {
      throw new Error('User UID is required');
    }

    // Query bookings where user is clientA, clientB, or requested talent
    const bookingsRef = collection(db, 'splitBookings');
    
    // We need multiple queries since Firestore doesn't support OR queries across different fields
    const queries = [
      query(bookingsRef, where('clientAUid', '==', uid), orderBy('scheduledAt', 'desc')),
      query(bookingsRef, where('clientBUid', '==', uid), orderBy('scheduledAt', 'desc')),
    ];

    // Add talent queries if needed (these might be less common)
    const talentQueries = [
      query(bookingsRef, where('requestedTalent.artistId', '==', uid), orderBy('scheduledAt', 'desc')),
      query(bookingsRef, where('requestedTalent.producerId', '==', uid), orderBy('scheduledAt', 'desc')),
      query(bookingsRef, where('requestedTalent.engineerId', '==', uid), orderBy('scheduledAt', 'desc'))
    ];

    // Execute all queries
    const allQueries = [...queries, ...talentQueries];
    const queryPromises = allQueries.map(q => getDocs(q));
    const snapshots = await Promise.all(queryPromises);

    // Combine results and remove duplicates
    const bookingMap = new Map<string, SplitBooking>();
    
    for (const snapshot of snapshots) {
      snapshot.docs.forEach(doc => {
        const data = doc.data() as Omit<SplitBooking, 'id'>;
        const booking: SplitBooking = {
          id: doc.id,
          ...data,
          scheduledAt: data.scheduledAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
        
        // Only include bookings where user is actually involved
        if (isUserInSplitBooking(booking, uid)) {
          bookingMap.set(doc.id, booking);
        }
      });
    }

    return Array.from(bookingMap.values())
      .sort((a, b) => b.scheduledAt.toMillis() - a.scheduledAt.toMillis());

  } catch (error) {
    console.error('Error fetching split bookings for user:', error);
    throw error;
  }
}

/**
 * Get a specific split booking by ID
 */
export async function getSplitBookingById(bookingId: string): Promise<SplitBooking | null> {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const bookingRef = doc(db, 'splitBookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return null;
    }

    const data = bookingSnap.data() as Omit<SplitBooking, 'id'>;
    return {
      id: bookingSnap.id,
      ...data,
      scheduledAt: data.scheduledAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };

  } catch (error) {
    console.error('Error fetching split booking:', error);
    throw error;
  }
}

/**
 * Get all pending split bookings (for admin or studio management)
 */
export async function getPendingSplitBookings(): Promise<SplitBooking[]> {
  try {
    const bookingsRef = collection(db, 'splitBookings');
    const q = query(
      bookingsRef, 
      where(SCHEMA_FIELDS.BOOKING.STATUS, '==', 'pending'), 
      orderBy('scheduledAt', 'asc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<SplitBooking, 'id'>;
      return {
        id: doc.id,
        ...data,
        scheduledAt: data.scheduledAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });

  } catch (error) {
    console.error('Error fetching pending split bookings:', error);
    throw error;
  }
}

/**
 * Get split bookings for a specific studio
 */
export async function getSplitBookingsForStudio(studioId: string): Promise<SplitBooking[]> {
  try {
    if (!studioId) {
      throw new Error('Studio ID is required');
    }

    const bookingsRef = collection(db, 'splitBookings');
    const q = query(
      bookingsRef,
      where('studioId', '==', studioId),
      orderBy('scheduledAt', 'desc')
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<SplitBooking, 'id'>;
      return {
        id: doc.id,
        ...data,
        scheduledAt: data.scheduledAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });

  } catch (error) {
    console.error('Error fetching studio split bookings:', error);
    throw error;
  }
}

/**
 * Get upcoming split bookings for a user (next 30 days)
 */
export async function getUpcomingSplitBookings(uid: string): Promise<SplitBooking[]> {
  try {
    const allBookings = await getSplitBookingsForUser(uid);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return allBookings.filter(booking => {
      const scheduledDate = booking.scheduledAt.toDate();
      return scheduledDate >= now && scheduledDate <= thirtyDaysFromNow;
    }).sort((a, b) => a.scheduledAt.toMillis() - b.scheduledAt.toMillis());

  } catch (error) {
    console.error('Error fetching upcoming split bookings:', error);
    throw error;
  }
}
