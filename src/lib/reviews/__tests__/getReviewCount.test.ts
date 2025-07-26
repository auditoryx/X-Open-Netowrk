import { getReviewCount } from '../getReviewCount';
import { getCountFromServer } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getCountFromServer: jest.fn(),
}));

const mockedGetCountFromServer = getCountFromServer as jest.MockedFunction<typeof getCountFromServer>;

describe('getReviewCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns review count for target', async () => {
    mockedGetCountFromServer.mockResolvedValue({ 
      data: () => ({ count: 5 })
    } as any);
    
    const count = await getReviewCount('target123');
    expect(count).toBe(5);
  });

  it('returns 0 when no reviews exist', async () => {
    mockedGetCountFromServer.mockResolvedValue({ 
      data: () => ({ count: 0 })
    } as any);
    
    const count = await getReviewCount('target123');
    expect(count).toBe(0);
  });
});