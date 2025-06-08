const add = jest.fn(async () => ({ id: 'g1' }))
const collection = jest.fn(() => ({ add }))
const firestoreMock: any = jest.fn(() => ({ collection }))
firestoreMock.FieldValue = { serverTimestamp: jest.fn() }

jest.mock('@lib/firebaseAdmin', () => ({
  adminApp: { firestore: firestoreMock }
}))

import { createGroupBooking } from '@/lib/firestore/createGroupBooking'

describe('createGroupBooking', () => {
  test('writes group booking and returns id', async () => {
    const id = await createGroupBooking('u1', [])
    expect(firestoreMock).toHaveBeenCalled()
    expect(collection).toHaveBeenCalledWith('groupBookings')
    expect(add).toHaveBeenCalled()
    expect(id).toBe('g1')
  })
})
