import { GamificationEvent, UserTier } from '@/lib/gamification'

/** XP rewards per event (single source of truth). */
export const XP_VALUES: Record<GamificationEvent, number> = {
  bookingConfirmed: 50,
  fiveStarReview: 100,
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
  verified: { xp: 500, bookings: 5 },
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

