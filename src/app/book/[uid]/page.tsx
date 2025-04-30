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
  const [providerLocation, setProviderLocation] = useState<string>('');
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
        setProviderEmail(data.email || 'Zenji@auditoryx.com');
        setProviderLocation(data.location || '');
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
      alert('This time slot was just booked by someone else. Please pick a new one.');
      setLoading(false);
      return;
    }

    // 💰 Fee Logic
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
      createdAt: new Date(),
      status: 'pending',
    });

    const updated = availability.filter((a) => a !== selectedTime);
    await updateDoc(doc(db, 'users', params.uid), {
      availability: updated,
    });

    await sendBookingConfirmation(providerEmail, selectedTime, message, user?.displayName);

    setLoading(false);
    router.push(`/success?time=${selectedTime}&location=${encodeURIComponent(providerLocation)}&fee=${platformFee}`);
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
