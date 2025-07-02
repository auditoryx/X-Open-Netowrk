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

export interface MessageThread {
  id: string;
  participants: string[];
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: Timestamp;
  };
  unreadCount?: number;
  bookingId?: string;
}

/**
 * Get recent message threads for a user
 * @param uid - User ID
 * @param limitCount - Number of threads to return (default: 5)
 * @returns Promise<MessageThread[]>
 */
export async function getUserMessages(uid: string, limitCount: number = 5): Promise<MessageThread[]> {
  if (!uid) {
    throw new Error('User ID is required');
  }

  try {
    const db = getFirestore(app);
    
    // Query message threads where user is a participant
    const threadsRef = collection(db, 'messageThreads');
    const q = query(
      threadsRef,
      where('participants', 'array-contains', uid),
      orderBy('lastMessage.timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MessageThread[];
  } catch (error) {
    console.error('Error fetching user messages:', error);
    throw new Error('Failed to fetch messages');
  }
}

/**
 * Get unread message count for a user
 * @param uid - User ID
 * @returns Promise<number>
 */
export async function getUnreadMessageCount(uid: string): Promise<number> {
  if (!uid) return 0;

  try {
    const db = getFirestore(app);
    const threadsRef = collection(db, 'messageThreads');
    const q = query(
      threadsRef,
      where('participants', 'array-contains', uid),
      where(`unreadCounts.${uid}`, '>', 0)
    );

    const snapshot = await getDocs(q);
    
    // Sum up unread counts across all threads
    return snapshot.docs.reduce((total, doc) => {
      const data = doc.data();
      return total + (data.unreadCounts?.[uid] || 0);
    }, 0);
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

export default getUserMessages;
