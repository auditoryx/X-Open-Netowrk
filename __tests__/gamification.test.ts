import { logXpEvent } from '@/lib/gamification'
import { XP_VALUES } from '@/constants/gamification'
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

describe('gamification helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedDoc.mockReturnValue('docRef' as any)
    mockedCollection.mockReturnValue('collRef' as any)
    mockedQuery.mockReturnValue('queryRef' as any)
    mockedWhere.mockReturnValue('whereRef' as any)
    mockedTimestampFromDate.mockReturnValue('startTs')
    mockedGetDocs.mockResolvedValue({ docs: [] } as any)
    mockedGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ xp: 0, streakCount: 0, lastActivityAt: { toMillis: () => Date.now() } }) } as any)
  })

  test('accumulates XP up to daily cap', async () => {
    await logXpEvent('u1', 'bookingConfirmed')
    expect(mockedAddDoc).toHaveBeenCalledWith('collRef', expect.objectContaining({ xp: XP_VALUES.bookingConfirmed }))
    expect(mockedUpdateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({ xp: XP_VALUES.bookingConfirmed }))
  })

  test('enforces daily 100 XP cap', async () => {
    mockedGetDocs.mockResolvedValue({ docs: [{ data: () => ({ xp: 60 }) }, { data: () => ({ xp: 40 }) }] } as any)
    mockedGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ xp: 100, streakCount: 0 }) } as any)
    await logXpEvent('u1', 'onTimeDelivery')
    expect(mockedAddDoc).toHaveBeenCalledWith('collRef', expect.objectContaining({ xp: 0 }))
    expect(mockedUpdateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({ xp: 100 }))
  })

  test('streak increments and resets correctly', async () => {
    const now = Date.now()
    jest.spyOn(Date, 'now').mockReturnValue(now)
    // within 24h
    mockedGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ xp: 0, streakCount: 3, lastActivityAt: { toMillis: () => now - 2 * 60 * 60 * 1000 } }) } as any)
    await logXpEvent('u1', 'bookingConfirmed', { quickReply: true })
    expect(mockedUpdateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({ streakCount: 4 }))

    // after 24h gap
    mockedUpdateDoc.mockClear()
    mockedGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ xp: 0, streakCount: 3, lastActivityAt: { toMillis: () => now - 25 * 60 * 60 * 1000 } }) } as any)
    await logXpEvent('u1', 'bookingConfirmed', { quickReply: true })
    expect(mockedUpdateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({ streakCount: 1 }))
  })
})
