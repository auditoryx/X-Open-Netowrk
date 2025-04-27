'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from '@/app/firebase';
import Navbar from '@/app/components/Navbar';

export default function BookServicePage({ params }: { params: { uid: string } }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const db = getFirestore(app);

    await addDoc(collection(db, 'bookingRequests'), {
      providerId: params.uid,
      message,
      createdAt: new Date(),
      status: 'pending',
    });

    setLoading(false);
    router.push('/success');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Send Booking Request</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
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
