'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ReviewForm from '@/components/booking/ReviewForm';

interface Booking {
  id: string;
  providerId: string;
  contractId: string;
  hasReview?: boolean;
}

export default function ReviewPrompt() {
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchBookings = async () => {
      const q = query(
        collection(db, 'bookings'),
        where('buyerId', '==', user.uid),
        where('status', '==', 'completed')
      );
      const snap = await getDocs(q);
      for (const docSnap of snap.docs) {
        const data = docSnap.data() as any;
        if (!data.hasReview) {
          setBooking({ id: docSnap.id, ...data });
          return;
        }
      }
      setOpen(false);
    };

    fetchBookings();
  }, [user?.uid]);

  if (!booking || !open) return null;

  return (
    <div id="review-prompt" className="fixed bottom-4 right-4 bg-white text-black p-4 rounded shadow-lg w-80 z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">Leave a review?</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-500">✕</button>
      </div>
      <ReviewForm
        bookingId={booking.id}
        providerId={booking.providerId}
        contractId={booking.contractId}
        onSubmitSuccess={() => setOpen(false)}
      />
    </div>
  );
}
