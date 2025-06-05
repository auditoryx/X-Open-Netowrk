import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), snap => {
      setProfile(snap.exists() ? snap.data() : null);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  return profile;
}
