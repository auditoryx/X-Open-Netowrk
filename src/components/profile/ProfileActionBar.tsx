'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export default function ProfileActionBar({
  profile,
}: {
  profile: { uid: string; proTier?: string; contactOnlyViaRequest?: boolean };
}) {
  const { user } = useAuth();
  const isOwner = user?.uid === profile.uid;
  const locked =
    profile.proTier === 'signature' && profile.contactOnlyViaRequest && !isOwner;

  const scrollToBooking = () => {
    const form = document.getElementById('booking-form');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="fixed bottom-4 inset-x-0 flex justify-center md:hidden z-50">
      <button
        onClick={locked ? undefined : scrollToBooking}
        disabled={locked}
        title={
          locked ? 'Invite-only artist – contact via manager.' : 'Request Booking'
        }
        aria-label="Request booking"
        className={`btn btn-primary ${locked ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        📩 Request Booking
      </button>
    </div>
  );
}
