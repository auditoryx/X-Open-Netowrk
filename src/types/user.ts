export interface UserProfile {
  uid: string;
  name: string;
  bio: string;
  services: string[];
  tags: string[];
  media: string[];
  availability: string[];
  genres?: string[];
  minBpm?: number;
  maxBpm?: number;
  socials: {
    instagram?: string;
    twitter?: string;
    spotify?: string;
  };
  isVerified: boolean;
  /**
   * Status of the user's ID verification request. If undefined, no verification
   * has been submitted yet.
   */
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  status: 'approved' | 'rejected';
  createdAt: any;
  timezone: string; // ✅ Required for isProfileComplete
  /**
   * Community contribution points. Starts at 0.
   */
  points?: number;
  /** Rooms for studio profiles */
  rooms?: Room[];
}

export interface Room {
  name: string;
  hourlyRate: number;
  minBlock: number;
  hasEngineer: boolean;
  engineerFee: number;
}

export interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL: string;
  providerId: string;
  role: 'creator' | 'admin' | 'user';
  isVisible?: boolean; // ✅ Optional for isProfileComplete
  /**
   * Total XP points accumulated by the user.
   */
  points?: number;
  /**
   * Current reply streak count.
   */
  streakCount?: number;
  /**
   * Timestamp of the user's last activity used for streak tracking.
   */
  lastActivityAt?: any;
}

export interface UserWithProfile extends User {
  profile: UserProfile;
  isProfileComplete: boolean;
  isCreator: boolean;
  isAdmin: boolean;
  isUser: boolean;
  isVerified: boolean;
}
