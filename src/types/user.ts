export interface UserProfile {
  uid: string;
  name: string;
  bio: string;
  services: string[];
  tags: string[];
  media: string[];
  availability: string[];
  socials: {
    instagram?: string;
    twitter?: string;
    spotify?: string;
  };
  isVerified: boolean;
  status: 'approved' | 'rejected';
  createdAt: any;
  timezone: string; // ✅ Required for isProfileComplete
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
}
export interface UserWithProfile extends User {
  profile: UserProfile;
  isProfileComplete: boolean;
  isCreator: boolean;
  isAdmin: boolean;
  isUser: boolean;
  isVerified: boolean;  