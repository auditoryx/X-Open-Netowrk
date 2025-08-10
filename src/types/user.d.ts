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
    tier: 'standard' | 'verified' | 'signature';
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    status: 'approved' | 'rejected';
    createdAt: any;
    timezone: string;
    roles?: ('creator' | 'admin' | 'user' | 'artist' | 'producer' | 'engineer' | 'videographer' | 'studio' | 'client')[];
    xp: number;
    rankScore: number;
    lateDeliveries: number;
    tierFrozen: boolean;
    rooms?: Room[];
    badgeIds?: string[];
    stats?: {
        completedBookings?: number;
        positiveReviewCount?: number;
        responseRate?: number;
        avgResponseTimeHours?: number;
        lastCompletedAt?: any;
        distinctClients90d?: number;
    };
    counts?: {
        axVerifiedCredits?: number;
        clientConfirmedCredits?: number;
    };
    credibilityScore?: number;
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
    roles?: ('creator' | 'admin' | 'user' | 'artist' | 'producer' | 'engineer' | 'videographer' | 'studio' | 'client')[];
    isVisible?: boolean;
    xp: number;
    rankScore: number;
    lateDeliveries: number;
    tierFrozen: boolean;
    streakCount?: number;
    lastActivityAt?: any;
}
export interface UserWithProfile extends User {
    profile: UserProfile;
    isProfileComplete: boolean;
    isCreator: boolean;
    isAdmin: boolean;
    isUser: boolean;
    tier: 'standard' | 'verified' | 'signature';
}
