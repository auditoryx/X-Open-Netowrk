import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
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
  await addDoc(collection(db, 'users', uid, 'savedFilters'), {
    name,
    filtersJson: JSON.stringify(filters),
    createdAt: serverTimestamp(),
  });
}

export async function fetchFilterPresets(uid: string): Promise<SavedFilter[]> {
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, 'users', uid, 'savedFilters'));
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
  await deleteDoc(doc(db, 'users', uid, 'savedFilters', presetId));
}
