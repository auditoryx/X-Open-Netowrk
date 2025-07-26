import { getAverageRating } from '../getAverageRating';
import { getDocs } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

describe('getAverageRating', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns rounded average rating', async () => {
    const docs = [
      { data: () => ({ rating: 5 }) },
      { data: () => ({ rating: 4 }) },
      { data: () => ({ rating: 5 }) },
    ];
    mockedGetDocs.mockResolvedValue({ docs } as any);
    const avg = await getAverageRating('target123');
    expect(avg).toBe(4.7);
  });

  it('returns null when there are no ratings', async () => {
    mockedGetDocs.mockResolvedValue({ docs: [] } as any);
    const avg = await getAverageRating('target123');
    expect(avg).toBeNull();
  });
});
