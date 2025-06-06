import { loadStripe } from '@stripe/stripe-js'

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({})),
}))

const mockedLoadStripe = loadStripe as jest.MockedFunction<typeof loadStripe>

describe('getStripe helper', () => {
  beforeEach(() => {
    jest.resetModules()
    mockedLoadStripe.mockClear()
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  })

  it('throws when key is missing', () => {
    const { getStripe } = require('../stripe')
    expect(() => getStripe()).toThrow('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
  })

  it('returns same promise on repeated calls', async () => {
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test'
    const { getStripe } = require('../stripe')
    const p1 = getStripe()
    const p2 = getStripe()
    expect(p1).toBe(p2)
    await expect(p1).resolves.toEqual({})
  })
})
