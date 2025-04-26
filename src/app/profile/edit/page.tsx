'use client';

import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { app, db } from '@/app/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { uploadProfilePic } from '@/lib/firebase/uploadProfilePic';

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || '');
        setBio(data.bio || '');
        setInstagram(data.socials?.instagram || '');
        setTwitter(data.socials?.twitter || '');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) return;

    let profilePicUrl = undefined;
    if (profilePic) {
      profilePicUrl = await uploadProfilePic(profilePic, user.uid);
    }

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      name,
      bio,
      socials: {
        instagram,
        twitter,
      },
      ...(profilePicUrl && { profilePicUrl }),
    }, { merge: true });

    router.push(`/profile/${user.uid}`);
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Your Profile</h1>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Name</label>
        <input className="w-full p-2 border rounded" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Bio</label>
        <textarea className="w-full p-2 border rounded" value={bio} onChange={e => setBio(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Instagram</label>
        <input className="w-full p-2 border rounded" value={instagram} onChange={e => setInstagram(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Twitter</label>
        <input className="w-full p-2 border rounded" value={twitter} onChange={e => setTwitter(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Profile Picture</label>
        <input type="file" accept="image/*" onChange={e => setProfilePic(e.target.files?.[0] || null)} />
      </div>
      <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Profile</button>
    </div>
  );
}
