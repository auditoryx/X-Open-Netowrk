'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  doc,
  setDoc,
  serverTimestamp,
  getFirestore,
} from 'firebase/firestore';
import { v4 as uuid } from 'uuid';
import { app } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import OnboardingStepHeader from '@/components/onboarding/OnboardingStepHeader';
import LocationAutocomplete from '@/components/explore/LocationAutocomplete';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import toast from 'react-hot-toast';

const WeeklyCalendarSelector = dynamic(
  () => import('@/components/booking/WeeklyCalendarSelector').then(mod => mod.WeeklyCalendarSelector),
  { ssr: false }
);
import { addDays, startOfWeek, format } from 'date-fns';
import { onboardingByRole } from '@/constants/onboardingByRole';
import { setVerification } from '@/lib/firestore/setVerification';

export default function ApplyRolePage() {
  const router = useRouter();
  const rawParams = useParams();
  const role = typeof rawParams.role === 'string' ? rawParams.role : Array.isArray(rawParams.role) ? rawParams.role[0] : '';

  const { user, userData, loading } = useAuth();

  const steps = onboardingByRole[role as keyof typeof onboardingByRole] || [];
  const [stepIndex, setStepIndex] = useState(0);
  const totalSteps = steps.length;
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState('');
  const [location, setLocation] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');
  const [minBpm, setMinBpm] = useState<number | undefined>(undefined);
  const [maxBpm, setMaxBpm] = useState<number | undefined>(undefined);
  const [availabilitySlots, setAvailabilitySlots] = useState<string[]>([]);
  const [agreedToVerify, setAgreedToVerify] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [externalLinks, setExternalLinks] = useState<string[]>(['']);
  const [verificationReason, setVerificationReason] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`applyDraft-${role}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setStepIndex(data.stepIndex || 0);
        setBio(data.bio || '');
        setLinks(data.links || '');
        setLocation(data.location || '');
        setGenres(data.genres || []);
        setMinBpm(data.minBpm);
        setMaxBpm(data.maxBpm);
        setAvailabilitySlots(data.availabilitySlots || []);
        setAgreedToVerify(!!data.agreedToVerify);
        setExternalLinks(data.externalLinks || ['']);
        setVerificationReason(data.verificationReason || '');
      } catch (e) {
        console.error(e);
      }
    }
  }, [role]);

  useEffect(() => {
    const data = {
      stepIndex,
      bio,
      links,
      location,
      genres,
      minBpm,
      maxBpm,
      availabilitySlots,
      agreedToVerify,
      externalLinks,
      verificationReason,
    };
    localStorage.setItem(`applyDraft-${role}`, JSON.stringify(data));
  }, [stepIndex, bio, links, location, genres, minBpm, maxBpm, availabilitySlots, agreedToVerify, role]);

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

  const addExternalLink = () => {
    setExternalLinks([...externalLinks, '']);
  };

  const updateExternalLink = (index: number, value: string) => {
    const updated = [...externalLinks];
    updated[index] = value;
    setExternalLinks(updated);
  };

  const removeExternalLink = (index: number) => {
    if (externalLinks.length > 1) {
      setExternalLinks(externalLinks.filter((_, i) => i !== index));
    }
  };

  async function handleSubmitApplication() {
    if (!agreedToVerify) {
      toast.error('You must agree to complete ID verification.');
      setError('You must agree to complete ID verification.');
      return;
    }

    const applicationRef = doc(
      getFirestore(app),
      'applications',
      user?.uid ?? uuid()
    );

    const applicationData = {
      role,
      uid: user?.uid,
      name: userData?.name || user?.displayName || '',
      location,
      portfolio: links,
      agreedToVerify,
      createdAt: serverTimestamp(),
      approved: false,
      status: 'pending'
    };

    setError('');
    setIsSubmitting(true);
    
    try {
      // Submit the application
      await setDoc(applicationRef, applicationData);
      
      // Create verification document if verification fields are provided
      const validExternalLinks = externalLinks.filter(link => link.trim());
      if (validExternalLinks.length > 0 && verificationReason.trim()) {
        await setVerification(user.uid, validExternalLinks, verificationReason);
      }
      
      toast.success('Application submitted!');
      setSubmitted(true);
      // Clear draft from localStorage
      localStorage.removeItem(`applyDraft-${role}`);
    } catch (err) {
      console.error('❌ Application error:', err);
      setError('Failed to submit. Please try again.');
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (!user) return <div className="text-red-500 p-8 text-center">You must be logged in to apply.</div>;

  const stepName = steps[stepIndex];

  const stepContent: Record<string, JSX.Element> = {
    basic: (
      <>
        <div>
          <label htmlFor="location" className="text-sm mb-1 block">
            City / Location
          </label>
          <LocationAutocomplete
            id="location"
            value={location}
            onChange={(v) => setLocation(v)}
            onSelect={(name) => setLocation(name)}
          />
        </div>
        <div>
          <label htmlFor="bio" className="text-sm mb-1 block">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us what you do, your experience, style, and any key work."
            rows={5}
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
          />
        </div>
      </>
    ),
    music: (
      <>
        <div>
          <label htmlFor="genres" className="text-sm mb-1 block">Genres</label>
          <div className="flex flex-wrap gap-1 mb-1">
            {genres.map((g) => (
              <span key={g} className="bg-neutral-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                {g}
                <button type="button" onClick={() => setGenres(genres.filter(x => x !== g))}>×</button>
              </span>
            ))}
          </div>
          <input
            id="genres"
            type="text"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = genreInput.trim();
                if (val) setGenres([...genres, val]);
                setGenreInput('');
              }
            }}
            className="input-base"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="min-bpm" className="text-sm mb-1 block">Min BPM</label>
            <input
              id="min-bpm"
              type="number"
              value={minBpm ?? ''}
              onChange={(e) => setMinBpm(e.target.value ? +e.target.value : undefined)}
              className="input-base"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="max-bpm" className="text-sm mb-1 block">Max BPM</label>
            <input
              id="max-bpm"
              type="number"
              value={maxBpm ?? ''}
              onChange={(e) => setMaxBpm(e.target.value ? +e.target.value : undefined)}
              className="input-base"
            />
          </div>
        </div>
      </>
    ),
    photos: (
      <div>
        <label htmlFor="photos" className="text-sm mb-1 block">Upload Photos</label>
        <input
          id="photos"
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
        />
      </div>
    ),
    reel: (
      <div>
        <label htmlFor="reel" className="text-sm mb-1 block">Reel Link</label>
        <input
          id="reel"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="Vimeo or YouTube URL"
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
        />
      </div>
    ),
    travel: (
      <div>
        <label htmlFor="travel" className="text-sm mb-1 block">Travel Details</label>
        <input
          id="travel"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="Travel radius or day rate"
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
        />
      </div>
    ),
    audio: (
      <div>
        <label htmlFor="audio" className="text-sm mb-1 block">Audio Links</label>
        <input
          id="audio"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="Upload MP3 or link"
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
        />
      </div>
    ),
    beats: (
      <div>
        <label htmlFor="beats" className="text-sm mb-1 block">Beat Links</label>
        <input
          id="beats"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="Upload beats or link BeatStars"
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
        />
      </div>
    ),
    portfolio: (
      <div>
        <label htmlFor="portfolio" className="text-sm mb-1 block">Portfolio Links</label>
        <input
          id="portfolio"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="Before/after mixes, etc."
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
        />
      </div>
    ),
    pricing: (
      <div>
        <label htmlFor="pricing" className="text-sm mb-1 block">Pricing Details</label>
        <input
          id="pricing"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="Describe your pricing"
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
        />
      </div>
    ),
    rooms: (
      <div>
        <label htmlFor="rooms" className="text-sm mb-1 block">Rooms & Capacities</label>
        <textarea
          id="rooms"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="List room names and capacities"
          rows={3}
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
        />
      </div>
    ),
    gear: (
      <div>
        <label htmlFor="gear" className="text-sm mb-1 block">Gear List</label>
        <textarea
          id="gear"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="Mics, console, outboard"
          rows={3}
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
        />
      </div>
    ),
    availability: (
      <div>
        <label htmlFor="availability" className="text-sm mb-1 block">Availability</label>
        <Suspense fallback={<div className="p-4">Loading calendar...</div>}>
          <WeeklyCalendarSelector
            id="availability"
            availability={allAvailability}
            multiSelect
            onSelect={(slots) =>
              setAvailabilitySlots(Array.isArray(slots) ? slots : [slots])
            }
          />
        </Suspense>
      </div>
    ),
    verification: (
      <div className="space-y-4">
        <div>
          <label htmlFor="verification-reason" className="text-sm mb-1 block">
            Why should you be verified? <span className="text-gray-500">(Optional)</span>
          </label>
          <textarea
            id="verification-reason"
            value={verificationReason}
            onChange={(e) => setVerificationReason(e.target.value)}
            placeholder="Briefly explain your professional background and why you should be verified..."
            rows={3}
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="text-sm mb-1 block">
            External Links <span className="text-gray-500">(Optional - Spotify, Instagram, SoundCloud, etc.)</span>
          </label>
          {externalLinks.map((link, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                value={link}
                onChange={(e) => updateExternalLink(index, e.target.value)}
                placeholder="https://open.spotify.com/artist/..."
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
              />
              {externalLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExternalLink(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addExternalLink}
            className="text-blue-400 text-sm hover:text-blue-300"
          >
            + Add another link
          </button>
        </div>
      </div>
    ),
    verify: (
      <div className="flex items-center gap-2">
        <input
          id="verify"
          type="checkbox"
          checked={agreedToVerify}
          onChange={(e) => setAgreedToVerify(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="verify" className="text-sm">
          I agree to complete ID verification
        </label>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-2xl mx-auto py-12 px-6">
        <OnboardingStepHeader
          step={stepIndex + 1}
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
              {(externalLinks.some(link => link.trim()) && verificationReason.trim()) && (
                <span className="block mt-2 p-3 bg-blue-900/30 border border-blue-700 rounded text-blue-200 text-sm">
                  ✅ You've successfully submitted a verification request. Reviews typically take 2–3 days.
                </span>
              )}
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
              {stepContent[stepName] || <div>{stepName}</div>}

              <div className="flex gap-3 pt-2">
                {stepIndex > 0 && (
                  <button
                    onClick={() => setStepIndex(stepIndex - 1)}
                    className="bg-neutral-700 px-4 py-2 rounded"
                  >
                    Back
                  </button>
                )}
                {stepIndex < totalSteps - 1 ? (
                  <button
                    onClick={() => setStepIndex(stepIndex + 1)}
                    className="bg-white text-black px-4 py-2 rounded font-semibold"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitApplication}
                    disabled={isSubmitting}
                    className="bg-white text-black px-4 py-2 rounded font-semibold"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
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
