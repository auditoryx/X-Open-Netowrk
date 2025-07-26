// Mock Firebase Admin before importing
jest.mock('@/lib/firebase/firebaseAdmin', () => {
  const mockAdd = jest.fn(async () => ({ id: 'g1' }))
  const mockCollection = jest.fn(() => ({ add: mockAdd }))
  const mockFirestoreInstance = { collection: mockCollection }
  const mockFirestore = jest.fn(() => mockFirestoreInstance)
  mockFirestore.FieldValue = { serverTimestamp: jest.fn(() => 'mock-timestamp') }

  return {
    adminApp: {
      firestore: mockFirestore
    }
  }
})

import { createGroupBooking } from '@/lib/firestore/createGroupBooking'

describe('createGroupBooking', () => {
  test('writes group booking and returns id', async () => {
    const id = await createGroupBooking('u1', [])
    expect(id).toBe('g1')
  })
})
