'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { cityToCoords } from '@/lib/utils/cityToCoords';
import OnboardingStepHeader from '@/components/onboarding/OnboardingStepHeader';
import LocationAutocomplete from '@/components/explore/LocationAutocomplete';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const WeeklyCalendarSelector = dynamic(
  () => import('@/components/booking/WeeklyCalendarSelector').then(mod => mod.WeeklyCalendarSelector),
  { ssr: false }
);
import { addDays, startOfWeek, format } from 'date-fns';

export default function ApplyRolePage() {
  const router = useRouter();
  const rawParams = useParams();
  const role = typeof rawParams.role === 'string' ? rawParams.role : Array.isArray(rawParams.role) ? rawParams.role[0] : '';

  const { user, userData, loading } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`applyDraft-${role}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setStep(data.step || 1);
        setBio(data.bio || '');
        setLinks(data.links || '');
        setLocation(data.location || '');
        setAvailabilitySlots(data.availabilitySlots || []);
        setVerified(!!data.verified);
      } catch (e) {
        console.error(e);
      }
    }
  }, [role]);

  useEffect(() => {
    const data = {
      step,
      bio,
      links,
      location,
      availabilitySlots,
      verified,
    };
    localStorage.setItem(`applyDraft-${role}`, JSON.stringify(data));
  }, [step, bio, links, location, availabilitySlots, verified, role]);

  const HOURS = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const allAvailability = [...Array(7)].flatMap((_, dayIndex) => {
    const date = addDays(start, dayIndex);
    const dateStr = format(date, 'yyyy-MM-dd');
    return HOURS.map((h) => `${dateStr}T${h}`);
  });

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

    const slots = availabilitySlots.map((dt) => {
      const [datePart, time] = dt.split('T');
      const day = new Date(datePart).toLocaleDateString('en-US', {
        weekday: 'long',
      });
      return { day, time };
    });

    await addDoc(collection(db, 'pendingVerifications'), {
      uid: user.uid,
      email: userData?.email || user.email,
      name: userData?.name || user.displayName || '',
      role,
      bio,
      links,
      location,
      photo: photo ? photo.name : null,
      availabilitySlots: slots,
      verified,
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
          step={step}
          total={totalSteps}
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
              {step === 1 && (
                <>
                  <div>
                    <label className="text-sm mb-1 block">City / Location</label>
                    <LocationAutocomplete
                      value={location}
                      onChange={(v) => setLocation(v)}
                      onSelect={(name) => setLocation(name)}
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
                </>
              )}

              {step === 2 && (
                <div>
                  <label className="text-sm mb-1 block">Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
                  />
                </div>
              )}

              {step === 3 && (
                <div>
                  <label className="text-sm mb-1 block">Portfolio / Social Links</label>
                  <input
                    value={links}
                    onChange={(e) => setLinks(e.target.value)}
                    placeholder="e.g. Instagram, website, YouTube, etc."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
                  />
                </div>
              )}

              {step === 4 && (
                <div>
                  <label className="text-sm mb-1 block">Availability</label>
                  <Suspense fallback={<div className="p-4">Loading calendar...</div>}>
                    <WeeklyCalendarSelector
                      availability={allAvailability}
                      multiSelect
                      onSelect={(slots) =>
                        setAvailabilitySlots(
                          Array.isArray(slots) ? slots : [slots]
                        )
                      }
                    />
                  </Suspense>
                </div>
              )}

              {step === 5 && (
                <div className="flex items-center gap-2">
                  <input
                    id="verify"
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="verify" className="text-sm">
                    I agree to complete ID verification
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="bg-neutral-700 px-4 py-2 rounded"
                  >
                    Back
                  </button>
                )}
                {step < totalSteps ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="bg-white text-black px-4 py-2 rounded font-semibold"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="bg-white text-black px-4 py-2 rounded font-semibold"
                  >
                    Submit Application
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
