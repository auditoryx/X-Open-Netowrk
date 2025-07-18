import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Log admin activities for audit trail compliance
 * Ensures all admin actions are tracked in activityLogs collection
 */
export async function logAdminActivity(adminUid: string, action: string, details: {
  targetUserId?: string;
  bookingId?: string;
  reason?: string;
  previousValue?: any;
  newValue?: any;
  [key: string]: any;
}, metadata: {
  ip?: string;
  userAgent?: string;
} = {}) {
  if (!adminUid || !action) {
    console.warn('logAdminActivity called with missing adminUid or action');
    return;
  }

  const logEntry = {
    actionType: `admin_${action}`,
    adminUid,
    timestamp: serverTimestamp(),
    details,
    metadata: {
      ip: metadata.ip || null,
      userAgent: metadata.userAgent || null,
      source: 'admin_panel',
    },
  };

  try {
    // Log to admin's activity log
    await addDoc(collection(db, 'activityLogs', adminUid, 'adminActions'), logEntry);
    
    // Also log to global admin actions collection for oversight
    await addDoc(collection(db, 'adminActions'), {
      ...logEntry,
      adminUid,
    });

    console.log(`✅ Admin activity logged: ${action} by ${adminUid}`);
  } catch (err: any) {
    console.error(`❌ Failed to log admin activity for ${adminUid}:`, err.message);
  }
}