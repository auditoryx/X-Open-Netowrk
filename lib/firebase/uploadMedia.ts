import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@lib/firebase/init';

export const uploadMedia = async (file: File, uid: string) => {
  const fileRef = ref(storage, `users/${uid}/media/${file.name}`);
  const snapshot = await uploadBytesResumable(fileRef, file);
  return await getDownloadURL(snapshot.ref);
};
