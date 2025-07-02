import { Timestamp } from 'firebase/firestore';

export interface EventBooking {
  id?: string;
  clientUid: string;
  title: string;
  description?: string;
  eventDate: Timestamp;
  location?: string;
  rolesNeeded: ('artist' | 'producer' | 'engineer' | 'videographer' | 'studio' | 'editor' | 'designer')[];
  memberUids: string[];
  selectedCreators?: { [role: string]: string }; // role -> creatorUid
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  totalBudget?: number;
  bookingIds: string[]; // References to individual booking records
}

export interface EventTeamMember {
  uid: string;
  role: string;
  displayName: string;
  profileImage?: string;
  status: 'invited' | 'accepted' | 'declined';
  bookingId?: string;
}

// Helper function to check if user is part of an event
export function isUserInEvent(event: EventBooking, uid: string): boolean {
  return event.clientUid === uid || event.memberUids.includes(uid);
}

// Helper function to get user's role in an event
export function getUserRoleInEvent(event: EventBooking, uid: string): string {
  if (event.clientUid === uid) return 'Client';
  if (event.selectedCreators) {
    for (const role in event.selectedCreators) {
      if (event.selectedCreators[role] === uid) {
        return role.charAt(0).toUpperCase() + role.slice(1);
      }
    }
  }
  return 'Team Member';
}
