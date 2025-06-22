import { logXpEvent } from '@/lib/gamification'
import { doc, getDoc, setDoc } from 'firebase/firestore'

jest.mock('@/lib/firebase', () => ({ db: {} }))

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}))

const mockedDoc = doc as jest.MockedFunction<typeof doc>
const mockedGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockedSetDoc = setDoc as jest.MockedFunction<typeof setDoc>

describe('abuse guard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedDoc.mockReturnValue('ref' as any)
  })

  test('ignores duplicate events', async () => {
    mockedGetDoc.mockResolvedValueOnce({ exists: () => true } as any)

    await logXpEvent('u1', 'bookingConfirmed', 'ctx1')

    expect(mockedSetDoc).not.toHaveBeenCalled()
  })
})
