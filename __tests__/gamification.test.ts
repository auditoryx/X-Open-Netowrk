import { logXpEvent } from '@/lib/gamification'
import { doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore'

jest.mock('@/lib/firebase', () => ({ db: {} }))

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  increment: jest.fn((v: number) => ({ inc: v })),
  serverTimestamp: jest.fn(() => 'ts'),
}))

const mockedDoc = doc as jest.MockedFunction<typeof doc>
const mockedGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockedSetDoc = setDoc as jest.MockedFunction<typeof setDoc>
const mockedIncrement = increment as jest.MockedFunction<typeof increment>

describe('logXpEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedDoc.mockReturnValue('ref' as any)
    mockedGetDoc.mockResolvedValue({ exists: () => false, data: () => ({ total: 0 }) } as any)
  })

  test('awards XP respecting daily cap', async () => {
    mockedGetDoc.mockResolvedValueOnce({ exists: () => false } as any) // meta
    mockedGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ total: 80 }) } as any) // daily

    await logXpEvent('u1', 'bookingConfirmed', 'b1')

    expect(mockedIncrement).toHaveBeenCalledWith(20)
    expect(mockedSetDoc).toHaveBeenCalledWith('ref', expect.objectContaining({ xp: { inc: 20 } , updatedAt: 'ts' }), { merge: true })
    expect(mockedSetDoc).toHaveBeenCalledTimes(3)
  })

  test('skips duplicate contexts', async () => {
    mockedGetDoc.mockResolvedValueOnce({ exists: () => true } as any)

    await logXpEvent('u1', 'bookingConfirmed', 'b1')

    expect(mockedSetDoc).not.toHaveBeenCalled()
  })
})
