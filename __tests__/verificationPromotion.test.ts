import { approveUserVerification } from '@/lib/firestore/approveUserVerification'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

jest.mock('@/lib/firebase', () => ({ db: {} }))

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
}))

const mockedDoc = doc as jest.MockedFunction<typeof doc>
const mockedGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockedUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>

describe('approveUserVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedDoc.mockReturnValue('ref' as any)
  })

  test('promotes to verified tier when user has 500+ XP', async () => {
    mockedGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ points: 600 }) } as any)
    await approveUserVerification('u1')
    expect(mockedUpdateDoc).toHaveBeenCalledWith('ref', { verificationStatus: 'verified', proTier: 'verified' })
  })

  test('does not set tier if user lacks XP', async () => {
    mockedGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ points: 100 }) } as any)
    await approveUserVerification('u1')
    expect(mockedUpdateDoc).toHaveBeenCalledWith('ref', { verificationStatus: 'verified' })
  })
})
