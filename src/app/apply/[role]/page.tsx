'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { cityToCoords } from '@/lib/utils/cityToCoords';
import OnboardingStepHeader from '@/components/onboarding/OnboardingStepHeader';

export default function ApplyRolePage() {
  const router = useRouter();
  const rawParams = useParams();
  const role = typeof rawParams.role === 'string' ? rawParams.role : Array.isArray(rawParams.role) ? rawParams.role[0] : '';

  const { user, userData, loading } = useAuth();
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/apply/${role}`);
    }
  }, [user, loading, role, router]);

  const handleSubmit = async () => {
    setError('');
    if (!user) return setError('You must be logged in to apply.');
    if (!bio.trim() || !links.trim() || !location.trim()) {
      return setError('All fields are required.');
    }

    const cleanedCity = location.toLowerCase().replace(/\s+/g, '');
    const fallbackCoords = cityToCoords[cleanedCity];
    let locationLat = null;
    let locationLng = null;

    if (fallbackCoords) {
      locationLng = fallbackCoords[0];
      locationLat = fallbackCoords[1];
    }

    await addDoc(collection(db, 'pendingVerifications'), {
      uid: user.uid,
      email: userData?.email || user.email,
      name: userData?.name || user.displayName || '',
      role,
      bio,
      links,
      location,
      locationLat,
      locationLng,
      timestamp: serverTimestamp(),
    });

    setSubmitted(true);
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (!user) return <div className="text-red-500 p-8 text-center">You must be logged in to apply.</div>;

  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-2xl mx-auto py-12 px-6">
        <OnboardingStepHeader
          step={1}
          total={3}
          title={`Apply as ${role}`}
          subtitle="Tell us who you are so we can verify you."
        />

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="text-4xl text-green-400">✅</div>
            <h2 className="text-2xl font-bold">Application Submitted</h2>
            <p className="text-gray-400">
              Thanks for applying as a <strong>{role}</strong>. Our team will review your request and follow up shortly.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold capitalize mb-2">Apply as {role}</h1>
            <p className="text-gray-400 mb-6">
              Fill out the form to request verification as a {role}. Be clear and professional — this helps us verify you faster.
            </p>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="text-sm mb-1 block">City / Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Tokyo, NYC, Paris"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
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
