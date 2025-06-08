import { fetchUsers } from '../fetchUsers';
import { collection, getDocs } from 'firebase/firestore';

jest.mock('../firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn()
}));

const mockedCollection = collection as jest.MockedFunction<typeof collection>;
const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedCollection.mockReturnValue('ref' as any);
});

test('fetches users and maps data', async () => {
  mockedGetDocs.mockResolvedValue({
    docs: [{ id: '1', data: () => ({ name: 'Jane' }) }]
  } as any);
  const users = await fetchUsers();
  expect(mockedCollection).toHaveBeenCalledWith({}, 'users');
  expect(users).toEqual([{ id: '1', name: 'Jane' }]);
});
