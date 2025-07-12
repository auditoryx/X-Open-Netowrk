import { firestore } from '@/lib/firebase/firebaseAdmin';
import { MentorshipStatus } from '@/lib/types/Mentorship';
import { doc, updateDoc, serverTimestamp, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

/**
 * Update a mentorship booking status
 * 
 * @param bookingId - The ID of the booking to update
 * @param status - The new status
 * @param additionalData - Any additional data to update
 * @returns Promise<void>
 */
export async function updateMentorshipBookingStatus(
  bookingId: string, 
  status: MentorshipStatus,
  additionalData: Record<string, any> = {}
): Promise<void> {
  const bookingRef = doc(firestore, 'mentorshipBookings', bookingId);
  
  // First check if the booking exists
  const bookingDoc = await getDoc(bookingRef);
  if (!bookingDoc.exists()) {
    throw new Error('Booking not found');
  }
  
  // Prepare update data
  const updateData = {
    status,
    updatedAt: serverTimestamp(),
    ...additionalData
  };
  
  // If status is completed, add completedAt timestamp
  if (status === 'completed') {
    updateData.completedAt = serverTimestamp();
  }
  
  // Update the booking
  await updateDoc(bookingRef, updateData);
}

/**
 * Provide feedback for a mentorship booking
 * 
 * @param bookingId - The ID of the booking
 * @param feedbackUrl - URL to the feedback (Loom, Dropbox, etc)
 * @param feedbackNotes - Optional notes about the feedback
 * @returns Promise<void>
 */
export async function provideMentorshipFeedback(
  bookingId: string,
  feedbackUrl: string,
  feedbackNotes?: string
): Promise<void> {
  return updateMentorshipBookingStatus(
    bookingId, 
    'feedback_ready', 
    {
      deliverableUrl: feedbackUrl,
      feedbackNotes: feedbackNotes || ''
    }
  );
}

/**
 * Get all mentorship bookings for a user (as client or creator)
 * 
 * @param userId - The user ID
 * @param role - 'client' or 'creator'
 * @returns Promise with array of bookings
 */
export async function getUserMentorshipBookings(
  userId: string,
  role: 'client' | 'creator'
) {
  const fieldToQuery = role === 'client' ? 'clientUid' : 'creatorUid';
  
  const bookingsQuery = query(
    collection(firestore, 'mentorshipBookings'),
    where(fieldToQuery, '==', userId),
    orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc')
  );
  
  const bookingsSnapshot = await getDocs(bookingsQuery);
  const bookings = [];
  
  bookingsSnapshot.forEach(doc => {
    bookings.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return bookings;
}
