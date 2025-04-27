'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { app } from '@/app/firebase';

export default function EditProfilePage() {
  const [bio, setBio] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }
      const db = getFirestore(app);
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setBio(data.bio || '');
        setSocialLink(data.socialLink || '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) return;
    const db = getFirestore(app);
    const ref = doc(db, 'users', user.uid);
    await setDoc(ref, {
      bio,
      socialLink,
    }, { merge: true });
    router.push(`/profile/${user.uid}`);
  };

  if (loading) return <div className="p-6 text-white">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Your Profile</h1>
      <form onSubmit={handleSave} className="space-y-4 w-full max-w-md">
        <textarea
          placeholder="Your bio..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-2 rounded text-black"
          rows={4}
          required
        />
        <input
          type="url"
          placeholder="Social link (optional)"
          value={socialLink}
          onChange={(e) => setSocialLink(e.target.value)}
          className="w-full p-2 rounded text-black"
        />
        <button
          type="submit"
          className="w-full bg-white text-black px-6 py-2 rounded hover:bg-gray-300"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}
