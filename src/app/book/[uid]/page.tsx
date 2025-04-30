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
} from 'firebase/firestore';
import { app } from '@/app/firebase';
import Navbar from '@/app/components/Navbar';
import { WeeklyCalendarSelector } from '@/components/booking/WeeklyCalendarSelector';
import { sendBookingConfirmation } from '@/lib/email/sendBookingConfirmation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function BookServicePage({ params }: { params: { uid: string } }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<string[]>([]);
  const [providerEmail, setProviderEmail] = useState<string>('');
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
        setProviderEmail(data.email || 'admin@auditoryx.com');
      }
    };
    fetchAvailability();
  }, [params.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) return alert('Please select a time slot.');
    setLoading(true);

    const db = getFirestore(app);

    // 1. Add booking request
    await addDoc(collection(db, 'bookingRequests'), {
      providerId: params.uid,
      message,
      selectedTime,
      createdAt: new Date(),
      status: 'pending',
      clientId: user?.uid || 'anon',
    });

    // 2. Remove selected time from availability
    const updated = availability.filter((a) => a !== selectedTime);
    await updateDoc(doc(db, 'users', params.uid), {
      availability: updated,
    });

    // 3. Send confirmation email
    await sendBookingConfirmation(providerEmail, selectedTime, message, user?.displayName);

    setLoading(false);
    router.push('/success');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Send Booking Request</h1>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <WeeklyCalendarSelector
            availability={availability}
            onSelect={(datetime: string) => setSelectedTime(datetime)}
          />

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
    </div>
  );
}
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { getFirestore, doc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
// import { app } from '@/app/firebase';
// import Navbar from '@/app/components/Navbar';
// import { WeeklyCalendarSelector } from '@/components/booking/WeeklyCalendarSelector';