export interface Mentorship {
  id: string;
  mentorId: string;
  menteeId: string;
  title: string;
  description: string;
  category: string;
  duration: number; // in hours
  price: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  sessionType: 'one-time' | 'recurring';
  recurringSchedule?: {
    frequency: 'weekly' | 'monthly';
    dayOfWeek?: number;
    timeOfDay?: string;
  };
  sessions: MentorshipSession[];
  totalSessions: number;
  completedSessions: number;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  endDate?: Date;
  goals: string[];
  resources: string[];
  notes?: string;
  rating?: number;
  feedback?: string;
}

export interface MentorshipSession {
  id: string;
  mentorshipId: string;
  scheduledDate: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  homework?: string;
  resources?: string[];
  recordingUrl?: string;
  attendanceStatus: {
    mentor: boolean;
    mentee: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorshipBooking {
  id: string;
  mentorshipId: string;
  mentorId: string;
  menteeId: string;
  sessionDate: Date;
  sessionTime: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorProfile {
  id: string;
  userId: string;
  expertise: string[];
  experience: string;
  bio: string;
  hourlyRate: number;
  availableHours: number;
  totalMentees: number;
  rating: number;
  reviewCount: number;
  specialties: string[];
  certifications: string[];
  languages: string[];
  timezone: string;
  availability: {
    [key: string]: { // day of week
      start: string;
      end: string;
      available: boolean;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorshipService {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  duration: number; // in hours
  sessionType: 'one-time' | 'package';
  packageDetails?: {
    totalSessions: number;
    sessionDuration: number; // in minutes
    validity: number; // in days
  };
  deliverables: string[];
  prerequisites: string[];
  targetAudience: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  maxParticipants: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  rating: number;
  reviewCount: number;
  completedSessions: number;
}

export type MentorshipStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type SessionType = 'one-time' | 'recurring';
export type Frequency = 'weekly' | 'monthly';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Check if user is creator of mentorship
 */
export function isCreatorOfMentorship(mentorship: Mentorship, userId: string): boolean {
  return mentorship.mentorId === userId;
}
