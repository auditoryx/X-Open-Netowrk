import { generateLeaderboard } from '@/lib/leaderboards'
import { collection, query, orderBy, limit, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore'

jest.mock('@/lib/firebase', () => ({ db: {} }))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
  serverTimestamp: jest.fn(() => 'ts'),
}))

const mockedCollection = collection as jest.MockedFunction<typeof collection>
const mockedQuery = query as jest.MockedFunction<typeof query>
const mockedOrderBy = orderBy as jest.MockedFunction<typeof orderBy>
const mockedLimit = limit as jest.MockedFunction<typeof limit>
const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>
const mockedSetDoc = setDoc as jest.MockedFunction<typeof setDoc>
const mockedDoc = doc as jest.MockedFunction<typeof doc>

describe('leaderboard generation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedCollection.mockReturnValue('users' as any)
    mockedQuery.mockReturnValue('q' as any)
    mockedOrderBy.mockReturnValue('order' as any)
    mockedLimit.mockReturnValue('lim' as any)
    mockedDoc.mockReturnValue('leaderDoc' as any)
    mockedGetDocs.mockResolvedValue({ docs: [{ id: 'u1', data: () => ({ points: 100 }) }] } as any)
  })

  test('writes leaderboard document', async () => {
    await generateLeaderboard('weekly', 1)
    expect(mockedSetDoc).toHaveBeenCalledWith('leaderDoc', expect.objectContaining({ entries: [{ uid: 'u1', points: 100 }] }))
  })
})
