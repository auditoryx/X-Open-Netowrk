import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { getSplitBookingById } from './getSplitBookings';
import { getUserProfile } from '@/lib/firestore/getUserProfile';
import { BookingNotification } from '@/lib/types/Booking';

/**
 * Update talent response to a booking request
 */
export async function updateTalentResponse(
  bookingId: string,
  talentUid: string,
  talentRole: 'artist' | 'producer' | 'engineer',
  response: 'accepted' | 'rejected',
  message?: string
): Promise<void> {
  try {
    if (!bookingId || !talentUid || !talentRole || !response) {
      throw new Error('Missing required parameters for talent response');
    }

    // Get the current booking
    const booking = await getSplitBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Verify the talent is actually requested for this role
    const requestedTalentId = booking.requestedTalent?.[`${talentRole}Id`];
    if (requestedTalentId !== talentUid) {
      throw new Error('Talent not requested for this role in this booking');
    }

    // Update the talent status
    const bookingRef = doc(db, 'splitBookings', bookingId);
    const updateData = {
      [`talentStatus.${talentRole}`]: response,
      updatedAt: serverTimestamp()
    };

    await updateDoc(bookingRef, updateData);

    // Send notifications to both clients about the talent response
    await sendTalentResponseNotifications(booking, talentUid, talentRole, response, message);

    console.log(`Talent ${talentRole} response updated:`, response);

  } catch (error) {
    console.error('Error updating talent response:', error);
    throw error;
  }
}

/**
 * Send notifications about talent response to clients
 */
async function sendTalentResponseNotifications(
  booking: any,
  talentUid: string,
  talentRole: 'artist' | 'producer' | 'engineer',
  response: 'accepted' | 'rejected',
  message?: string
) {
  try {
    const talentProfile = await getUserProfile(talentUid);
    const talentName = talentProfile?.name || talentProfile?.displayName || 'Unknown User';

    const notificationTitle = response === 'accepted' 
      ? `${talentRole.charAt(0).toUpperCase() + talentRole.slice(1)} Accepted Session`
      : `${talentRole.charAt(0).toUpperCase() + talentRole.slice(1)} Declined Session`;

    const notificationMessage = response === 'accepted'
      ? `${talentName} accepted your request to be the ${talentRole} for your studio session${message ? `: "${message}"` : ''}`
      : `${talentName} declined your request to be the ${talentRole} for your studio session${message ? `: "${message}"` : ''}`;

    const notifications: Omit<BookingNotification, 'id'>[] = [];

    // Notify both clients
    [booking.clientAUid, booking.clientBUid].forEach(clientUid => {
      notifications.push({
        recipientUid: clientUid,
        type: 'talent_response',
        bookingId: booking.id || '',
        senderUid: talentUid,
        senderName: talentName,
        title: notificationTitle,
        message: notificationMessage,
        read: false,
        createdAt: serverTimestamp(),
        data: {
          studioName: booking.studioName,
          scheduledAt: booking.scheduledAt,
          talentRole
        }
      });
    });

    // Save notifications
    const notificationPromises = notifications.map(notification =>
      addDoc(collection(db, 'notifications'), notification)
    );

    await Promise.all(notificationPromises);

  } catch (error) {
    console.error('Error sending talent response notifications:', error);
    // Don't throw - the main response update should succeed even if notifications fail
  }
}

/**
 * Request specific talent for an existing booking
 */
export async function requestTalentForBooking(
  bookingId: string,
  talentUid: string,
  talentRole: 'artist' | 'producer' | 'engineer',
  requestedBy: string,
  message?: string
): Promise<void> {
  try {
    if (!bookingId || !talentUid || !talentRole || !requestedBy) {
      throw new Error('Missing required parameters for talent request');
    }

    // Get the current booking
    const booking = await getSplitBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Verify the requester is involved in the booking
    if (booking.clientAUid !== requestedBy && booking.clientBUid !== requestedBy) {
      throw new Error('Only booking participants can request talent');
    }

    // Update the booking with the talent request
    const bookingRef = doc(db, 'splitBookings', bookingId);
    const updateData = {
      [`requestedTalent.${talentRole}Id`]: talentUid,
      [`talentStatus.${talentRole}`]: 'pending',
      updatedAt: serverTimestamp()
    };

    await updateDoc(bookingRef, updateData);

    // Send notification to the requested talent
    await sendTalentRequestNotification(booking, talentUid, talentRole, requestedBy, message);

    console.log('Talent request sent:', { talentRole, talentUid, bookingId });

  } catch (error) {
    console.error('Error requesting talent for booking:', error);
    throw error;
  }
}

/**
 * Send notification to requested talent
 */
async function sendTalentRequestNotification(
  booking: any,
  talentUid: string,
  talentRole: 'artist' | 'producer' | 'engineer',
  requestedBy: string,
  message?: string
) {
  try {
    const requesterProfile = await getUserProfile(requestedBy);
    const requesterName = requesterProfile?.name || requesterProfile?.displayName || 'Unknown User';

    const notification: Omit<BookingNotification, 'id'> = {
      recipientUid: talentUid,
      type: 'talent_request',
      bookingId: booking.id || '',
      senderUid: requestedBy,
      senderName: requesterName,
      title: `Studio Session ${talentRole.charAt(0).toUpperCase() + talentRole.slice(1)} Request`,
      message: `${requesterName} requested you as ${talentRole} for a studio session at ${booking.studioName}${message ? `: "${message}"` : ''}`,
      read: false,
      createdAt: serverTimestamp(),
      data: {
        studioName: booking.studioName,
        scheduledAt: booking.scheduledAt,
        talentRole
      }
    };

    await addDoc(collection(db, 'notifications'), notification);

  } catch (error) {
    console.error('Error sending talent request notification:', error);
    throw error;
  }
}

/**
 * Remove talent from a booking
 */
export async function removeTalentFromBooking(
  bookingId: string,
  talentRole: 'artist' | 'producer' | 'engineer',
  removedBy: string
): Promise<void> {
  try {
    const booking = await getSplitBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Verify the remover is involved in the booking
    if (booking.clientAUid !== removedBy && booking.clientBUid !== removedBy) {
      throw new Error('Only booking participants can remove talent');
    }

    const bookingRef = doc(db, 'splitBookings', bookingId);
    const updateData = {
      [`requestedTalent.${talentRole}Id`]: null,
      [`talentStatus.${talentRole}`]: null,
      updatedAt: serverTimestamp()
    };

    await updateDoc(bookingRef, updateData);

    console.log('Talent removed from booking:', { talentRole, bookingId });

  } catch (error) {
    console.error('Error removing talent from booking:', error);
    throw error;
  }
}
