'use client';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/firebase';
import Link from 'next/link';

export default function CreatorsPage() {
  const [profiles, setProfiles] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchProfiles = async () => {
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'profiles'));
      const data = snap.docs.map(doc => doc.data());
      setProfiles(data);
    };
    fetchProfiles();
  }, []);

  const filtered = filter === 'All' ? profiles : profiles.filter(p => p.role === filter);

  return (
    <div className="p-6 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Meet the Creators</h1>

      <div className="mb-4 space-x-2">
        {['All', 'Artist', 'Studio', 'Videographer', 'Engineer', 'Producer'].map(role => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            className={`px-4 py-2 rounded ${filter === role ? 'bg-white text-black' : 'bg-gray-700'}`}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(profile => (
          <Link key={profile.id} href={`/profile/${profile.id}`} className="bg-gray-900 p-4 rounded shadow">
            <img src={profile.image} alt={profile.name} className="w-full h-40 object-cover rounded" />
            <h2 className="text-xl font-semibold mt-2">{profile.name}</h2>
            <p className="text-gray-400">{profile.role} — {profile.location}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
