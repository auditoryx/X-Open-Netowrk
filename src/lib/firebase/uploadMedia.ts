import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { app } from '@/lib/firebase'

export async function uploadMediaFile(file: File, uid: string, type: string) {
  const storage = getStorage(app);
  const fileRef = ref(storage, `users/${uid}/${type}/${file.name}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return url;
}
