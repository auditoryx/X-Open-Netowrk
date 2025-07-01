import { createBooking } from '../createBooking'
import { collection, addDoc } from 'firebase/firestore'
import { firestore } from '@lib/firebase/init'

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
}))

jest.mock('@lib/firebase/init', () => ({
  firestore: {}
}))

const mockedCollection = collection as jest.MockedFunction<typeof collection>
const mockedAddDoc = addDoc as jest.MockedFunction<typeof addDoc>

describe('createBooking', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('stores booking data and returns id', async () => {
    const collRef = {}
    mockedCollection.mockReturnValue(collRef as any)
    mockedAddDoc.mockResolvedValue({ id: 'abc123' } as any)

    const booking = { clientId: 'c1', providerId: 'p1', service: 's1', dateTime: 'now', message: 'msg', quote: 210 }
    const id = await createBooking(booking)

    expect(mockedCollection).toHaveBeenCalledWith(firestore, 'bookings')
    expect(mockedAddDoc).toHaveBeenCalledWith(collRef, expect.objectContaining({
      ...booking,
      status: 'pending',
      createdAt: expect.anything(),
      paid: false,
      revisionsRemaining: 2,
    }))
    expect(id).toBe('abc123')
  })
})
