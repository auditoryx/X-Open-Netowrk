import { 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc 
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

interface SendMessageParams {
  bookingId: string;
  senderUid: string;
  senderName: string;
  text: string;
}

export const sendMessage = async ({ 
  bookingId, 
  senderUid, 
  senderName, 
  text 
}: SendMessageParams) => {
  try {
    // Verify booking exists and user has access
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }

    const booking = bookingSnap.data();
    
    // Check if user is either client or provider
    if (senderUid !== booking.clientUid && senderUid !== booking.providerUid) {
      throw new Error('Unauthorized: You are not part of this booking');
    }

    // Add message to chat collection
    const messagesRef = collection(db, 'chats', bookingId, 'messages');
    
    await addDoc(messagesRef, {
      senderUid,
      senderName,
      text: text.trim(),
      sentAt: serverTimestamp(),
      seen: false,
      // Include booking participant IDs for security rules
      clientUid: booking.clientUid,
      providerUid: booking.providerUid,
    });

    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
