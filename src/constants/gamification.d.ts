import { GamificationEvent, UserTier } from '@/lib/gamification';
export declare const XP_VALUES: Record<GamificationEvent, number>;
export declare const TIER_WEIGHT: Record<UserTier, number>;
export declare const TIER_REQUIREMENTS: {
    standard: {
        xp: number;
        bookings: number;
    };
    verified: {
        xp: number;
        bookings: number;
    };
    signature: {
        xp: number;
        bookings: number;
    };
};
export declare const calculateTier: (xp: number, bookings: number) => UserTier;
