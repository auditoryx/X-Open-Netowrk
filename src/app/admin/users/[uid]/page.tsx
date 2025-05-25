'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/app/components/Navbar';

export default function AdminUserPage() {
  const { uid: rawUid } = useParams();
  const uid = typeof rawUid === 'string' ? rawUid : Array.isArray(rawUid) ? rawUid[0] : '';
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!uid) return;
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUser(snap.data());
      }
      setLoading(false);
    };

    fetchUser();
  }, [uid]);

  if (loading) return <div className="p-6 text-white">Loading user...</div>;
  if (!user) return <div className="p-6 text-white">User not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-6">Admin: {user.name || 'Unnamed User'}</h1>
        <p><span className="text-gray-400">UID:</span> {uid}</p>
        <p><span className="text-gray-400">Email:</span> {user.email || 'N/A'}</p>
        <p><span className="text-gray-400">Role:</span> {user.role || 'N/A'}</p>
        <p><span className="text-gray-400">Pro Tier:</span> {user.proTier || 'standard'}</p>
        <p><span className="text-gray-400">Verified:</span> {user.verified ? '✔ Yes' : '✖ No'}</p>
        <p><span className="text-gray-400">Location:</span> {user.location || 'Unknown'}</p>
      </div>
    </div>
  );
}
