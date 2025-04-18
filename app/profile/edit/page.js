'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export default function EditProfilePage() {
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    role: '',
    location: '',
    portfolio: '',
    image: '',
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) return router.push('/');
      setUser(authUser);

      const docRef = doc(db, 'users', authUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setForm(docSnap.data());
      }
    });

    return () => unsub();
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, 'users', user.uid), form, { merge: true });
    alert('Profile updated!');
    router.push(`/profile/${user.uid}`);
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full p-2 rounded bg-gray-800 text-white" />
        <input type="text" name="role" value={form.role} onChange={handleChange} placeholder="Role" className="w-full p-2 rounded bg-gray-800 text-white" />
        <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Location" className="w-full p-2 rounded bg-gray-800 text-white" />
        <input type="text" name="portfolio" value={form.portfolio} onChange={handleChange} placeholder="Portfolio Link" className="w-full p-2 rounded bg-gray-800 text-white" />
        <input type="text" name="image" value={form.image} onChange={handleChange} placeholder="Image URL" className="w-full p-2 rounded bg-gray-800 text-white" />
        <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" className="w-full p-2 rounded bg-gray-800 text-white" rows="4" />
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
