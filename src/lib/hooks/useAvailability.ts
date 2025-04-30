'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from './useAuth';

export function useAvailability() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAvailability = async () => {
      const ref = doc(db, 'availability', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setAvailability(snap.data().slots || []);
      }
      setLoading(false);
    };

    fetchAvailability();
  }, [user]);

  const saveAvailability = async (slots: string[]) => {
    if (!user) return;
    const ref = doc(db, 'availability', user.uid);
    await setDoc(ref, { slots }, { merge: true });
    setAvailability(slots);
  };

  return { availability, saveAvailability, loading };
}
