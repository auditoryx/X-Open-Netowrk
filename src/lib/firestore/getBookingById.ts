import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface BookingData {
  id: string;
  clientUid: string;
  providerUid: string;
  clientName: string;
  providerName: string;
  serviceTitle: string;
  serviceDescription?: string;
  price: number;
  bookingDate: string;
  bookingTime?: string;
  duration?: number; // in minutes
  location?: string;
  isOnline?: boolean;
  status: 'pending' | 'accepted' | 'declined' | 'paid' | 'completed' | 'cancelled';
  createdAt: any;
  updatedAt: any;
  stripeSessionId?: string;
  paymentIntentId?: string;
  contractTerms?: string;
  notes?: string;
  tags?: string[];
  genre?: string;
  requirements?: string;
}

/**
 * Get a booking by its ID
 * @param bookingId - The booking ID to fetch
 * @returns Promise<BookingData | null>
 */
export async function getBookingById(bookingId: string): Promise<BookingData | null> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (!bookingSnap.exists()) {
      console.log(`Booking not found: ${bookingId}`);
      return null;
    }
    
    const data = bookingSnap.data();
    
    return {
      id: bookingSnap.id,
      clientUid: data.clientUid,
      providerUid: data.providerUid,
      clientName: data.clientName,
      providerName: data.providerName,
      serviceTitle: data.serviceTitle,
      serviceDescription: data.serviceDescription,
      price: data.price,
      bookingDate: data.bookingDate,
      bookingTime: data.bookingTime,
      duration: data.duration,
      location: data.location,
      isOnline: data.isOnline,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      stripeSessionId: data.stripeSessionId,
      paymentIntentId: data.paymentIntentId,
      contractTerms: data.contractTerms,
      notes: data.notes,
      tags: data.tags,
      genre: data.genre,
      requirements: data.requirements
    } as BookingData;
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
}
