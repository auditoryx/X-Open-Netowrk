'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { assignRole } from '@/lib/assignRole';
import { logActivity } from '@/lib/firestore/logging/logActivity';

export default function ProfileForm() {
  const [form, setForm] = useState({
    visible: true,
    name: '',
    role: '',
    bio: '',
    instagram: '',
    availability: '',
    location: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  });

  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setForm((prev) => ({ ...prev, ...snap.data() }));
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
      await setDoc(doc(db, 'users', uid), form, { merge: true });
      await assignRole(uid, form.role);
      await logActivity(uid, 'profile_update', {
        name: form.name,
        role: form.role,
      });

      alert('Profile saved and role assigned!');
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const getCompletionPercent = () => {
    const fields = ['name', 'role', 'bio', 'instagram', 'availability', 'location', 'timezone'];
    const filled = fields.filter((key) => !!form[key as keyof typeof form]);
    return Math.round((filled.length / fields.length) * 100);
  };

  const percent = getCompletionPercent();

  return (
    <div className="space-y-6 max-w-xl">
      <div className="w-full bg-neutral-800 h-3 rounded">
        <div
          className="h-3 bg-blue-500 rounded transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-gray-400">{percent}% complete</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input\1 id="auto-id" name="auto-name"\2>
        <input\1 id="auto-id" name="auto-name"\2>
        <textarea name="bio" placeholder="Short Bio" value={form.bio} onChange={handleChange} className="textarea-base" />
        <input\1 id="auto-id" name="auto-name"\2>
        <input\1 id="auto-id" name="auto-name"\2>
        <input\1 id="auto-id" name="auto-name"\2>
        <input\1 id="auto-id" name="auto-name"\2>

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

        <button type="submit" className="btn btn-primary">Save Profile</button>
      </form>
    </div>
  );
}
