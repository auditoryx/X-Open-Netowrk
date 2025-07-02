import { Timestamp } from "firebase/firestore";

export interface BookingSlot {
  id: string;
  providerUid: string;
  scheduledAt: Timestamp;
  durationMinutes: number;
  inviteOnly: boolean;
  allowedUids?: string[];
  minRank?: 'verified' | 'signature' | 'top5';
  
  // Other properties
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  maxParticipants?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  status?: 'available' | 'booked' | 'cancelled';
}
