'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
// Update the import path below if your firebaseConfig file is located elsewhere
import { db } from '../../../firebase/firebaseConfig';
import { useAuth } from './useAuth';

type Slot = { day: string; time: string };

export function useAvailability() {
  const { user } = useAuth();

  const [availability, setAvailability] = useState<Slot[]>([]);
  const [busySlots, setBusySlots] = useState<Slot[]>([]);
  const [notes, setNotes] = useState('');
  const [timezone, setTimezone] = useState('');
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      const ref = doc(db, 'availability', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setAvailability(data.slots || []);
        setBusySlots(data.busySlots || []);
        setNotes(data.notes || '');
        setTimezone(data.timezone || '');
        setLastSynced(data.lastSynced || null);
      }
      setLoading(false);
    };

    fetch();
  }, [user]);

  const saveAvailability = async (
    slots: Slot[],
    notes: string,
    timezone: string
  ) => {
    if (!user) return;
    const ref = doc(db, 'availability', user.uid);
    await setDoc(ref, { slots, notes, timezone }, { merge: true });

    // Also store slots on the user profile for easy reference in bookings
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { availabilitySlots: slots }, { merge: true });

    setAvailability(slots);
    setNotes(notes);
    setTimezone(timezone);
  };

  const addBusySlots = async (slots: Slot[]) => {
    if (!user) return;
    const ref = doc(db, 'availability', user.uid);
    await setDoc(ref, { busySlots: slots, lastSynced: new Date().toISOString() }, { merge: true });
    setBusySlots(slots);
    setLastSynced(new Date().toISOString());
  };

  return {
    availability,
    busySlots,
    notes,
    timezone,
    lastSynced,
    loading,
    saveAvailability,
    addBusySlots,
    setNotes,
    setTimezone,
  };
}
