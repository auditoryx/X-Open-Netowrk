import { GamificationEvent, UserTier } from '@/lib/gamification'

/** XP rewards per event (single source of truth) - Updated to match blueprint */
export const XP_VALUES: Record<GamificationEvent, number> = {
  // Blueprint values (primary)
  bookingCompleted: 100,
  fiveStarReview: 30,
  referralSignup: 100,
  referralFirstBooking: 50,
  profileCompleted: 25,
  // Legacy values (backward compatibility)
  bookingConfirmed: 50,
  onTimeDelivery: 25,
  sevenDayStreak: 40,
  creatorReferral: 150,
}

/** Numeric weight multiplier used in rankScore formula. */
export const TIER_WEIGHT: Record<UserTier, number> = {
  signature: 1.0,
  verified: 0.8,
  standard: 0.5,
}

/** Tier requirements for user progression */
export const TIER_REQUIREMENTS = {
  standard: { xp: 0, bookings: 0 },
  verified: { xp: 1000, bookings: 3 }, // Updated per blueprint verification criteria
  signature: { xp: 2000, bookings: 20 }
}

/** Calculate user tier based on XP and bookings */
export const calculateTier = (xp: number, bookings: number): UserTier => {
  if (xp >= TIER_REQUIREMENTS.signature.xp && bookings >= TIER_REQUIREMENTS.signature.bookings) {
    return 'signature';
  }
  if (xp >= TIER_REQUIREMENTS.verified.xp && bookings >= TIER_REQUIREMENTS.verified.bookings) {
    return 'verified';
  }
  return 'standard';
}

