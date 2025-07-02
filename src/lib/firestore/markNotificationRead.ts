import { 
  getFirestore, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

/**
 * Mark a notification as read
 * @param uid - User ID
 * @param notificationId - Notification ID
 * @returns Promise<void>
 */
export async function markNotificationRead(uid: string, notificationId: string): Promise<void> {
  if (!uid || !notificationId) {
    throw new Error('User ID and notification ID are required');
  }

  try {
    const db = getFirestore(app);
    const notificationRef = doc(db, 'notifications', uid, 'items', notificationId);
    
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
    
    console.log(`Notification ${notificationId} marked as read for user ${uid}`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
}

/**
 * Mark multiple notifications as read
 * @param uid - User ID
 * @param notificationIds - Array of notification IDs
 * @returns Promise<void>
 */
export async function markNotificationsRead(uid: string, notificationIds: string[]): Promise<void> {
  if (!uid || !notificationIds.length) {
    throw new Error('User ID and notification IDs are required');
  }

  try {
    const db = getFirestore(app);
    const updatePromises = notificationIds.map(notificationId => {
      const notificationRef = doc(db, 'notifications', uid, 'items', notificationId);
      return updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
    });
    
    await Promise.all(updatePromises);
    
    console.log(`${notificationIds.length} notifications marked as read for user ${uid}`);
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw new Error('Failed to mark notifications as read');
  }
}

/**
 * Mark all notifications as read for a user
 * @param uid - User ID
 * @returns Promise<void>
 */
export async function markAllNotificationsRead(uid: string): Promise<void> {
  if (!uid) {
    throw new Error('User ID is required');
  }

  try {
    // First get all unread notifications
    const { getNotifications } = await import('./getNotifications');
    const unreadNotifications = await getNotifications(uid, 100, true);
    
    if (unreadNotifications.length === 0) {
      return; // No unread notifications
    }
    
    const notificationIds = unreadNotifications.map(n => n.id);
    await markNotificationsRead(uid, notificationIds);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error('Failed to mark all notifications as read');
  }
}

export default markNotificationRead;
