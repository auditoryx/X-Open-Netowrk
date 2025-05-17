'use client';

import { useState } from 'react';
import Navbar from '@/app/components/Navbar';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ApplyRolePage({ params }: { params: { role: string } }) {
  const { user } = useAuth();
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!user) return alert('You must be logged in to apply.');

    await addDoc(collection(db, 'pendingVerifications'), {
      uid: user.uid,
      email: user.email,
      role: params.role,
      bio,
      links,
      timestamp: serverTimestamp(),
    });

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <h1 className="text-3xl font-bold capitalize">Apply as {params.role}</h1>
        {submitted ? (
          <div className="text-green-400 text-lg mt-6">
            ✅ Application submitted! Our team will review your request shortly.
          </div>
        ) : (
          <>
            <p className="text-gray-400">
              Fill out the form below to apply for a verified {params.role} profile on AuditoryX.
            </p>

            <textarea
              className="w-full p-3 rounded bg-neutral-800 border border-neutral-700 text-sm"
              rows={5}
              placeholder="Tell us about your work, experience, and what you offer..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <input
              className="w-full p-3 rounded bg-neutral-800 border border-neutral-700 text-sm"
              placeholder="Portfolio or social media links"
              value={links}
              onChange={(e) => setLinks(e.target.value)}
            />

            <button
              onClick={handleSubmit}
              className="bg-white text-black font-semibold px-6 py-2 rounded hover:bg-gray-200"
            >
              Submit Application
            </button>
          </>
        )}
      </div>
    </div>
  );
}
