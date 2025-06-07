import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export type SavedFilter = {
  id: string;
  name: string;
  filters: Record<string, any>;
};

export async function createFilterPreset(uid: string, name: string, filters: Record<string, any>) {
  const db = getFirestore(app);
  await addDoc(collection(db, 'users', uid, 'savedFilters'), {
    name,
    filters,
    createdAt: serverTimestamp(),
  });
}

export async function fetchFilterPresets(uid: string): Promise<SavedFilter[]> {
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, 'users', uid, 'savedFilters'));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<SavedFilter, 'id'>) }));
}

export async function deleteFilterPreset(uid: string, presetId: string) {
  const db = getFirestore(app);
  await deleteDoc(doc(db, 'users', uid, 'savedFilters', presetId));
}
