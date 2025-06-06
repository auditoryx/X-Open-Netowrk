import { generateReferralCode, redeemReferralCode } from '@/lib/referrals'
import { logXpEvent } from '@/lib/gamification'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'

jest.mock('@/lib/firebase', () => ({ db: {} }))
jest.mock('@/lib/gamification', () => ({ logXpEvent: jest.fn() }))
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'ts'),
}))

const mockedCollection = collection as jest.MockedFunction<typeof collection>
const mockedQuery = query as jest.MockedFunction<typeof query>
const mockedWhere = where as jest.MockedFunction<typeof where>
const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>
const mockedDoc = doc as jest.MockedFunction<typeof doc>
const mockedSetDoc = setDoc as jest.MockedFunction<typeof setDoc>
const mockedGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockedUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>
const mockedLogXp = logXpEvent as jest.MockedFunction<typeof logXpEvent>

describe('referral helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedCollection.mockReturnValue('codes' as any)
    mockedQuery.mockReturnValue('q' as any)
    mockedWhere.mockReturnValue('where' as any)
    mockedDoc.mockReturnValue('docRef' as any)
  })

  test('generates a new code when none exists', async () => {
    mockedGetDocs.mockResolvedValue({ empty: true, docs: [] } as any)
    const code = await generateReferralCode('u1')
    expect(mockedSetDoc).toHaveBeenCalled()
    expect(code).toHaveLength(6)
  })

  test('returns existing code if present', async () => {
    mockedGetDocs.mockResolvedValue({ empty: false, docs: [{ id: 'ABC123' }] } as any)
    const code = await generateReferralCode('u1')
    expect(mockedSetDoc).not.toHaveBeenCalled()
    expect(code).toBe('ABC123')
  })

  test('redeems valid code and awards XP', async () => {
    mockedGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ ownerId: 'u1' }) } as any)
    mockedGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({}) } as any)
    const ok = await redeemReferralCode('u2', 'CODE')
    expect(ok).toBe(true)
    expect(mockedUpdateDoc).toHaveBeenCalledTimes(2)
    expect(mockedLogXp).toHaveBeenCalledWith('u2', 500, 'referral')
  })

  test('fails for invalid code', async () => {
    mockedGetDoc.mockResolvedValue({ exists: () => false } as any)
    const ok = await redeemReferralCode('u2', 'BAD')
    expect(ok).toBe(false)
    expect(mockedLogXp).not.toHaveBeenCalled()
  })
})
