import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, getDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { SCHEMA_FIELDS } from '../SCHEMA_FIELDS';

export interface EventTeamBooking {
  id: string;
  eventId: string;
  teamId: string;
  userId: string;
  bookingType: 'team' | 'individual';
  teamMembers: string[];
  eventDate: Date;
  eventTime: string;
  duration: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  equipment?: string[];
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createEventTeamBooking(
  bookingData: Omit<EventTeamBooking, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const eventBooking: Omit<EventTeamBooking, 'id'> = {
      ...bookingData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'eventBookings'), eventBooking);
    return docRef.id;
  } catch (error) {
    console.error('Error creating event team booking:', error);
    throw new Error('Failed to create event team booking');
  }
}

export async function getEventTeamBooking(bookingId: string): Promise<EventTeamBooking | null> {
  try {
    const docRef = doc(db, 'eventBookings', bookingId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as EventTeamBooking;
    }
    return null;
  } catch (error) {
    console.error('Error getting event team booking:', error);
    return null;
  }
}

export async function updateEventTeamBooking(
  bookingId: string,
  updates: Partial<EventTeamBooking>
): Promise<void> {
  try {
    const docRef = doc(db, 'eventBookings', bookingId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating event team booking:', error);
    throw new Error('Failed to update event team booking');
  }
}

export async function getEventBookingsByUser(userId: string): Promise<EventTeamBooking[]> {
  try {
    const q = query(
      collection(db, 'eventBookings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EventTeamBooking[];
  } catch (error) {
    console.error('Error getting event bookings by user:', error);
    return [];
  }
}

export async function getEventBookingsByEvent(eventId: string): Promise<EventTeamBooking[]> {
  try {
    const q = query(
      collection(db, 'eventBookings'),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EventTeamBooking[];
  } catch (error) {
    console.error('Error getting event bookings by event:', error);
    return [];
  }
}

export async function cancelEventTeamBooking(bookingId: string): Promise<void> {
  try {
    await updateEventTeamBooking(bookingId, {
      status: 'cancelled',
      paymentStatus: 'refunded'
    });
  } catch (error) {
    console.error('Error cancelling event team booking:', error);
    throw new Error('Failed to cancel event team booking');
  }
}

export async function confirmEventTeamBooking(bookingId: string): Promise<void> {
  try {
    await updateEventTeamBooking(bookingId, {
      status: 'confirmed',
      paymentStatus: 'paid'
    });
  } catch (error) {
    console.error('Error confirming event team booking:', error);
    throw new Error('Failed to confirm event team booking');
  }
}
