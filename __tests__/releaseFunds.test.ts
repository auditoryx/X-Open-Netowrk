const update = jest.fn();
const bookingGet = jest.fn().mockResolvedValue({ data: () => ({ providerId: 'prov', totalAmount: 100 }) });
const providerGet = jest.fn().mockResolvedValue({ data: () => ({ stripeAccountId: 'acct_1' }) });

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({ transfers: { create: jest.fn().mockResolvedValue(undefined) } }));
});

jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: () => [],
  getApp: jest.fn(),
  cert: jest.fn(),
}));

jest.mock('firebase-admin/firestore', () => {
  const doc = (id: string) => ({ get: id === 'b1' ? bookingGet : providerGet, update });
  return {
    getFirestore: jest.fn(() => ({ collection: () => ({ doc }) })),
    FieldValue: { serverTimestamp: jest.fn(() => 'ts') },
  };
});

import { markAsReleased } from '@/lib/firestore/bookings/markAsReleased';

describe.skip('markAsReleased', () => {
  it('updates booking status to released', async () => {
    await markAsReleased({ bookingId: 'b1', userId: 'u1' });
    expect(update).toHaveBeenCalledWith({
      status: 'released',
      updatedAt: 'ts',
    });
  });
});
