import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, getDoc, doc } from 'firebase/firestore';
import { EventBooking } from '@/lib/types/EventBooking';

export async function getEventTeamBookings(uid: string): Promise<EventBooking[]> {
  const eventsCollection = collection(db, 'events');
  
  // Get events where user is either the client or a team member
  const clientQuery = query(
    eventsCollection,
    where('clientUid', '==', uid),
    orderBy('eventDate', 'desc')
  );
  
  const memberQuery = query(
    eventsCollection,
    where('memberUids', 'array-contains', uid),
    orderBy('eventDate', 'desc')
  );

  const [clientSnapshot, memberSnapshot] = await Promise.all([
    getDocs(clientQuery),
    getDocs(memberQuery)
  ]);

  const events: EventBooking[] = [];
  const seenEventIds = new Set<string>();

  // Process client events
  clientSnapshot.docs.forEach(doc => {
    if (!seenEventIds.has(doc.id)) {
      events.push({ id: doc.id, ...doc.data() } as EventBooking);
      seenEventIds.add(doc.id);
    }
  });

  // Process member events
  memberSnapshot.docs.forEach(doc => {
    if (!seenEventIds.has(doc.id)) {
      events.push({ id: doc.id, ...doc.data() } as EventBooking);
      seenEventIds.add(doc.id);
    }
  });

  // Sort by event date descending
  return events.sort((a, b) => b.eventDate.toMillis() - a.eventDate.toMillis());
}

export async function getEventBookingById(eventId: string): Promise<EventBooking | null> {
  const eventDoc = await getDoc(doc(firestore, 'events', eventId));
  if (!eventDoc.exists()) return null;
  
  return { id: eventDoc.id, ...eventDoc.data() } as EventBooking;
}
