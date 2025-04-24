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
}
