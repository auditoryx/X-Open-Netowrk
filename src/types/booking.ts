export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

/** Credit source tracking for completed bookings */
export type CreditSource = 'ax-verified' | 'client-confirmed' | 'self-reported';

export interface BookingContract {
  terms: string;
  agreedByClient: boolean;
  agreedByProvider: boolean;
}

export interface Booking {
  id: string;
  clientId: string;
  providerId: string;
  serviceId: string;
  serviceName: string;
  datetime: string;
  status: BookingStatus;
  title: string;
  notes?: string;
  createdAt: string;
  contract: BookingContract;
  
  // AX Beta: Credit source tracking
  creditSource?: CreditSource;
  /** True if booking was created via BYO (Bring Your Own) invite link */
  isByoBooking?: boolean;
  /** Reference to the BYO invite that created this booking */
  byoInviteId?: string;
  /** Payment status for credit eligibility */
  isPaid?: boolean;
  /** Completion timestamp */
  completedAt?: any; // Firestore Timestamp
  /** Whether credit has been awarded for this booking */
  creditAwarded?: boolean;
}
