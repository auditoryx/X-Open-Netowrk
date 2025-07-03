'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProgressiveOnboarding } from '@/components/onboarding/ProgressiveOnboarding';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';
import toast from 'react-hot-toast';
import { Translate } from '@/i18n/Translate';

export function SaveButton({ providerId, providerName }: { providerId: string; providerName?: string }) {
  const { user } = useAuth();
  const { trackAction } = useProgressiveOnboarding();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const checkSaved = async () => {
      const ref = doc(db, 'users', user.uid, 'favorites', providerId);
      const snap = await getDoc(ref);
      setIsSaved(snap.exists());
      setLoading(false);
    };

    checkSaved();
  }, [user, providerId]);

  const toggleSave = async () => {
    if (!user) {
      // Track the favorite attempt for progressive onboarding
      trackAction('favorite_attempt');
      
      // Trigger email capture modal
      window.dispatchEvent(new CustomEvent('show-email-capture', {
        detail: { 
          trigger: 'save_attempt',
          creatorName: providerName 
        }
      }));
      return;
    }

    const ref = doc(db, 'users', user!.uid, 'favorites', providerId);
    if (isSaved) {
      await deleteDoc(ref);
      setIsSaved(false);
    } else {
      await setDoc(ref, { savedAt: new Date() });
      setIsSaved(true);
      toast.success('Added to favorites');
    }
  };

  if (loading) return null;

  return (
    <button
      onClick={toggleSave}
      className="text-xl"
      aria-label={<Translate t="common.saveProvider" /> as unknown as string}
    >
      {isSaved ? <AiFillStar className="text-yellow-500" /> : <AiOutlineStar />}
    </button>
  );
}
