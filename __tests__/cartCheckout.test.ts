import { createGroupBookingSession } from '@/lib/stripe/createGroupBookingSession'
import { stripe } from '@/lib/stripe'

jest.mock('@/lib/stripe', () => ({
  stripe: { checkout: { sessions: { create: jest.fn() } } }
}))

const mockCreate = (stripe.checkout.sessions.create as jest.Mock)

describe('createGroupBookingSession', () => {
  test('creates stripe session with line items', async () => {
    mockCreate.mockResolvedValue({ id: 'sess', url: 'http://stripe' })
    const session = await createGroupBookingSession('g1', 'u1', [
      { serviceId: 's1', providerId: 'p1', serviceName: 'Studio', price: 10, dateTime: 'dt1' },
      { serviceId: 's2', providerId: 'p2', serviceName: 'Video', price: 20, dateTime: 'dt2' }
    ])
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      line_items: expect.arrayContaining([
        expect.objectContaining({ quantity: 1 }),
        expect.objectContaining({ quantity: 1 })
      ])
    }))
    expect(session.url).toBe('http://stripe')
  })
})
