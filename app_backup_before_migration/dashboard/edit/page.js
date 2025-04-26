'use client';

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { saveUserProfile } from '@/lib/profileHelpers';

export default function EditProfilePage() {
  const [form, setForm] = useState({
    name: '',
    role: '',
    location: '',
    bio: '',
    portfolio: '',
    image: '',
  });

  const [uid, setUid] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
      } else {
        router.push('/auth');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uid) return;

    await saveUserProfile(uid, form);
    router.push('/dashboard');
  };

  return (
    <div className="p-8 text-white max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Edit Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" onChange={handleChange} value={form.name} placeholder="Your Name" className="w-full p-2 bg-gray-800 rounded" />
        <input name="role" onChange={handleChange} value={form.role} placeholder="Role (e.g. Videographer)" className="w-full p-2 bg-gray-800 rounded" />
        <input name="location" onChange={handleChange} value={form.location} placeholder="Location" className="w-full p-2 bg-gray-800 rounded" />
        <textarea name="bio" onChange={handleChange} value={form.bio} placeholder="Your bio" className="w-full p-2 bg-gray-800 rounded" />
        <input name="portfolio" onChange={handleChange} value={form.portfolio} placeholder="Portfolio Link" className="w-full p-2 bg-gray-800 rounded" />
        <input name="image" onChange={handleChange} value={form.image} placeholder="Profile Image URL" className="w-full p-2 bg-gray-800 rounded" />
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Save Profile</button>
      </form>
    </div>
  );
}
