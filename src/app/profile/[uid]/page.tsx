'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { ReviewList } from '@/components/reviews/ReviewList';
import { PortfolioGrid } from '@/components/profile/PortfolioGrid';
import SaveButton from '@/components/explore/SaveButton';
import BookingForm from '@/components/booking/BookingForm';
import { getAverageRating } from '@/lib/reviews/getAverageRating';
import { getReviewCount } from '@/lib/reviews/getReviewCount';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const uid = params?.uid as string;
  const { user } = useAuth();
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
        setProfile({ ...data, averageRating: avg, reviewCount: count });
      }

      setLoading(false);
    };
    fetchProfile();
  }, [uid]);

  const handleBooking = async ({ message }: { message: string }) => {
    if (!user) return;
    const db = getFirestore(app);
    const bookingRef = await addDoc(collection(db, 'bookings'), {
      clientId: user.uid,
      providerId: uid,
      message,
      status: 'pending',
      timestamp: serverTimestamp(),
    });

    router.push(`/dashboard/bookings?bookingId=${bookingRef.id}`);
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!profile) return <div className="p-6 text-white">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-1">{profile.name || 'Unnamed User'}</h1>

      {profile.proTier === 'signature' && (
        <p className="text-purple-400 text-sm mb-2">💎 Signature Creator</p>
      )}
      {profile.proTier === 'verified' && (
        <p className="text-blue-400 text-sm mb-2">✔ Verified Creator</p>
      )}

      {profile.averageRating !== undefined && (
        <p className="text-yellow-400 text-sm mb-2">
          ⭐ {profile.averageRating.toFixed(1)} / 5.0
          <span className="text-gray-400"> ({profile.reviewCount} reviews)</span>
        </p>
      )}

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
        <SaveButton creatorId={uid} />
      </div>

      {profile.availability?.length > 0 && (
        <div className="mb-6 w-full max-w-xl">
          <h2 className="text-xl font-semibold mb-2">🗓️ Availability</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {profile.availability.map((slot: string, idx: number) => (
              <li key={idx} className="bg-gray-800 p-2 rounded text-center">
                {slot}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="w-full max-w-xl mt-6">
        <h2 className="text-xl font-semibold mb-2">📩 Send Booking Request</h2>
        <BookingForm onBook={handleBooking} />
      </div>

      <div className="mt-10 w-full max-w-4xl">
        <PortfolioGrid uid={uid} />
      </div>

      <div className="mt-10 w-full max-w-3xl">
        <ReviewList uid={uid} />
      </div>
    </div>
  );
}
