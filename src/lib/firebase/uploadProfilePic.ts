import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';

export async function uploadProfilePic(file: File, userId: string): Promise<string> {
  const storage = getStorage(app);
  const storageRef = ref(storage, `profile-pictures/${userId}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}
