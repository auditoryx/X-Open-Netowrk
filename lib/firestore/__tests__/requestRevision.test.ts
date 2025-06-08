import { requestRevision } from '@/lib/firestore/bookings/requestRevision';

const get = jest.fn();
const update = jest.fn();

jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: () => [],
  getApp: jest.fn(),
  cert: jest.fn(),
}));

jest.mock('firebase-admin/firestore', () => {
  const doc = jest.fn(() => ({ get, update }));
  return {
    getFirestore: jest.fn(() => ({ collection: () => ({ doc }) })),
    FieldValue: { increment: jest.fn(() => 'inc'), serverTimestamp: jest.fn(() => 'ts') },
  };
});

jest.mock('@/lib/firestore/logging/logActivity', () => ({ logActivity: jest.fn() }));

describe('requestRevision', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('second call when counter = 0 returns error', async () => {
    get.mockResolvedValueOnce({ data: () => ({ revisionsRemaining: 1 }) });
    await requestRevision({ bookingId: 'b1', userId: 'u1' });

    get.mockResolvedValueOnce({ data: () => ({ revisionsRemaining: 0 }) });
    const res = await requestRevision({ bookingId: 'b1', userId: 'u1' });
    expect(res).toEqual({ error: 'No revisions remaining' });
  });
});
