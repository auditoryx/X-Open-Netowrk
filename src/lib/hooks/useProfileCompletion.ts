import { UserProfile } from '@/types/user';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useProfileCompletion(profile: UserProfile) {
  const [score, setScore] = useState(0);
  const [checklist, setChecklist] = useState<Array<{key: string, label: string, done: boolean}>>([]);

  useEffect(() => {
    const calculateCompletion = () => {
      const items = [
        { key: 'bio', label: 'Add a bio', done: !!profile.bio },
        { key: 'services', label: 'Add at least 1 service', done: profile.services?.length > 0 },
        { key: 'availability', label: 'Set availability', done: profile.availability?.length > 0 },
        { key: 'media', label: 'Upload portfolio media', done: profile.media?.length > 0 },
        {
          key: 'socials',
          label: 'Add at least one social link',
          done: !!(profile.socials?.instagram || profile.socials?.twitter || profile.socials?.spotify),
        },
        {
          key: 'verification',
          label: 'Complete ID verification',
          done: profile.verificationStatus === 'verified',
        }
      ];

      const completionScore = Math.round((items.filter(i => i.done).length / items.length) * 100);
      
      setChecklist(items);
      setScore(completionScore);

      // Update Firestore with calculated score if it's different
      if (profile.uid && profile.profileCompletionScore !== completionScore) {
        updateDoc(doc(db, 'users', profile.uid), {
          profileCompletionScore: completionScore,
        }).catch(err => {
          console.warn('Failed to update profile completion score:', err);
        });
      }
    };

    calculateCompletion();
  }, [profile]);

  return { score, checklist };
}
