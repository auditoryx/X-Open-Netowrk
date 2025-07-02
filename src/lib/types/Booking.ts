import { Timestamp } from 'firebase/firestore';

export interface RevenueSplit {
  [role: string]: number; // e.g. { 'artist': 0.6, 'producer': 0.4 }
}

export interface Booking {
  id?: string;
  studioId: string;
  clientUids: string[];
  creatorUid: string; // The main creator/owner of the booking slot
  status: 'pending' | 'confirmed' | 'in_session' | 'completed' | 'cancelled';
  scheduledAt: Timestamp;
  durationMinutes: number;
  totalCost: number;
  sessionTitle?: string;
  sessionDescription?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // UID of the user who initiated the booking

  // Event-related fields
  eventId?: string; // Links to parent event if this is part of an event booking
  eventTitle?: string; // Event title for display
  
  // Service identification
  serviceId?: string;

  // Revenue Split
  revenueSplit?: RevenueSplit;
  contractUrl?: string; // URL to the generated PDF contract

  // Payment tracking for multiple clients
  paymentStatus?: { [uid: string]: 'pending' | 'paid' | 'refunded' };
  stripeSessionIds?: { [uid: string]: string };

  // Studio details (for display)
  studioName?: string;
  studioLocation?: string;

  // Talent details
  requestedTalent?: {
    [role: string]: string; // role: uid
  };
  talentStatus?: {
    [uid: string]: 'pending' | 'accepted' | 'rejected';
  };
  talentDetails?: {
    [uid: string]: { name: string; profileImage?: string };
  };
}

export interface TalentRequest {
  bookingId: string;
  talentUid: string;
  talentRole: string;
  requestedBy: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Timestamp;
  respondedAt?: Timestamp;
  message?: string;
}

export interface BookingNotification {
  id?: string;
  recipientUid: string;
  type: 'booking_invite' | 'talent_request' | 'booking_confirmed' | 'talent_response';
  bookingId: string;
  senderUid: string;
  senderName: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  data?: {
    studioName?: string;
    scheduledAt?: Timestamp;
    talentRole?: string;
    revenueSplit?: RevenueSplit;
  };
}

// Helper function to check if user is involved in a booking
export function isUserInBooking(booking: Booking, uid: string): boolean {
  return booking.clientUids.includes(uid) ||
         booking.creatorUid === uid ||
         (booking.requestedTalent && Object.values(booking.requestedTalent).includes(uid));
}

// Helper function to get user's role in a booking
export function getUserRoleInBooking(booking: Booking, uid: string): string {
  if (booking.creatorUid === uid) return 'Creator';
  if (booking.clientUids.includes(uid)) return 'Client';
  if (booking.requestedTalent) {
    for (const role in booking.requestedTalent) {
      if (booking.requestedTalent[role] === uid) {
        return role.charAt(0).toUpperCase() + role.slice(1); // Capitalize role
      }
    }
  }
  return 'Unknown';
}
