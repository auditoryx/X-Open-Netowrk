import { TIER_WEIGHT } from '@/constants/gamification'
import type { UserTier } from '@/lib/gamification'

export interface RankInputs {
  tier: UserTier
  rating: number          // avg rating 0-5
  reviews: number         // total reviews
  xp: number              // experience points
  responseHrs: number     // avg first-response time
  proximityKm: number     // distance to searcher (km)
}

/** Spec-exact rankScore computation. */
export function calcRankScore(i: RankInputs): number {
  const tierPart       = TIER_WEIGHT[i.tier] * 50
  const ratingPart     = i.rating * 40
  const reviewsPart    = Math.log10(i.reviews + 1) * 30
  const xpPart         = Math.sqrt(i.xp) * 5
  const responsePart   = (1 / Math.max(i.responseHrs, 1)) * 40
  const distancePenalty = i.proximityKm * 0.2

  return (
    tierPart +
    ratingPart +
    reviewsPart +
    xpPart +
    responsePart -
    distancePenalty
  )
}

