import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Unsubscribe } from 'firebase/firestore';
import { SplitBooking, BookingNotification } from '@/src/lib/types/Booking';
import { useAuth } from '@/lib/hooks/useAuth';

interface UseSplitBookingUpdatesProps {
  bookingId?: string;
  includeNotifications?: boolean;
}

interface SplitBookingUpdates {
  booking: SplitBooking | null;
  notifications: BookingNotification[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to listen for real-time updates on split bookings and related notifications
 */
export function useSplitBookingUpdates({ 
  bookingId, 
  includeNotifications = true 
}: UseSplitBookingUpdatesProps = {}): SplitBookingUpdates {
  const { user } = useAuth();
  const [booking, setBooking] = useState<SplitBooking | null>(null);
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    let unsubscribeBooking: Unsubscribe | null = null;
    let unsubscribeNotifications: Unsubscribe | null = null;

    const setupListeners = async () => {
      try {
        setLoading(true);
        setError(null);

        // Listen for specific booking updates
        if (bookingId) {
          const bookingRef = collection(db, 'splitBookings');
          const bookingQuery = query(
            bookingRef,
            where('__name__', '==', bookingId)
          );

          unsubscribeBooking = onSnapshot(
            bookingQuery,
            (snapshot) => {
              if (!snapshot.empty) {
                const bookingDoc = snapshot.docs[0];
                setBooking({
                  id: bookingDoc.id,
                  ...bookingDoc.data()
                } as SplitBooking);
              } else {
                setBooking(null);
              }
              setLoading(false);
            },
            (err) => {
              console.error('Error listening to booking updates:', err);
              setError('Failed to load booking updates');
              setLoading(false);
            }
          );
        }

        // Listen for notification updates
        if (includeNotifications) {
          const notificationsRef = collection(db, 'notifications', user.uid, 'userNotifications');
          const notificationsQuery = query(
            notificationsRef,
            where(SCHEMA_FIELDS.NOTIFICATION.TYPE, 'in', [
              'split_booking_invite',
              'split_booking_confirmed',
              'split_booking_cancelled',
              'talent_request',
              'talent_response',
              'payment_required',
              'session_reminder'
            ]),
            ...(bookingId ? [where(SCHEMA_FIELDS.REVIEW.BOOKING_ID, '==', bookingId)] : []),
            orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc')
          );

          unsubscribeNotifications = onSnapshot(
            notificationsQuery,
            (snapshot) => {
              const notificationsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as BookingNotification[];
              
              setNotifications(notificationsList);
              if (!bookingId) {
                setLoading(false);
              }
            },
            (err) => {
              console.error('Error listening to notification updates:', err);
              setError('Failed to load notification updates');
              if (!bookingId) {
                setLoading(false);
              }
            }
          );
        } else if (!bookingId) {
          setLoading(false);
        }

      } catch (err) {
        console.error('Error setting up real-time listeners:', err);
        setError('Failed to setup real-time updates');
        setLoading(false);
      }
    };

    setupListeners();

    // Cleanup function
    return () => {
      if (unsubscribeBooking) {
        unsubscribeBooking();
      }
      if (unsubscribeNotifications) {
        unsubscribeNotifications();
      }
    };
  }, [user?.uid, bookingId, includeNotifications]);

  return {
    booking,
    notifications,
    loading,
    error
  };
}

/**
 * Hook to listen for all split bookings for a user
 */
export function useSplitBookingsForUser() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<SplitBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const bookingsRef = collection(db, 'splitBookings');
    
    // Query for bookings where user is either clientA or clientB
    const clientAQuery = query(
      bookingsRef,
      where('clientAUid', '==', user.uid),
      orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc')
    );
    
    const clientBQuery = query(
      bookingsRef,
      where('clientBUid', '==', user.uid),
      orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc')
    );

    let unsubscribeA: Unsubscribe | null = null;
    let unsubscribeB: Unsubscribe | null = null;
    let bookingsA: SplitBooking[] = [];
    let bookingsB: SplitBooking[] = [];

    const mergeAndSetBookings = () => {
      const allBookings = [...bookingsA, ...bookingsB];
      // Remove duplicates and sort by creation date
      const uniqueBookings = Array.from(
        new Map(allBookings.map(booking => [booking.id, booking])).values()
      ).sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setBookings(uniqueBookings);
      setLoading(false);
    };

    try {
      setLoading(true);
      setError(null);

      unsubscribeA = onSnapshot(
        clientAQuery,
        (snapshot) => {
          bookingsA = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as SplitBooking[];
          mergeAndSetBookings();
        },
        (err) => {
          console.error('Error listening to client A bookings:', err);
          setError('Failed to load bookings');
          setLoading(false);
        }
      );

      unsubscribeB = onSnapshot(
        clientBQuery,
        (snapshot) => {
          bookingsB = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as SplitBooking[];
          mergeAndSetBookings();
        },
        (err) => {
          console.error('Error listening to client B bookings:', err);
          setError('Failed to load bookings');
          setLoading(false);
        }
      );

    } catch (err) {
      console.error('Error setting up bookings listeners:', err);
      setError('Failed to setup real-time updates');
      setLoading(false);
    }

    return () => {
      if (unsubscribeA) unsubscribeA();
      if (unsubscribeB) unsubscribeB();
    };
  }, [user?.uid]);

  return {
    bookings,
    loading,
    error
  };
}
