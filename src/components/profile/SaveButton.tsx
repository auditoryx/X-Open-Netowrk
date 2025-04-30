'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';

export function SaveButton({ providerId }: { providerId: string }) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const checkSaved = async () => {
      const ref = doc(db, 'users', user.uid, 'favorites', providerId);
      const snap = await getDoc(ref);
      setIsSaved(snap.exists());
      setLoading(false);
    };

    checkSaved();
  }, [user, providerId]);

  const toggleSave = async () => {
    const ref = doc(db, 'users', user!.uid, 'favorites', providerId);
    if (isSaved) {
      await deleteDoc(ref);
      setIsSaved(false);
    } else {
      await setDoc(ref, { savedAt: new Date() });
      setIsSaved(true);
    }
  };

  if (loading) return null;

  return (
    <button
      onClick={toggleSave}
      className={`px-4 py-2 rounded ${
        isSaved ? 'bg-white text-black' : 'bg-transparent border border-white text-white'
      }`}
    >
      {isSaved ? 'Saved' : 'Save'}
    </button>
  );
}
