'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProgressiveOnboarding } from '@/components/onboarding/ProgressiveOnboarding';

/* UI components */
import { ReviewList } from '@/components/reviews/ReviewList';
import MediaCarousel from '@/components/profile/MediaCarousel';
import { SaveButton } from '@/components/profile/SaveButton';
import { PointsBadge } from '@/components/profile/PointsBadge';
import { VerifiedProgress } from '@/components/profile/VerifiedProgress';
import BookingForm from '@/components/booking/BookingForm';
import ProfileActionBar from '@/components/profile/ProfileActionBar';
import RatingBarChart from '@/components/profile/RatingBarChart';
import FloatingCartButton from '@/components/cart/FloatingCartButton';
import SignatureBadge from '@/components/badges/SignatureBadge';
import { TierBadge } from '@/components/badges/TierBadge';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { ReportUserButton } from '@/components/profile/ReportUserButton';
import ApplyVerificationButton from '@/components/profile/ApplyVerificationButton';
import ContactModal from '@/components/profile/ContactModal';
import CreatorNotificationButton from '@/components/profile/CreatorNotificationButton';

/* Data helpers */
import { getAverageRating } from '@/lib/reviews/getAverageRating';
import { getReviewCount } from '@/lib/reviews/getReviewCount';
import { getRatingDistribution } from '@/lib/reviews/getRatingDistribution';
import { getMediaSamples } from '@/lib/firestore/getMediaSamples';

export default function PublicProfilePage() {
  const rawParams = useParams();
  const { user } = useAuth();
  const { trackAction } = useProgressiveOnboarding();
  const uid =
    typeof rawParams.uid === 'string'
      ? rawParams.uid
      : Array.isArray(rawParams.uid)
      ? rawParams.uid[0]
      : '';

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [distribution, setDistribution] =
    useState<Record<number, number> | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Check if this is the current user's own profile
  const isOwnProfile = user?.uid === uid;

  /* ───────────── fetch profile + extras ───────────── */
  useEffect(() => {
    const fetchProfile = async () => {
      const db = getFirestore(app);
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        /* Parallel fetches for speed */
        const [avg, count, dist, media] = await Promise.all([
          getAverageRating(uid),
          getReviewCount(uid),
          getRatingDistribution(uid),
          getMediaSamples(uid),
        ]);

        setProfile({
          ...data,
          averageRating: avg,
          reviewCount: count,
          mediaSamples: media,
        });
        setDistribution(dist);
        
        // Track profile view for progressive onboarding
        if (!isOwnProfile) {
          trackAction('profile_view', {
            creatorId: uid,
            creatorName: data.name
          });
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, [uid, isOwnProfile, trackAction]);

  /* ───────────── loading / 404 ───────────── */
  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!profile)
    return <div className="p-6 text-white">Profile not found.</div>;

  /* ───────────── UI ───────────── */
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
        {profile.name || 'Unnamed User'}
        {profile.verified && <VerifiedBadge size="md" />}
      </h1>

      {/* Signature Badge */}
      {profile.signature && (
        <div className="mb-2">
          <SignatureBadge size="md" />
        </div>
      )}

      {/* Tier Badge */}
      {profile.tier && (
        <div className="mb-2 flex justify-center">
          <TierBadge tier={profile.tier} size="lg" />
        </div>
      )}

      {profile.proTier === 'signature' && (
        <p className="text-purple-400 text-sm mb-2">💎 Signature Creator</p>
      )}
      {profile.proTier === 'verified' && (
        <p
          className="text-blue-400 text-sm mb-2"
          title="Verified by AuditoryX — identity and profile have been reviewed."
        >
          ✔ Verified Creator
        </p>
      )}

      {/* Verification Button (only for own profile) */}
      {isOwnProfile && (
        <div className="mb-4">
          <ApplyVerificationButton
            userId={uid}
            userData={{
              name: profile.name || profile.displayName || 'Unknown',
              role: profile.role || 'User',
              isVerified: profile.proTier === 'verified' || profile.isVerified
            }}
            variant="button"
            className="text-sm"
          />
        </div>
      )}

      {/* Report User Button (only for other users' profiles) */}
      {!isOwnProfile && (
        <div className="mb-4">
          <ReportUserButton 
            targetUid={uid}
            targetName={profile.name || profile.displayName}
          />
        </div>
      )}

      {profile.averageRating !== undefined && (
        <div className="mb-2">
          <p className="text-yellow-400 text-sm">
            ⭐ {profile.averageRating.toFixed(1)} / 5.0
            <span className="text-gray-400">
              {' '}
              ({profile.reviewCount} reviews)
            </span>
          </p>
          {distribution && <RatingBarChart distribution={distribution} />}
        </div>
      )}

      {/* Gamification metrics */}
      <PointsBadge points={profile.points} />
      <VerifiedProgress
        points={profile.points}
        verificationStatus={profile.verificationStatus}
        proTier={profile.proTier}
      />

      <p className="mb-2 max-w-xl text-center">
        {profile.bio || 'No bio provided.'}
      </p>

      {profile.location && (
        <p className="text-gray-400 text-sm mb-2">
          📍 {profile.location}
        </p>
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

      <div className="mb-6 flex flex-col items-center gap-3">
        <SaveButton providerId={uid} providerName={profile?.name} />
        {!isOwnProfile && (
          <>
            <button
              onClick={() => setShowContactModal(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-medium px-6 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              💬 Send Message
            </button>
            <CreatorNotificationButton 
              creatorId={uid}
              creatorName={profile?.name || 'this creator'}
            />
          </>
        )}
      </div>

      {/* Availability list */}
      {profile.availability?.length > 0 && (
        <div className="mb-6 w-full max-w-xl">
          <h2 className="text-xl font-semibold mb-2">
            🗓️ Availability
          </h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {profile.availability.map((slot: string, idx: number) => (
              <li
                key={idx}
                className="bg-neutral-800 px-3 py-1 rounded text-center"
              >
                {slot}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Booking form */}
      <div id="booking-form" className="w-full max-w-xl mt-6">
        <h2 className="text-xl font-semibold mb-2">
          📩 Send Booking Request
        </h2>
        <BookingForm 
          providerId={uid} 
          providerName={profile.name || 'this creator'}
          onBooked={() => {}} 
        />
      </div>

      {/* Media carousel */}
      <div className="mt-10 w-full max-w-4xl">
        <MediaCarousel items={profile.mediaSamples || []} />
      </div>

      {/* Reviews */}
      <div className="mt-10 w-full max-w-3xl">
        <ReviewList providerId={uid} />
      </div>

      {/* Bottom action bar */}
      <ProfileActionBar
        profile={{
          uid,
          proTier: profile.proTier,
          contactOnlyViaRequest: profile.contactOnlyViaRequest,
        }}
      />
      <FloatingCartButton />
      
      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        creatorName={profile?.name || 'this creator'}
        creatorId={uid}
      />
    </div>
  );
}
