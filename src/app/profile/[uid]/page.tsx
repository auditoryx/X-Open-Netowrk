'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { ReviewList } from '@/components/reviews/ReviewList';
import MediaCarousel from '@/components/profile/MediaCarousel';
import { SaveButton } from '@/components/profile/SaveButton';
import { PointsBadge } from '@/components/profile/PointsBadge';
import { VerifiedProgress } from '@/components/profile/VerifiedProgress';
import BookingForm from '@/components/booking/BookingForm';
import ProfileActionBar from '@/components/profile/ProfileActionBar';
import { getAverageRating } from '@/lib/reviews/getAverageRating';
import { getReviewCount } from '@/lib/reviews/getReviewCount';
import { getMediaSamples } from '@/lib/firestore/getMediaSamples';

export default function PublicProfilePage() {
  const rawParams = useParams();
  const uid = typeof rawParams.uid === 'string' ? rawParams.uid : Array.isArray(rawParams.uid) ? rawParams.uid[0] : '';
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const db = getFirestore(app);
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        const avg = await getAverageRating(uid);
        const count = await getReviewCount(uid);
        const media = await getMediaSamples(uid);

        setProfile({ ...data, mediaSamples: media, averageRating: avg, reviewCount: count });
      }

      setLoading(false);
    };
    fetchProfile();
  }, [uid]);


  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!profile) return <div className="p-6 text-white">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-1">{profile.name || 'Unnamed User'}</h1>

      {profile.proTier === 'signature' && (
        <p className="text-purple-400 text-sm mb-2">💎 Signature Creator</p>
      )}
      {profile.proTier === 'verified' && (
        <p className="text-blue-400 text-sm mb-2" title="Verified by AuditoryX — identity and profile have been reviewed.">✔ Verified Creator</p>
      )}

      {profile.averageRating !== undefined && (
        <p className="text-yellow-400 text-sm mb-2">
          ⭐ {profile.averageRating.toFixed(1)} / 5.0
          <span className="text-gray-400"> ({profile.reviewCount} reviews)</span>
        </p>
      )}
      <PointsBadge points={profile.points} />
      <VerifiedProgress
        points={profile.points}
        verificationStatus={profile.verificationStatus}
        proTier={profile.proTier}
      />

      <p className="mb-2 max-w-xl text-center">{profile.bio || 'No bio provided.'}</p>

      {profile.location && (
        <p className="text-gray-400 text-sm mb-2">📍 {profile.location}</p>
      )}

      {profile.socialLink && (
        <a
          href={profile.socialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline mb-4"
        >
          Visit My Link
        </a>
      )}

      <div className="mb-6">
        <SaveButton providerId={uid} />
      </div>

      {profile.availability?.length > 0 && (
        <div className="mb-6 w-full max-w-xl">
          <h2 className="text-xl font-semibold mb-2">🗓️ Availability</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {profile.availability.map((slot: string, idx: number) => (
              <li key={idx} className="bg-neutral-800 px-3 py-1 rounded text-center">
                {slot}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div id="booking-form" className="w-full max-w-xl mt-6">
        <h2 className="text-xl font-semibold mb-2">📩 Send Booking Request</h2>
        <BookingForm providerId={uid} onBook={() => {}} />
      </div>

      <div className="mt-10 w-full max-w-4xl">
        <MediaCarousel items={profile.mediaSamples || []} />
      </div>

      <div className="mt-10 w-full max-w-3xl">
        <ReviewList uid={uid} />
      </div>

      <ProfileActionBar
        profile={{
          uid,
          proTier: profile.proTier,
          contactOnlyViaRequest: profile.contactOnlyViaRequest,
        }}
      />
    </div>
  );
}
