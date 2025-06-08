/** @jest-environment jsdom */
import { uploadChatMedia } from '../uploadChatMedia';
import { uploadMediaFile } from '../uploadMedia';
import { uploadProfilePic } from '../uploadProfilePic';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

jest.mock('../../firebase', () => ({ app: {} }));
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn()
}));

const mockedGetStorage = getStorage as jest.MockedFunction<typeof getStorage>;
const mockedRef = ref as jest.MockedFunction<typeof ref>;
const mockedUploadBytes = uploadBytes as jest.MockedFunction<typeof uploadBytes>;
const mockedGetDownloadURL = getDownloadURL as jest.MockedFunction<typeof getDownloadURL>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetStorage.mockReturnValue('storage' as any);
  mockedRef.mockReturnValue('ref' as any);
  mockedGetDownloadURL.mockResolvedValue('url');
});

test('uploadChatMedia', async () => {
  const file = new File(['a'], 'chat.png');
  const url = await uploadChatMedia('b1', file);
  expect(mockedRef).toHaveBeenCalledWith('storage', expect.stringMatching(/^bookings\/b1\/\d+_chat.png$/));
  expect(mockedUploadBytes).toHaveBeenCalledWith('ref', file);
  expect(url).toBe('url');
});

test('uploadMediaFile', async () => {
  const file = new File(['a'], 'media.png');
  const url = await uploadMediaFile(file, 'u1', 'audio');
  expect(mockedRef).toHaveBeenCalledWith('storage', 'users/u1/audio/media.png');
  expect(mockedUploadBytes).toHaveBeenCalledWith('ref', file);
  expect(url).toBe('url');
});

test('uploadProfilePic', async () => {
  const file = new File(['a'], 'pic.png');
  const url = await uploadProfilePic(file, 'u1');
  expect(mockedRef).toHaveBeenCalledWith('storage', 'profile-pictures/u1');
  expect(mockedUploadBytes).toHaveBeenCalledWith('ref', file);
  expect(url).toBe('url');
});
