import { db } from '@lib/firebase/init';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { sendBookingAccepted } from '@/functions/sendBookingAccepted';
import { sendReviewRequest } from '@/functions/sendReviewRequest';
import { createNotification } from '@/lib/firestore/createNotification';
import { logActivity } from '@/lib/firestore/logging/logActivity';

type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'in_progress' | 'completed' | 'cancelled' | 'disputed' | 'reviewed';

const validTransitions: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['paid', 'cancelled'],
  paid: ['in_progress', 'cancelled', 'disputed'],
  in_progress: ['completed', 'cancelled', 'disputed'],
  completed: ['reviewed', 'disputed'],
  cancelled: [], // Terminal state
  disputed: ['completed', 'cancelled'], // Admin can resolve disputes
  reviewed: [], // Terminal state
};

export async function updateBookingStatus(
  bookingId: string, 
  newStatus: BookingStatus, 
  clientEmail?: string, 
  clientId?: string,
  currentUserId?: string
) {
  try {
    // Validate transition
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }

    const currentStatus = bookingDoc.data().status as BookingStatus;
    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    // Update booking status
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    // Log status change
    if (currentUserId) {
      await logActivity(currentUserId, 'booking_status_changed', {
        bookingId,
        oldStatus: currentStatus,
        newStatus,
      });
    }

    // Handle status-specific actions
    if (newStatus === 'confirmed' && clientEmail && clientId) {
      await sendBookingAccepted(clientEmail, bookingId);
      await createNotification(clientId, 'booking_accepted', 'Your booking has been accepted!', bookingId);
    }

    if (newStatus === 'completed' && clientEmail && clientId) {
      await sendReviewRequest(clientEmail, bookingId);
      await createNotification(clientId, 'booking_completed', 'Please leave a review for your project!', bookingId);
    }

    console.log(`✅ Booking ${bookingId} status updated: ${currentStatus} → ${newStatus}`);
  } catch (error: any) {
    console.error(`❌ Failed to update booking status: ${error.message}`);
    throw error;
  }
}
