import { db } from '@/firebase/firebaseConfig';
import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc
} from 'firebase/firestore';

/**
 * Updates the seenBy array for a specific message
 * @param bookingId - The booking ID containing the message
 * @param messageId - The specific message ID to update
 * @param userId - The user ID to add to seenBy array
 */
export const updateMessageSeenStatus = async (
  bookingId: string,
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    const messageRef = doc(db, 'bookings', bookingId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      console.warn(`Message ${messageId} not found`);
      return;
    }

    const messageData = messageDoc.data();
    const currentSeenBy = messageData.seenBy || [];
    
    // Only update if user hasn't already seen the message
    if (!currentSeenBy.includes(userId)) {
      await updateDoc(messageRef, {
        seenBy: arrayUnion(userId),
        seen: true // Keep backwards compatibility
      });
    }
  } catch (error) {
    console.error('Error updating message seen status:', error);
    throw error;
  }
};

/**
 * Bulk update seen status for multiple messages
 * @param bookingId - The booking ID containing the messages
 * @param messageIds - Array of message IDs to mark as seen
 * @param userId - The user ID to add to seenBy arrays
 */
export const bulkUpdateSeenStatus = async (
  bookingId: string,
  messageIds: string[],
  userId: string
): Promise<void> => {
  try {
    const updatePromises = messageIds.map(messageId =>
      updateMessageSeenStatus(bookingId, messageId, userId)
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error bulk updating seen status:', error);
    throw error;
  }
};

/**
 * Check if a message has been seen by a specific user
 * @param message - The message object
 * @param userId - The user ID to check
 * @returns boolean indicating if the user has seen the message
 */
export const hasUserSeenMessage = (
  message: { seenBy?: string[]; seen?: boolean },
  userId: string
): boolean => {
  // Check new seenBy array first, fall back to legacy seen boolean
  if (message.seenBy && Array.isArray(message.seenBy)) {
    return message.seenBy.includes(userId);
  }
  
  // Legacy fallback
  return message.seen || false;
};

/**
 * Get the count of users who have seen a message
 * @param message - The message object
 * @returns number of users who have seen the message
 */
export const getSeenCount = (message: { seenBy?: string[] }): number => {
  return message.seenBy ? message.seenBy.length : 0;
};
