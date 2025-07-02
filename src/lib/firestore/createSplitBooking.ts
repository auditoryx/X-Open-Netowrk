import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { SplitBooking, calculatePaymentShares, BookingNotification } from '@/src/lib/types/Booking';
import { getUserProfile } from '@/src/lib/firestore/getUserProfile';

export interface CreateSplitBookingData {
  studioId: string;
  clientAUid: string;
  clientBUid: string;
  splitRatio: number;
  scheduledAt: Date;
  durationMinutes: number;
  totalCost: number;
  sessionTitle?: string;
  sessionDescription?: string;
  requestedTalent?: {
    artistId?: string;
    producerId?: string;
    engineerId?: string;
  };
}

/**
 * Create a split studio booking with dual clients and optional talent requests
 */
export async function createSplitBooking(
  bookingData: CreateSplitBookingData,
  createdBy: string
): Promise<string> {
  try {
    // Validate input data
    if (!bookingData.studioId || !bookingData.clientAUid || !bookingData.clientBUid) {
      throw new Error('Studio ID and both client UIDs are required');
    }

    if (bookingData.clientAUid === bookingData.clientBUid) {
      throw new Error('Cannot create split booking with the same user twice');
    }

    if (bookingData.splitRatio <= 0 || bookingData.splitRatio >= 1) {
      throw new Error('Split ratio must be between 0 and 1');
    }

    if (bookingData.totalCost <= 0) {
      throw new Error('Total cost must be greater than 0');
    }

    // Calculate payment shares
    const { clientAShare, clientBShare } = calculatePaymentShares(
      bookingData.totalCost,
      bookingData.splitRatio
    );

    // Get studio details
    const studioRef = doc(db, 'studios', bookingData.studioId);
    const studioSnap = await getDoc(studioRef);
    const studioData = studioSnap.exists() ? studioSnap.data() : null;

    // Prepare talent status if talent is requested
    const talentStatus = bookingData.requestedTalent ? {
      ...(bookingData.requestedTalent.artistId && { artist: 'pending' as const }),
      ...(bookingData.requestedTalent.producerId && { producer: 'pending' as const }),
      ...(bookingData.requestedTalent.engineerId && { engineer: 'pending' as const })
    } : undefined;

    // Create the split booking
    const splitBooking: Omit<SplitBooking, 'id'> = {
      studioId: bookingData.studioId,
      clientAUid: bookingData.clientAUid,
      clientBUid: bookingData.clientBUid,
      splitRatio: bookingData.splitRatio,
      scheduledAt: bookingData.scheduledAt as any, // Firestore will convert to Timestamp
      durationMinutes: bookingData.durationMinutes,
      totalCost: bookingData.totalCost,
      clientAShare,
      clientBShare,
      sessionTitle: bookingData.sessionTitle || 'Split Studio Session',
      sessionDescription: bookingData.sessionDescription,
      requestedTalent: bookingData.requestedTalent,
      talentStatus,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy,
      clientAPaymentStatus: 'pending',
      clientBPaymentStatus: 'pending',
      studioName: studioData?.name || 'Unknown Studio',
      studioLocation: studioData?.location || 'Unknown Location'
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'splitBookings'), splitBooking);
    const bookingId = docRef.id;

    // Send notifications
    await sendBookingNotifications(bookingId, splitBooking, createdBy);

    console.log('Split booking created:', bookingId);
    return bookingId;

  } catch (error) {
    console.error('Error creating split booking:', error);
    throw error;
  }
}

/**
 * Send notifications to all parties involved in the booking
 */
async function sendBookingNotifications(
  bookingId: string,
  booking: Omit<SplitBooking, 'id'>,
  createdBy: string
) {
  try {
    const creatorProfile = await getUserProfile(createdBy);
    const creatorName = creatorProfile?.name || creatorProfile?.displayName || 'Unknown User';

    const notifications: Omit<BookingNotification, 'id'>[] = [];

    // Notify the co-client (the one who didn't create the booking)
    const coClientUid = booking.clientAUid === createdBy ? booking.clientBUid : booking.clientAUid;
    const coClientShare = booking.clientAUid === createdBy ? booking.clientBShare : booking.clientAShare;
    
    notifications.push({
      recipientUid: coClientUid,
      type: 'split_booking_invite',
      bookingId,
      senderUid: createdBy,
      senderName: creatorName,
      title: 'Studio Session Collaboration Invite',
      message: `${creatorName} invited you to split a studio session at ${booking.studioName}. Your share: $${coClientShare}`,
      read: false,
      createdAt: serverTimestamp(),
      data: {
        studioName: booking.studioName,
        scheduledAt: booking.scheduledAt,
        splitRatio: booking.splitRatio
      }
    });

    // Notify requested talent
    if (booking.requestedTalent) {
      const talentRoles = [
        { uid: booking.requestedTalent.artistId, role: 'artist' },
        { uid: booking.requestedTalent.producerId, role: 'producer' },
        { uid: booking.requestedTalent.engineerId, role: 'engineer' }
      ];

      for (const talent of talentRoles) {
        if (talent.uid) {
          notifications.push({
            recipientUid: talent.uid,
            type: 'talent_request',
            bookingId,
            senderUid: createdBy,
            senderName: creatorName,
            title: `Studio Session ${talent.role.charAt(0).toUpperCase() + talent.role.slice(1)} Request`,
            message: `${creatorName} requested you as ${talent.role} for a studio session at ${booking.studioName}`,
            read: false,
            createdAt: serverTimestamp(),
            data: {
              studioName: booking.studioName,
              scheduledAt: booking.scheduledAt,
              talentRole: talent.role
            }
          });
        }
      }
    }

    // Save all notifications
    const notificationsPromises = notifications.map(notification =>
      addDoc(collection(db, 'notifications'), notification)
    );

    await Promise.all(notificationsPromises);
    console.log('Booking notifications sent');

  } catch (error) {
    console.error('Error sending notifications:', error);
    // Don't throw here - booking creation should succeed even if notifications fail
  }
}
