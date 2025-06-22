import { describe, it, expect } from 'vitest'
import { calcRankScore } from '../rank'

describe('calcRankScore', () => {
  it('Signature creator comfortably outranks Standard', () => {
    const sig = calcRankScore({
      tier: 'signature',
      rating: 4.8,
      reviews: 35,
      xp: 2000,
      responseHrs: 2,
      proximityKm: 10,
    })
    const std = calcRankScore({
      tier: 'standard',
      rating: 4.9,
      reviews: 120,
      xp: 8000,
      responseHrs: 2,
      proximityKm: 10,
    })
    expect(sig).toBeGreaterThan(std)
  })
})
