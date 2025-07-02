import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

export interface Notification {
  id: string;
  uid: string;
  type: 'booking_request' | 'booking_confirmed' | 'booking_completed' | 'message_received' | 'review_received' | 'payment_received';
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  data?: {
    bookingId?: string;
    messageId?: string;
    userId?: string;
    amount?: number;
    [key: string]: any;
  };
  actionUrl?: string;
}

/**
 * Get notifications for a user
 * @param uid - User ID
 * @param limitCount - Number of notifications to return (default: 20)
 * @param unreadOnly - Whether to fetch only unread notifications (default: false)
 * @returns Promise<Notification[]>
 */
export async function getNotifications(
  uid: string, 
  limitCount: number = 20,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  if (!uid) {
    throw new Error('User ID is required');
  }

  try {
    const db = getFirestore(app);
    const notificationsRef = collection(db, 'notifications', uid, 'items');
    
    let q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    // Filter for unread only if specified
    if (unreadOnly) {
      q = query(
        notificationsRef,
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error('Failed to fetch notifications');
  }
}

/**
 * Get unread notification count for a user
 * @param uid - User ID
 * @returns Promise<number>
 */
export async function getUnreadNotificationCount(uid: string): Promise<number> {
  if (!uid) return 0;

  try {
    const unreadNotifications = await getNotifications(uid, 100, true);
    return unreadNotifications.length;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

/**
 * Get a single notification by ID
 * @param uid - User ID
 * @param notificationId - Notification ID
 * @returns Promise<Notification | null>
 */
export async function getNotification(uid: string, notificationId: string): Promise<Notification | null> {
  if (!uid || !notificationId) return null;

  try {
    const db = getFirestore(app);
    const notificationRef = doc(db, 'notifications', uid, 'items', notificationId);
    const snapshot = await getDoc(notificationRef);
    
    if (!snapshot.exists()) return null;
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Notification;
  } catch (error) {
    console.error('Error fetching notification:', error);
    return null;
  }
}

export default getNotifications;
