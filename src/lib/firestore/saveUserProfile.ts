import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function saveUserProfile(profile: {
  displayName: string;
  bio: string;
  location: string;
  timezone: string;
}) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user?.uid) throw new Error('User not logged in.');

  const profileRef = doc(db, 'users', user.uid);
  await setDoc(profileRef, {
    displayName: profile.displayName,
    bio: profile.bio,
    location: profile.location,
    timezone: profile.timezone,
    updatedAt: new Date(),
  }, { merge: true });
}
