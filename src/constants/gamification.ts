import { GamificationEvent } from '@/lib/gamification'

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

