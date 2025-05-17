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
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!user) return setError('You must be logged in to apply.');
    if (!bio.trim() || !links.trim()) return setError('All fields are required.');

    await addDoc(collection(db, 'pendingVerifications'), {
      uid: user.uid,
      email: user.email,
      name: user.displayName || '',
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
      <div className="max-w-2xl mx-auto py-12 px-6">
        {submitted ? (
          <div className="text-center space-y-4">
            <div className="text-4xl text-green-400">✅</div>
            <h2 className="text-2xl font-bold">Application Submitted</h2>
            <p className="text-gray-400">
              Thanks for applying as a <strong>{params.role}</strong>. Our team will review your request and follow up shortly.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold capitalize mb-2">Apply as {params.role}</h1>
            <p className="text-gray-400 mb-6">
              Fill out the form to request verification as a {params.role}. Be clear and professional — this helps us verify you faster.
            </p>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="text-sm mb-1 block">Name</label>
                <input
                  value={user?.displayName || ''}
                  disabled
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-gray-300"
                />
              </div>

              <div>
                <label className="text-sm mb-1 block">Email</label>
                <input
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-gray-300"
                />
              </div>

              <div>
                <label className="text-sm mb-1 block">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us what you do, your experience, style, and any key work."
                  rows={5}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-sm mb-1 block">Portfolio / Social Links</label>
                <input
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  placeholder="e.g. Instagram, website, YouTube, etc."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="mt-4 bg-white text-black font-semibold px-6 py-2 rounded hover:bg-gray-200 transition"
              >
                Submit Application
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
