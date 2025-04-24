'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { assignRole } from '@/lib/assignRole';

export default function ProfileForm() {
  const [form, setForm] = useState({
    visible: true,
    name: '',
    role: '',
    bio: '',
    instagram: '',
    availability: '',
  });
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setForm(snap.data() as typeof form);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) {
      alert('User not authenticated.');
      return;
    }
    try {
      await setDoc(doc(db, 'users', uid), form);
      await assignRole(uid, form.role); // 🔐 Sync role with Firebase Auth
      alert('Profile saved and role assigned!');
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="role" placeholder="Role (e.g., artist)" value={form.role} onChange={handleChange} className="w-full p-2 border rounded" />
      <textarea name="bio" placeholder="Short Bio" value={form.bio} onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="instagram" placeholder="Instagram Handle" value={form.instagram} onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="availability" placeholder="Availability" value={form.availability} onChange={handleChange} className="w-full p-2 border rounded" />
      
      <div className="flex items-center space-x-2">
        <label htmlFor="visible" className="text-sm font-medium">Publicly Visible:</label>
        <input
          type="checkbox"
          name="visible"
          checked={form.visible}
          onChange={() => setForm({ ...form, visible: !form.visible })}
          className="w-5 h-5"
        />
      </div>

      <button type="submit" className="px-4 py-2 bg-black text-white rounded">Save Profile</button>
    </form>
  );
}
// This component allows users to update their profile information.
// It includes fields for name, role, bio, Instagram handle, and availability.
// The visibility toggle allows users to set their profile as public or private.  