import { Timestamp } from 'firebase/firestore';

export interface CollabPackage {
  id?: string;
  title: string;
  description: string;
  roles: {
    artistUid?: string;
    producerUid?: string;
    engineerUid?: string;
    videographerUid?: string;
    studioUid?: string;
  };
  roleDetails?: {
    artist?: { name: string; profileImage?: string; verified: boolean };
    producer?: { name: string; profileImage?: string; verified: boolean };
    engineer?: { name: string; profileImage?: string; verified: boolean };
    videographer?: { name: string; profileImage?: string; verified: boolean };
    studio?: { name: string; profileImage?: string; verified: boolean };
  };
  totalPrice: number;
  priceBreakdown?: {
    artist?: number;
    producer?: number;
    engineer?: number;
    videographer?: number;
    studio?: number;
  };
  durationMinutes: number;
  tags: string[];
  media: string[]; // URLs to portfolio media
  createdBy: string; // UID of the creator who initiated the package
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Availability and booking settings
  availableLocations?: string[];
  equipment?: string[];
  genre?: string[];
  packageType: 'studio_session' | 'live_performance' | 'video_production' | 'custom';
  
  // Status and visibility
  status: 'draft' | 'active' | 'inactive' | 'archived';
  isPublic: boolean;
  featured: boolean;
  
  // Metrics
  viewCount?: number;
  bookingCount?: number;
  rating?: number;
  reviewCount?: number;
}

export interface CollabBooking {
  id?: string;
  clientUid: string;
  collabPackageId: string;
  packageTitle: string;
  memberUids: string[]; // All creator UIDs in the package
  memberRoles: { [uid: string]: string }; // Map UID to role
  
  // Booking details
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt: Timestamp;
  endTime: Timestamp;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  
  // Location and logistics
  location?: string;
  venue?: string;
  address?: string;
  requirements?: string;
  
  // Communication
  clientNotes?: string;
  teamNotes?: string;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Payment tracking
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  
  // Revenue split (for future implementation)
  revenueSplit?: {
    [uid: string]: number; // Amount for each member
  };
}

export interface CollabPackageCreator {
  uid: string;
  name: string;
  profileImage?: string;
  role: 'artist' | 'producer' | 'engineer' | 'videographer' | 'studio';
  verified: boolean;
  rating?: number;
  reviewCount?: number;
  hourlyRate?: number;
}

export interface CollabPackageFilters {
  roles?: ('artist' | 'producer' | 'engineer' | 'videographer' | 'studio')[];
  priceRange?: { min: number; max: number };
  duration?: { min: number; max: number };
  tags?: string[];
  genre?: string[];
  location?: string;
  packageType?: CollabPackage['packageType'];
  featured?: boolean;
}

// Helper functions
export function getPackageMembers(package: CollabPackage): CollabPackageCreator[] {
  const members: CollabPackageCreator[] = [];
  
  Object.entries(package.roles).forEach(([role, uid]) => {
    if (uid && package.roleDetails?.[role as keyof typeof package.roleDetails]) {
      const details = package.roleDetails[role as keyof typeof package.roleDetails];
      if (details) {
        members.push({
          uid,
          name: details.name,
          profileImage: details.profileImage,
          role: role as CollabPackageCreator['role'],
          verified: details.verified
        });
      }
    }
  });
  
  return members;
}

export function calculateRevenueSplit(
  totalAmount: number, 
  priceBreakdown: CollabPackage['priceBreakdown']
): { [uid: string]: number } {
  const split: { [uid: string]: number } = {};
  
  if (!priceBreakdown) {
    return split;
  }
  
  const totalBreakdown = Object.values(priceBreakdown).reduce((sum, amount) => sum + (amount || 0), 0);
  
  if (totalBreakdown === 0) {
    return split;
  }
  
  // Calculate proportional split based on price breakdown
  Object.entries(priceBreakdown).forEach(([role, amount]) => {
    if (amount && amount > 0) {
      const percentage = amount / totalBreakdown;
      split[role] = Math.round(totalAmount * percentage * 100) / 100; // Round to 2 decimal places
    }
  });
  
  return split;
}

export function isUserInCollabPackage(package: CollabPackage, uid: string): boolean {
  return Object.values(package.roles).includes(uid);
}

export function getUserRoleInPackage(package: CollabPackage, uid: string): string | null {
  for (const [role, memberUid] of Object.entries(package.roles)) {
    if (memberUid === uid) {
      return role;
    }
  }
  return null;
}

export function formatPackageDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

export function formatPackagePrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}
