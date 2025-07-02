import type { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '@/lib/firebase/firebaseAdmin';
import { getAuth } from '@/lib/firebase/firebaseAdmin';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get eventId and authorization from request
  const { eventId } = req.body;
  const authHeader = req.headers.authorization;

  if (!eventId) {
    return res.status(400).json({ message: 'Event ID is required' });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Verify the user token
    const token = authHeader.split(' ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get the event document
    const eventDoc = await getDoc(doc(firestore, 'events', eventId));

    if (!eventDoc.exists()) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventData = eventDoc.data();

    // Check if the user is the event client
    if (eventData.clientUid !== uid) {
      return res.status(403).json({ message: 'Only the client can confirm this event' });
    }

    // Check if the event is in planning status
    if (eventData.status !== 'planning') {
      return res.status(400).json({ message: 'Event is already confirmed or completed' });
    }

    // Update the event to confirmed status
    await updateDoc(doc(firestore, 'events', eventId), {
      status: 'confirmed',
      updatedAt: serverTimestamp(),
    });

    // Update all linked booking statuses to confirmed
    if (eventData.bookingIds && eventData.bookingIds.length > 0) {
      await Promise.all(
        eventData.bookingIds.map(async (bookingId: string) => {
          await updateDoc(doc(firestore, 'bookings', bookingId), {
            status: 'confirmed',
            updatedAt: serverTimestamp(),
          });
        })
      );
    }

    return res.status(200).json({ message: 'Event confirmed successfully' });
  } catch (error) {
    console.error('Error confirming event:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
