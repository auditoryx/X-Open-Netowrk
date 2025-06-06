'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { app } from '@/lib/firebase';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const WeeklyCalendarSelector = dynamic(
  () => import('@/components/booking/WeeklyCalendarSelector').then(mod => mod.WeeklyCalendarSelector),
  { ssr: false }
);
import { useAuth } from '@/lib/hooks/useAuth';
import BookingSummarySidebar from '@/components/booking/BookingSummarySidebar';
import TrustBadges from '@/components/booking/TrustBadges';

export default function BookServicePage({ params }: { params: { uid: string } }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<string[]>([]);
  const [providerName, setProviderName] = useState<string>('');
  const [providerEmail, setProviderEmail] = useState<string>('');
  const [providerLocation, setProviderLocation] = useState<string>('');
  const [providerTier, setProviderTier] = useState<'standard' | 'verified' | 'signature'>('standard');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchAvailability = async () => {
      const db = getFirestore(app);
      const ref = doc(db, 'users', params.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setAvailability(data.availability || []);
        setProviderEmail(data.email || '');
        setProviderLocation(data.location || '');
        setProviderName(data.name || 'Creator');
        setProviderTier(data.tier || 'standard');
      }
    };
    fetchAvailability();
  }, [params.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) return alert('Please select a time slot.');
    setLoading(true);

    if (new Date(selectedTime) < new Date()) {
      alert('Cannot book a time in the past.');
      setLoading(false);
      return;
    }

    const db = getFirestore(app);

    const overlapQ = query(
      collection(db, 'bookingRequests'),
      where('providerId', '==', params.uid),
      where('selectedTime', '==', selectedTime),
      where('status', 'in', ['pending', 'confirmed'])
    );
    const overlapSnap = await getDocs(overlapQ);
    if (!overlapSnap.empty) {
      alert('This time slot was just booked. Please pick another.');
      setLoading(false);
      return;
    }

    const baseAmount = 100;
    const platformFee = Math.round(baseAmount * 0.15);
    const totalAmount = baseAmount + platformFee;

    await addDoc(collection(db, 'bookingRequests'), {
      providerId: params.uid,
      clientId: user?.uid || 'anon',
      message,
      selectedTime,
      providerLocation,
      baseAmount,
      platformFee,
      totalAmount,
      createdAt: serverTimestamp(),
      status: 'pending'
    });

    const updated = availability.filter((a) => a !== selectedTime);
    await updateDoc(doc(db, 'users', params.uid), {
      availability: updated
    });

    await fetch('/api/send-booking-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: providerEmail,
        selectedTime,
        message,
        senderName: user?.displayName,
        providerTZ: providerLocation,
        clientTZ: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });

    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: params.uid,
        email: providerEmail,
        type: 'booking',
        title: 'New Booking Request',
        message: `You received a new booking request from ${user?.displayName || 'a user'}`,
        link: '/dashboard/bookings'
      })
    })

    setLoading(false);
    router.push(`/success?time=${selectedTime}&location=${encodeURIComponent(providerLocation)}&fee=${platformFee}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 p-6">
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold mb-4">Send Booking Request</h1>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <Suspense fallback={<div className="p-4">Loading calendar...</div>}>
              <WeeklyCalendarSelector
                availability={availability}
                onSelect={(datetime) => setSelectedTime(datetime as string)}
              />
            </Suspense>

            <textarea
              className="bg-black border border-white p-4 rounded focus:outline-none"
              placeholder="Add a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="border border-white p-4 rounded hover:bg-white hover:text-black transition"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </form>
        </div>

        <div className="md:col-span-1">
          <BookingSummarySidebar
            providerName={providerName}
            providerTier={providerTier}
            providerLocation={providerLocation}
            selectedTime={selectedTime || ''}
            baseAmount={100}
            platformFee={15}
          />
          <TrustBadges />
        </div>
      </div>
    </div>
  );
}
