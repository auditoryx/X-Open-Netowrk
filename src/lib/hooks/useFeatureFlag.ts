import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

export function useFeatureFlag(flagName: string): boolean {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fetchFlag = async () => {
      if (!user) return;
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      const data = snap.data();
      const flags = data?.featureFlags || {};
      setEnabled(!!flags[flagName]);
    };

    fetchFlag();
  }, [user, flagName]);

  return enabled;
}
