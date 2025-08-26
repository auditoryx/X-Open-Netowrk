import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  increment,
  Timestamp 
} from 'firebase/firestore';
import { CollabBooking, CollabPackage, calculateRevenueSplit } from '@/lib/types/CollabPackage';
import { getCollabPackageById } from './getCollabPackages';
import { getUserProfile } from '@/lib/firestore/getUserProfile';

export interface CreateCollabBookingData {
  collabPackageId: string;
  scheduledAt: Date | Timestamp;
  durationMinutes?: number; // Override package duration if needed
  location?: string;
  venue?: string;
  address?: string;
  requirements?: string;
  clientNotes?: string;
}

/**
 * Create a new collaboration booking
 */
export async function createCollabBooking(
  bookingData: CreateCollabBookingData,
  clientUid: string
): Promise<string> {
  try {
    if (!clientUid) {
      throw new Error('Client UID is required');
    }

    if (!bookingData.collabPackageId) {
      throw new Error('Collaboration package ID is required');
    }

    // Get the collaboration package
    const collabPackage = await getCollabPackageById(bookingData.collabPackageId);
    if (!collabPackage) {
      throw new Error('Collaboration package not found');
    }

    if (collabPackage.status !== 'active') {
      throw new Error('Collaboration package is not available for booking');
    }

    // Get client profile
    const clientProfile = await getUserProfile(clientUid);
    if (!clientProfile) {
      throw new Error('Client profile not found');
    }

    // Calculate booking details
    const scheduledAt = bookingData.scheduledAt instanceof Date 
      ? Timestamp.fromDate(bookingData.scheduledAt)
      : bookingData.scheduledAt;
    
    const duration = bookingData.durationMinutes || collabPackage.durationMinutes;
    const endTime = new Timestamp(
      scheduledAt.seconds + (duration * 60),
      scheduledAt.nanoseconds
    );

    // Get all member UIDs and their roles
    const memberUids: string[] = [];
    const memberRoles: { [uid: string]: string } = {};

    Object.entries(collabPackage.roles).forEach(([role, uid]) => {
      if (uid) {
        memberUids.push(uid);
        memberRoles[uid] = role.replace('Uid', ''); // Remove 'Uid' suffix
      }
    });

    // Calculate revenue split
    const revenueSplit = calculateRevenueSplit(
      collabPackage.totalPrice,
      collabPackage.priceBreakdown
    );

    // Create the booking
    const booking: Omit<CollabBooking, 'id'> = {
      clientUid,
      collabPackageId: bookingData.collabPackageId,
      packageTitle: collabPackage.title,
      memberUids,
      memberRoles,
      status: 'pending',
      scheduledAt,
      endTime,
      totalPrice: collabPackage.totalPrice,
      paymentStatus: 'pending',
      location: bookingData.location,
      venue: bookingData.venue,
      address: bookingData.address,
      requirements: bookingData.requirements,
      clientNotes: bookingData.clientNotes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      revenueSplit
    };

    // Save to Firestore
    const bookingsRef = collection(db, 'collabBookings');
    const docRef = await addDoc(bookingsRef, booking);

    // Update package booking count
    try {
      const packageRef = doc(db, 'collabPackages', bookingData.collabPackageId);
      await updateDoc(packageRef, {
        bookingCount: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.warn('Failed to update package booking count:', error);
    }

    // Send notifications to all package members
    await sendBookingNotifications(docRef.id, booking, collabPackage, clientProfile);

    console.log('Collaboration booking created:', docRef.id);
    return docRef.id;

  } catch (error) {
    console.error('Error creating collaboration booking:', error);
    throw error;
  }
}

/**
 * Update collaboration booking status
 */
export async function updateCollabBookingStatus(
  bookingId: string,
  status: CollabBooking['status'],
  updatedBy: string,
  notes?: string
): Promise<void> {
  try {
    if (!bookingId || !updatedBy) {
      throw new Error('Booking ID and updater UID are required');
    }

    // Get current booking
    const bookingRef = doc(db, 'collabBookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);
    
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }

    const booking = bookingDoc.data() as CollabBooking;

    // Verify permissions
    const canUpdate = booking.clientUid === updatedBy || 
                     booking.memberUids.includes(updatedBy);
    
    if (!canUpdate) {
      throw new Error('Unauthorized to update this booking');
    }

    // Update the booking
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };

    if (notes) {
      updateData.teamNotes = notes;
    }

    await updateDoc(bookingRef, updateData);

    // Send status update notifications
    await sendStatusUpdateNotifications(bookingId, booking, status, updatedBy);

    console.log('Collaboration booking status updated:', bookingId, status);

  } catch (error) {
    console.error('Error updating collaboration booking status:', error);
    throw error;
  }
}

/**
 * Cancel collaboration booking
 */
export async function cancelCollabBooking(
  bookingId: string,
  cancelledBy: string,
  reason?: string
): Promise<void> {
  try {
    await updateCollabBookingStatus(bookingId, 'cancelled', cancelledBy, reason);
    
    // Additional cancellation logic could go here
    // (e.g., refund processing, calendar updates)
    
  } catch (error) {
    console.error('Error cancelling collaboration booking:', error);
    throw error;
  }
}

/**
 * Send booking notifications to all package members
 */
async function sendBookingNotifications(
  bookingId: string,
  booking: Omit<CollabBooking, 'id'>,
  collabPackage: CollabPackage,
  clientProfile: any
): Promise<void> {
  try {
    const memberUids = booking.memberUids;
    
    if (memberUids.length === 0) {
      return;
    }

    const clientName = clientProfile.name || clientProfile.displayName || 'A client';
    const scheduledDate = booking.scheduledAt.toDate().toLocaleDateString();
    const scheduledTime = booking.scheduledAt.toDate().toLocaleTimeString();

    // Send notifications to each member
    const notificationPromises = memberUids.map(async (memberUid) => {
      try {
        const memberRole = booking.memberRoles[memberUid];
        
        const notificationData = {
          type: 'collab_booking_request',
          title: 'New Collaboration Booking',
          message: `${clientName} booked your collaboration package "${booking.packageTitle}" for ${scheduledDate} at ${scheduledTime}`,
          data: {
            bookingId,
            packageId: booking.collabPackageId,
            packageTitle: booking.packageTitle,
            clientName,
            clientUid: booking.clientUid,
            memberRole,
            scheduledAt: booking.scheduledAt,
            totalPrice: booking.totalPrice,
            memberShare: booking.revenueSplit?.[memberUid] || 0
          },
          read: false,
          createdAt: serverTimestamp()
        };

        const userNotificationsRef = collection(db, 'notifications', memberUid, 'userNotifications');
        await addDoc(userNotificationsRef, notificationData);
        
      } catch (error) {
        console.error(`Failed to send booking notification to ${memberUid}:`, error);
      }
    });

    await Promise.all(notificationPromises);
    console.log(`Sent booking notifications to ${memberUids.length} members`);

  } catch (error) {
    console.error('Error sending booking notifications:', error);
  }
}

/**
 * Send status update notifications
 */
async function sendStatusUpdateNotifications(
  bookingId: string,
  booking: CollabBooking,
  newStatus: CollabBooking['status'],
  updatedBy: string
): Promise<void> {
  try {
    // Get updater info
    let updaterName = 'Someone';
    try {
      const updaterProfile = await getUserProfile(updatedBy);
      updaterName = updaterProfile?.name || updaterProfile?.displayName || updaterName;
    } catch (error) {
      console.warn('Failed to get updater profile:', error);
    }

    // Determine who to notify (everyone except the updater)
    const notifyUids = [booking.clientUid, ...booking.memberUids].filter(uid => uid !== updatedBy);

    if (notifyUids.length === 0) {
      return;
    }

    const statusMessages = {
      confirmed: `${updaterName} confirmed the collaboration booking for "${booking.packageTitle}"`,
      in_progress: `The collaboration session "${booking.packageTitle}" is now in progress`,
      completed: `The collaboration session "${booking.packageTitle}" has been completed`,
      cancelled: `${updaterName} cancelled the collaboration booking for "${booking.packageTitle}"`
    };

    const message = statusMessages[newStatus] || `Booking status updated to ${newStatus}`;

    // Send notifications
    const notificationPromises = notifyUids.map(async (uid) => {
      try {
        const notificationData = {
          type: 'collab_booking_status_update',
          title: 'Booking Status Update',
          message,
          data: {
            bookingId,
            packageTitle: booking.packageTitle,
            newStatus,
            updatedBy,
            updaterName
          },
          read: false,
          createdAt: serverTimestamp()
        };

        const userNotificationsRef = collection(db, 'notifications', uid, 'userNotifications');
        await addDoc(userNotificationsRef, notificationData);
        
      } catch (error) {
        console.error(`Failed to send status update notification to ${uid}:`, error);
      }
    });

    await Promise.all(notificationPromises);
    console.log(`Sent status update notifications to ${notifyUids.length} users`);

  } catch (error) {
    console.error('Error sending status update notifications:', error);
  }
}
