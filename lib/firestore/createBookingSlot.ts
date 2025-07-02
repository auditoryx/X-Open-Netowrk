import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { firestore } from "../firebase/init";
import { BookingSlot } from "../types/BookingSlot";

interface CreateBookingSlotParams {
  providerUid: string;
  scheduledAt: Date | string;
  durationMinutes: number;
  inviteOnly: boolean;
  allowedUids?: string[];
  minRank?: 'verified' | 'signature' | 'top5';
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  maxParticipants?: number;
}

/**
 * Creates a new booking slot with invite-only functionality
 * 
 * @param params - Booking slot parameters
 * @returns ID of the created booking slot
 */
export async function createBookingSlot(params: CreateBookingSlotParams): Promise<string> {
  // Convert scheduledAt to Timestamp if it's a string or Date
  let scheduledTimestamp: Timestamp;
  if (typeof params.scheduledAt === 'string') {
    scheduledTimestamp = Timestamp.fromDate(new Date(params.scheduledAt));
  } else if (params.scheduledAt instanceof Date) {
    scheduledTimestamp = Timestamp.fromDate(params.scheduledAt);
  } else {
    throw new Error('Invalid scheduledAt format');
  }

  // Create booking slot object
  const bookingSlotData: Omit<BookingSlot, 'id'> = {
    providerUid: params.providerUid,
    scheduledAt: scheduledTimestamp,
    durationMinutes: params.durationMinutes,
    inviteOnly: params.inviteOnly,
    status: 'available',
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  // Add optional fields if provided
  if (params.inviteOnly) {
    if (params.allowedUids && params.allowedUids.length > 0) {
      bookingSlotData.allowedUids = params.allowedUids;
    }
    if (params.minRank) {
      bookingSlotData.minRank = params.minRank;
    }
  }

  if (params.title) bookingSlotData.title = params.title;
  if (params.description) bookingSlotData.description = params.description;
  if (params.price) bookingSlotData.price = params.price;
  if (params.location) bookingSlotData.location = params.location;
  if (params.maxParticipants) bookingSlotData.maxParticipants = params.maxParticipants;

  // Add to Firestore
  const docRef = await addDoc(collection(firestore, 'bookingSlots'), bookingSlotData);
  return docRef.id;
}
