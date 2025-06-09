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
  query,
  where,
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
  query: jest.fn(),
  where: jest.fn(),
}));

const mockedCollection = collection as jest.MockedFunction<typeof collection>;
const mockedAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockedQuery = query as jest.MockedFunction<typeof query>;
const mockedWhere = where as jest.MockedFunction<typeof where>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedCollection.mockReturnValue('col' as any);
  mockedQuery.mockReturnValue('q' as any);
  mockedWhere.mockReturnValue('w' as any);
});

test('save -> fetch -> apply', async () => {
  await createFilterPreset('u1', 'test', { role: 'artist' });
  expect(mockedAddDoc).toHaveBeenCalledWith('col', {
    userId: 'u1',
    name: 'test',
    filtersJson: JSON.stringify({ role: 'artist' }),
    createdAt: 'ts',
  });

  mockedGetDocs.mockResolvedValue({
    docs: [
      {
        id: 'id1',
        data: () => ({
          name: 'test',
          filtersJson: JSON.stringify({ role: 'artist' }),
          userId: 'u1',
        }),
      },
    ],
  } as any);

  const list = await fetchFilterPresets('u1');
  expect(list).toEqual([{ id: 'id1', name: 'test', filters: { role: 'artist' } }]);

  const qs = filtersToQueryString(list[0].filters);
  expect(qs).toBe('role=artist');
});
