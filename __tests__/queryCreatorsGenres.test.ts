import { queryCreators } from '@/lib/firestore/queryCreators';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit as fsLimit,
  doc,
  getDoc,
} from 'firebase/firestore';
import { isProfileComplete } from '@/lib/profile/isProfileComplete';

jest.mock('@/lib/firebase', () => ({ db: {} }));
jest.mock('@/lib/profile/isProfileComplete', () => ({ isProfileComplete: jest.fn(() => true) }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  startAfter: jest.fn(),
  limit: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

const mockedCollection = collection as jest.MockedFunction<typeof collection>;
const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockedQuery = query as jest.MockedFunction<typeof query>;
const mockedWhere = where as jest.MockedFunction<typeof where>;
const mockedOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockedLimit = fsLimit as jest.MockedFunction<typeof fsLimit>;
const mockedGetDoc = (getDoc as any) as jest.MockedFunction<any>;
const mockedDoc = (doc as any) as jest.MockedFunction<any>;

describe('queryCreators genre filter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCollection.mockReturnValue('users' as any);
    mockedQuery.mockReturnValue('q' as any);
    mockedWhere.mockReturnValue('where' as any);
    mockedOrderBy.mockReturnValue('order' as any);
    mockedLimit.mockReturnValue('limit' as any);
    mockedDoc.mockReturnValue('docRef' as any);
    mockedGetDoc.mockResolvedValue({ exists: () => false });
    mockedGetDocs.mockResolvedValue({
      docs: [{ id: '1', data: () => ({ genres: ['Rock'] }) }],
    } as any);
  });

  test('returns only matching genre docs', async () => {
    const { results } = await queryCreators({ genres: ['Rock'] });
    expect(mockedWhere).toHaveBeenCalledWith('genres', 'array-contains-any', ['Rock']);
    expect(results).toHaveLength(1);
    expect(results[0].uid).toBe('1');
  });
});
