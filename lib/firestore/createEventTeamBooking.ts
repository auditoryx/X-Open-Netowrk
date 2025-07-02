import { firestore } from '@/lib/firebase/firebaseAdmin';
import { EventBooking } from '@/lib/types/EventBooking';
import { Booking } from '@/lib/types/Booking';
import { collection, addDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

interface CreateEventTeamBookingParams {
  clientUid: string;
  title: string;
  description?: string;
  eventDate: Date;
  location?: string;
  rolesNeeded: string[];
  selectedCreators?: { [role: string]: string };
  totalBudget?: number;
}

export async function createEventTeamBooking(params: CreateEventTeamBookingParams): Promise<string> {
  const {
    clientUid,
    title,
    description,
    eventDate,
    location,
    rolesNeeded,
    selectedCreators = {},
    totalBudget,
  } = params;

  // Create the parent event record
  const eventData: Omit<EventBooking, 'id' | 'bookingIds'> = {
    clientUid,
    title,
    description,
    eventDate: Timestamp.fromDate(eventDate),
    location,
    rolesNeeded,
    memberUids: Object.values(selectedCreators),
    selectedCreators,
    status: 'planning',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    totalBudget,
  };

  const eventRef = await addDoc(collection(firestore, 'events'), eventData);
  const eventId = eventRef.id;

  // Create individual bookings for each selected creator
  const bookingIds: string[] = [];
  
  for (const role of rolesNeeded) {
    const creatorUid = selectedCreators[role];
    if (creatorUid) {
      const bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> = {
        clientUids: [clientUid],
        creatorUid,
        serviceId: `event-${role}`, // Placeholder service ID
        studioId: '', // Can be populated if needed
        status: 'pending',
        scheduledAt: Timestamp.fromDate(eventDate),
        durationMinutes: 480, // Default 8 hours for event
        totalCost: totalBudget ? Math.floor(totalBudget / rolesNeeded.length) : 0,
        sessionTitle: `${title} - ${role}`,
        sessionDescription: description,
        createdBy: clientUid,
        // Event-specific metadata
        eventId,
        eventTitle: title,
      };

      const bookingRef = await addDoc(collection(firestore, 'bookings'), {
        ...bookingData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      bookingIds.push(bookingRef.id);
    }
  }

  // Update the event with booking IDs
  await updateDoc(eventRef, { 
    bookingIds,
    updatedAt: serverTimestamp() 
  });

  return eventId;
}
