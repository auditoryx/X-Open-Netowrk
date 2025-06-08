import { logXpEvent } from '@/lib/gamification'
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore'

jest.mock('@/lib/firebase', () => ({ db: {} }))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(() => 'ts'),
  Timestamp: { fromDate: jest.fn(() => ({ fromDate: true })) }
}))

const mockedCollection = collection as jest.MockedFunction<typeof collection>
const mockedAddDoc = addDoc as jest.MockedFunction<typeof addDoc>
const mockedDoc = doc as jest.MockedFunction<typeof doc>
const mockedGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockedUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>
const mockedQuery = query as jest.MockedFunction<typeof query>
const mockedWhere = where as jest.MockedFunction<typeof where>
const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>
const mockedTimestampFromDate = (Timestamp as any).fromDate as jest.Mock

describe('abuse detection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedDoc.mockReturnValue('docRef' as any)
    mockedCollection.mockReturnValue('collRef' as any)
    mockedQuery.mockReturnValue('queryRef' as any)
    mockedWhere.mockReturnValue('whereRef' as any)
    mockedTimestampFromDate.mockReturnValue('startTs')
    mockedGetDocs.mockResolvedValue({ docs: [] } as any)
    mockedGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ points: 0, streakCount: 0 }) } as any)
  })

  test('prevents duplicate context events', async () => {
    mockedGetDocs.mockResolvedValueOnce({ empty: false, docs: [{}] } as any)
    const awarded = await logXpEvent('u1', 10, 'test', { contextId: 'abc' })
    expect(awarded).toBe(0)
    expect(mockedAddDoc).toHaveBeenCalledWith('collRef', expect.objectContaining({ contextId: 'abc' }))
  })
})
