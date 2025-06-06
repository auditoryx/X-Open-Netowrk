import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { storage } from '../../../lib/firebase/init';

export async function deleteMediaSample(uid: string, sample: { type: string; url: string }) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    mediaSamples: arrayRemove(sample),
  });

  const pathMatch = sample.url.match(/%2Fusers%2F(.*?)\?alt/);
  if (pathMatch && pathMatch[1]) {
    const decodedPath = decodeURIComponent(pathMatch[1]);
    const fileRef = ref(storage, `users/${decodedPath}`);
    await deleteObject(fileRef);
  } else {
    console.warn('❗ Unable to extract file path from URL:', sample.url);
  }
}
