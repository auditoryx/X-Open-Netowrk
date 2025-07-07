// src/lib/firestore/bookings/markBookingAsCompleted.ts
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { createNotification } from '@/lib/firestore/createNotification';
import { logActivity } from '@/lib/firestore/logging/logActivity';
import { EnhancedXPService } from '@/lib/services/enhancedXPService';

export async function markBookingAsCompleted(bookingId: string, clientId: string, providerId: string) {
  const ref = doc(db, 'bookings', bookingId);
  await updateDoc(ref, {
    status: 'completed',
    completedAt: serverTimestamp(),
  });

  // Notify both parties to leave a review
  await createNotification(clientId, 'review_prompt', 'Your booking was completed. Leave a review!', bookingId);
  await createNotification(providerId, 'review_prompt', 'Client session finished. Leave a review too!', bookingId);

  // Award XP to provider for completing booking with enhanced validation
  const enhancedXPService = EnhancedXPService.getInstance();
  try {
    await enhancedXPService.awardXP(providerId, 'bookingCompleted', {
      contextId: `booking-${bookingId}`,
      metadata: {
        bookingId,
        clientId,
        completedAt: new Date().toISOString(),
        source: 'booking_completion'
      }
    });
  } catch (error) {
    console.error('Error awarding XP for booking completion:', error);
  }

  // Log it
  await logActivity(clientId, 'booking_completed', { bookingId });
  await logActivity(providerId, 'booking_completed', { bookingId });

  return true;
}
