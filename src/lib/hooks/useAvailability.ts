'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from './useAuth';

type Slot = { day: string; time: string };

export function useAvailability() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<Slot[]>([]);
  const [notes, setNotes] = useState('');
  const [timezone, setTimezone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAvailability = async () => {
      const ref = doc(db, 'availability', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setAvailability(data.slots || []);
        setNotes(data.notes || '');
        setTimezone(data.timezone || '');
      }
      setLoading(false);
    };

    fetchAvailability();
  }, [user]);

  const saveAvailability = async (slots: Slot[], notes?: string, timezone?: string) => {
    if (!user) return;
    const ref = doc(db, 'availability', user.uid);
    await setDoc(ref, { slots, notes, timezone }, { merge: true });
    setAvailability(slots);
    if (notes !== undefined) setNotes(notes);
    if (timezone !== undefined) setTimezone(timezone);
  };

  return { availability, saveAvailability, loading, notes, setNotes, timezone, setTimezone };
}
