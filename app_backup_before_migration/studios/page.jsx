'use client';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function StudiosPage() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const snap = await getDocs(collection(db, 'profiles'));
      const filtered = snap.docs
        .map(doc => doc.data())
        .filter(profile => profile.role?.toLowerCase() === 'studio');
      setProfiles(filtered);
    };
    fetchProfiles();
  }, []);

  return (
    <div className="p-6 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Browse Studios</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map(profile => (
          <Link key={profile.id} href={`/profile/${profile.id}`} className="bg-gray-900 p-4 rounded shadow">
            <img src={profile.image} alt={profile.name} className="w-full h-40 object-cover rounded" />
            <h2 className="text-xl font-semibold mt-2">{profile.name}</h2>
            <p className="text-gray-400">{profile.location}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
