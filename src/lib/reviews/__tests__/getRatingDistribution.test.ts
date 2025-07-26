import { getRatingDistribution } from '../getRatingDistribution';
import { getDocs } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

describe('getRatingDistribution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns distribution of ratings', async () => {
    const docs = [
      { data: () => ({ rating: 5 }) },
      { data: () => ({ rating: 4 }) },
      { data: () => ({ rating: 5 }) },
      { data: () => ({ rating: 3 }) },
    ];
    mockedGetDocs.mockResolvedValue({ docs } as any);
    const dist = await getRatingDistribution('target123');
    expect(dist).toEqual({ 1: 0, 2: 0, 3: 1, 4: 1, 5: 2 });
  });
});
