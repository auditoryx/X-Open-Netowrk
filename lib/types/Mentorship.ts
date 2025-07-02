import { Timestamp } from 'firebase/firestore';

export type MentorshipFormat = 'live' | 'async';
export type MentorshipStatus = 'pending' | 'booked' | 'in_progress' | 'feedback_ready' | 'completed' | 'cancelled';

export interface Mentorship {
  id?: string;
  creatorUid: string;
  title: string;
  description: string;
  format: MentorshipFormat;
  price: number;
  durationMinutes: number;
  availableDays?: string[]; // e.g., ['monday', 'wednesday', 'friday']
  availableTimeSlots?: string[]; // e.g., ['09:00', '13:00', '17:00'] 
  zoomLink?: string;
  maxBookingsPerDay?: number;
  expertise: string[];
  creatorName?: string;
  creatorProfileImage?: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MentorshipBooking {
  id?: string;
  mentorshipId: string;
  clientUid: string;
  creatorUid: string;
  title: string; // Copied from mentorship
  format: MentorshipFormat;
  status: MentorshipStatus;
  price: number;
  scheduledAt?: Timestamp; // For live sessions
  sessionGoal?: string; // Client's goal for the session
  projectFiles?: string[]; // URLs to files shared by client
  deliverableUrl?: string; // For async feedback (Loom, files, etc)
  zoomLink?: string; // For live sessions
  feedbackNotes?: string; // Creator's notes about the feedback
  clientName?: string;
  creatorName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  stripeSessionId?: string;
}

// Helper functions to check roles
export function isCreatorOfMentorship(mentorship: Mentorship, uid: string): boolean {
  return mentorship.creatorUid === uid;
}

export function isClientOfMentorshipBooking(booking: MentorshipBooking, uid: string): boolean {
  return booking.clientUid === uid;
}

export function isCreatorOfMentorshipBooking(booking: MentorshipBooking, uid: string): boolean {
  return booking.creatorUid === uid;
}
