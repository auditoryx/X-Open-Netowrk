'use client';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';

export type Slot = { day: string; time: string };

export function useProviderAvailability(uid: string) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [busy, setBusy] = useState<Slot[]>([]);
  const [timezone, setTimezone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const fetch = async () => {
      const ref = doc(db, 'availability', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setSlots(data.slots || []);
        setBusy(data.busySlots || []);
        setTimezone(data.timezone || '');
      } else {
        const userSnap = await getDoc(doc(db, 'users', uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          // availabilitySlots is stored directly on the user profile
          setSlots(data.availabilitySlots || data.availability || []);
          setTimezone(data.timezone || '');
        }
      }
      setLoading(false);
    };
    fetch();
  }, [uid]);

  return { slots, busySlots: busy, timezone, loading };
}
