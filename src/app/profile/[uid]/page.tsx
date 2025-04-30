'use client';

import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/app/firebase';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ReviewList } from '@/components/reviews/ReviewList';
import { PortfolioGrid } from '@/components/profile/PortfolioGrid';
import { SaveButton } from '@/components/profile/SaveButton';

export default function PublicProfilePage() {
  const params = useParams();
  const uid = params?.uid as string;
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
      <h1 className="text-3xl font-bold mb-2">{profile.name || 'Unnamed User'}</h1>
      <p className="mb-2 max-w-xl text-center">{profile.bio || 'No bio provided.'}</p>

      {profile.location && (
        <p className="text-gray-400 text-sm mb-2">📍 {profile.location}</p>
      )}

      {profile.socialLink && (
        <a
          href={profile.socialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline mb-4"
        >
          Visit My Link
        </a>
      )}

      <div className="mb-6">
        <SaveButton providerId={uid} />
      </div>

      {profile.availability && profile.availability.length > 0 && (
        <div className="mb-6 w-full max-w-xl">
          <h2 className="text-xl font-semibold mb-2">🗓️ Availability</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {profile.availability.map((slot: string, idx: number) => (
              <li key={idx} className="bg-gray-800 px-3 py-1 rounded">
                {slot}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ReviewList providerId={uid} />
      <PortfolioGrid items={profile.portfolio || []} />
    </div>
  );
}
