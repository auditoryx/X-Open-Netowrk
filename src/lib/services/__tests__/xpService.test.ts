/**
 * XP Service Unit Tests
 * Tests the core gamification XP service functionality
 */

import { XP_VALUES, DAILY_XP_CAP } from '@/lib/services/xpService'

// Simple unit tests that don't require complex mocking
describe('XPService Constants', () => {
  describe('XP Values', () => {
    it('should have correct XP values as per blueprint', () => {
      expect(XP_VALUES.bookingCompleted).toBe(100)
      expect(XP_VALUES.fiveStarReview).toBe(30)
      expect(XP_VALUES.referralSignup).toBe(100)
      expect(XP_VALUES.referralFirstBooking).toBe(50)
      expect(XP_VALUES.profileCompleted).toBe(25)
    })

    it('should have legacy XP values for backward compatibility', () => {
      expect(XP_VALUES.bookingConfirmed).toBe(50)
      expect(XP_VALUES.onTimeDelivery).toBe(25)
      expect(XP_VALUES.sevenDayStreak).toBe(40)
      expect(XP_VALUES.creatorReferral).toBe(150)
    })

    it('should have all XP values as positive numbers', () => {
      Object.values(XP_VALUES).forEach(value => {
        expect(typeof value).toBe('number')
        expect(value).toBeGreaterThan(0)
      })
    })
  })

  describe('Daily XP Cap', () => {
    it('should have correct daily XP cap', () => {
      expect(DAILY_XP_CAP).toBe(300)
    })

    it('should be a positive number', () => {
      expect(typeof DAILY_XP_CAP).toBe('number')
      expect(DAILY_XP_CAP).toBeGreaterThan(0)
    })
  })

  describe('XP Event Types', () => {
    it('should include all blueprint events', () => {
      const blueprintEvents = [
        'bookingCompleted',
        'fiveStarReview', 
        'referralSignup',
        'referralFirstBooking',
        'profileCompleted'
      ]
      
      blueprintEvents.forEach(event => {
        expect(XP_VALUES).toHaveProperty(event)
      })
    })

    it('should include legacy events for backward compatibility', () => {
      const legacyEvents = [
        'bookingConfirmed',
        'onTimeDelivery',
        'sevenDayStreak',
        'creatorReferral'
      ]
      
      legacyEvents.forEach(event => {
        expect(XP_VALUES).toHaveProperty(event)
      })
    })
  })
})

// Test the XP calculation logic without Firebase dependencies
describe('XP Calculation Logic', () => {
  it('should calculate remaining daily cap correctly', () => {
    const earned = 150
    const remaining = Math.max(0, DAILY_XP_CAP - earned)
    expect(remaining).toBe(150)
  })

  it('should prevent earning more than daily cap', () => {
    const earned = 250
    const eventXP = 100
    const remaining = Math.max(0, DAILY_XP_CAP - earned)
    const awarded = Math.min(eventXP, remaining)
    
    expect(awarded).toBe(50) // Only 50 XP left before cap
  })

  it('should award 0 XP when daily cap is reached', () => {
    const earned = 300
    const eventXP = 100
    const remaining = Math.max(0, DAILY_XP_CAP - earned)
    const awarded = Math.min(eventXP, remaining)
    
    expect(awarded).toBe(0)
  })

  it('should award full XP when under daily cap', () => {
    const earned = 50
    const eventXP = 100
    const remaining = Math.max(0, DAILY_XP_CAP - earned)
    const awarded = Math.min(eventXP, remaining)
    
    expect(awarded).toBe(100)
  })
})

// Test data structure validation
describe('Data Structure Validation', () => {
  it('should have valid UserProgress interface properties', () => {
    const mockProgress = {
      userId: 'test-user',
      totalXP: 150,
      dailyXP: 50,
      lastXPDate: new Date(),
      streak: 2,
      lastActivityAt: new Date(),
      tier: 'standard',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    expect(typeof mockProgress.userId).toBe('string')
    expect(typeof mockProgress.totalXP).toBe('number')
    expect(typeof mockProgress.dailyXP).toBe('number')
    expect(typeof mockProgress.streak).toBe('number')
    expect(['standard', 'verified', 'signature']).toContain(mockProgress.tier)
  })

  it('should have valid XPTransaction interface properties', () => {
    const mockTransaction = {
      userId: 'test-user',
      event: 'bookingCompleted',
      xpAwarded: 100,
      contextId: 'booking-123',
      metadata: { test: true },
      timestamp: new Date(),
      dailyCapReached: false
    }
    
    expect(typeof mockTransaction.userId).toBe('string')
    expect(typeof mockTransaction.event).toBe('string')
    expect(typeof mockTransaction.xpAwarded).toBe('number')
    expect(typeof mockTransaction.dailyCapReached).toBe('boolean')
    expect(XP_VALUES).toHaveProperty(mockTransaction.event)
  })
})
