import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

export type SavedFilter = {
  id: string;
  name: string;
  filters: Record<string, any>;
};

export async function createFilterPreset(
  uid: string,
  name: string,
  filters: Record<string, any>
) {
  const db = getFirestore(app);
  await addDoc(collection(db, 'savedFilters'), {
    userId: uid,
    name,
    filtersJson: JSON.stringify(filters),
    createdAt: serverTimestamp(),
  });
}

export async function fetchFilterPresets(uid: string): Promise<SavedFilter[]> {
  const db = getFirestore(app);
  const snap = await getDocs(
    query(collection(db, 'savedFilters'), where('userId', '==', uid))
  );
  return snap.docs.map(d => {
    const data = d.data() as any;
    return {
      id: d.id,
      name: data.name,
      filters: data.filtersJson ? JSON.parse(data.filtersJson) : {},
    } as SavedFilter;
  });
}

export async function deleteFilterPreset(uid: string, presetId: string) {
  const db = getFirestore(app);
  const snap = await getDocs(
    query(collection(db, 'savedFilters'), where('userId', '==', uid))
  );
  const target = snap.docs.find(d => d.id === presetId);
  if (target) {
    await deleteDoc(target.ref);
  }
}
