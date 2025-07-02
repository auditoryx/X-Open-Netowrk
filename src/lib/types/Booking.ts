import { Timestamp } from 'firebase/firestore';

export interface SplitBooking {
  id?: string;
  studioId: string;
  clientAUid: string;
  clientBUid: string;
  splitRatio: number; // e.g. 0.5 for 50/50, 0.7 for 70/30
  requestedTalent?: {
    artistId?: string;
    producerId?: string;
    engineerId?: string;
  };
  talentStatus?: {
    artist?: 'pending' | 'accepted' | 'rejected';
    producer?: 'pending' | 'accepted' | 'rejected';
    engineer?: 'pending' | 'accepted' | 'rejected';
  };
  status: 'pending' | 'confirmed' | 'in_session' | 'completed' | 'cancelled';
  scheduledAt: Timestamp;
  durationMinutes: number;
  totalCost: number;
  clientAShare: number;
  clientBShare: number;
  sessionTitle?: string;
  sessionDescription?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // UID of the user who initiated the booking
  
  // Payment tracking
  clientAPaymentStatus?: 'pending' | 'paid' | 'refunded';
  clientBPaymentStatus?: 'pending' | 'paid' | 'refunded';
  stripeSessionIds?: {
    clientA?: string;
    clientB?: string;
  };
  
  // Studio details (for display)
  studioName?: string;
  studioLocation?: string;
  
  // Talent details (for display)
  talentDetails?: {
    artist?: { name: string; profileImage?: string };
    producer?: { name: string; profileImage?: string };
    engineer?: { name: string; profileImage?: string };
  };
}

export interface TalentRequest {
  bookingId: string;
  talentUid: string;
  talentRole: 'artist' | 'producer' | 'engineer';
  requestedBy: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Timestamp;
  respondedAt?: Timestamp;
  message?: string;
}

export interface BookingNotification {
  id?: string;
  recipientUid: string;
  type: 'split_booking_invite' | 'talent_request' | 'booking_confirmed' | 'talent_response';
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
    splitRatio?: number;
  };
}

// Helper function to check if user is involved in a split booking
export function isUserInSplitBooking(booking: SplitBooking, uid: string): boolean {
  return booking.clientAUid === uid || 
         booking.clientBUid === uid || 
         booking.requestedTalent?.artistId === uid ||
         booking.requestedTalent?.producerId === uid ||
         booking.requestedTalent?.engineerId === uid;
}

// Helper function to get user's role in a split booking
export function getUserRoleInBooking(booking: SplitBooking, uid: string): string {
  if (booking.clientAUid === uid) return 'Client A';
  if (booking.clientBUid === uid) return 'Client B';
  if (booking.requestedTalent?.artistId === uid) return 'Artist';
  if (booking.requestedTalent?.producerId === uid) return 'Producer';
  if (booking.requestedTalent?.engineerId === uid) return 'Engineer';
  return 'Unknown';
}

// Helper function to calculate payment shares
export function calculatePaymentShares(totalCost: number, splitRatio: number): { clientAShare: number; clientBShare: number } {
  const clientAShare = Math.round(totalCost * splitRatio * 100) / 100;
  const clientBShare = Math.round(totalCost * (1 - splitRatio) * 100) / 100;
  return { clientAShare, clientBShare };
}
