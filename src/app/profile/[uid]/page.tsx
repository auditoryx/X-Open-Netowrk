'use client';

import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/app/firebase';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PublicProfilePage() {
  const { uid } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const db = getFirestore(app);
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data());
      }
      setLoading(false);
    };
    fetchProfile();
  }, [uid]);

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!profile) return <div className="p-6 text-white">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">{profile.name || 'Unnamed User'}</h1>
      <p className="mb-4 max-w-xl text-center">{profile.bio || 'No bio provided.'}</p>
      {profile.socialLink && (
        <a
          href={profile.socialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          Visit My Link
        </a>
      )}
    </div>
  );
}
