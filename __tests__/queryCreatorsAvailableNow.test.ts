import { queryCreators } from '@/lib/firestore/queryCreators';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc,
} from 'firebase/firestore';

jest.mock('@/lib/firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

const mockedCollection = collection as jest.MockedFunction<typeof collection>;
const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockedQuery = query as jest.MockedFunction<typeof query>;
const mockedWhere = where as jest.MockedFunction<typeof where>;
const mockedOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockedLimit = limit as jest.MockedFunction<typeof limit>;
const mockedDoc = doc as jest.MockedFunction<typeof doc>;
const mockedGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedCollection.mockReturnValue('users' as any);
  mockedQuery.mockReturnValue('q' as any);
  mockedWhere.mockReturnValue('where' as any);
  mockedOrderBy.mockReturnValue('order' as any);
  mockedLimit.mockReturnValue('lim' as any);
  mockedDoc.mockReturnValue('docRef' as any);
  mockedGetDoc.mockResolvedValue({ exists: () => true } as any);
});

test('availableNow filters by timestamp', async () => {
  const now = Date.now();
  jest.spyOn(Date, 'now').mockReturnValue(now);
  mockedGetDocs.mockResolvedValue({
    docs: [
      {
        id: '1',
        data: () => ({
          name: 'A',
          bio: 'b',
          media: ['m'],
          services: ['s'],
          timezone: 'UTC',
          nextAvailableTs: now + 3600 * 1000,
        }),
      },
      {
        id: '2',
        data: () => ({
          name: 'B',
          bio: 'b',
          media: ['m'],
          services: ['s'],
          timezone: 'UTC',
          nextAvailableTs: now + 8 * 24 * 3600 * 1000,
        }),
      },
    ],
  } as any);

  const { results } = await queryCreators({ availableNow: true });
  expect(results.map((r) => r.uid)).toEqual(['1']);
});
