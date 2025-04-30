import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export async function toggleFavorite(uid: string, creatorId: string, save: boolean) {
  const db = getFirestore(app);
  const ref = doc(db, 'users', uid);

  await updateDoc(ref, {
    favorites: save ? arrayUnion(creatorId) : arrayRemove(creatorId),
  }).catch(async (err) => {
    if (err.code === 'not-found') {
      await setDoc(ref, {
        favorites: [creatorId],
      }, { merge: true });
    } else {
      throw err; // Rethrow if it's a different error
    }
  });
}
