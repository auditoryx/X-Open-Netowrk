import { createFilterPreset, fetchFilterPresets } from '@/lib/firestore/savedFilters';
import { filtersToQueryString } from '@/lib/explore/filterUtils';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  doc,
  deleteDoc,
} from 'firebase/firestore';

jest.mock('@/lib/firebase', () => ({ app: {} }));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(() => 'ts'),
  doc: jest.fn(),
  deleteDoc: jest.fn(),
}));

const mockedCollection = collection as jest.MockedFunction<typeof collection>;
const mockedAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedCollection.mockReturnValue('col' as any);
});

test('save -> fetch -> apply', async () => {
  await createFilterPreset('u1', 'test', { role: 'artist' });
  expect(mockedAddDoc).toHaveBeenCalledWith('col', {
    name: 'test',
    filtersJson: JSON.stringify({ role: 'artist' }),
    createdAt: 'ts',
  });

  mockedGetDocs.mockResolvedValue({
    docs: [
      {
        id: 'id1',
        data: () => ({ name: 'test', filtersJson: JSON.stringify({ role: 'artist' }) }),
      },
    ],
  } as any);

  const list = await fetchFilterPresets('u1');
  expect(list).toEqual([{ id: 'id1', name: 'test', filters: { role: 'artist' } }]);

  const qs = filtersToQueryString(list[0].filters);
  expect(qs).toBe('role=artist');
});
