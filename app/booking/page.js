'use client';
import { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import SendServiceRequest from "../../components/SendServiceRequest";

export default function BookingPage() {
  const [providerId, setProviderId] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleBooking = async () => {
    const user = auth.currentUser;
    if (!user) return alert('Please log in first');

    try {
      await addDoc(collection(db, 'bookings'), {
        customerId: user.uid,
        providerId,
        serviceName,
        price: parseFloat(price),
        timestamp: Timestamp.now(),
        status: 'pending'
      });
      setMessage('Booking sent!');
      setProviderId('');
      setServiceName('');
      setPrice('');
    } catch (error) {
      console.error('Booking error:', error);
      setMessage('Failed to book.');
    }
  };

  return (
    <main className="p-10 text-white space-y-10">
      <h1 className="text-3xl font-bold">Book a Service</h1>

      <div className="max-w-xl mx-auto text-white p-6">
        <input
          className="w-full p-2 mb-4 bg-gray-800 text-white border border-gray-600 rounded"
          placeholder="Provider UID"
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
        />

        <input
          className="w-full p-2 mb-4 bg-gray-800 text-white border border-gray-600 rounded"
          placeholder="Service Name"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
        />

        <input
          className="w-full p-2 mb-4 bg-gray-800 text-white border border-gray-600 rounded"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleBooking}
        >
          Send Booking
        </button>

        {message && <p className="mt-4">{message}</p>}
      </div>

      <h1 className="text-3xl font-bold">Request Any Service</h1>
      <SendServiceRequest recipientId="USER123" recipientRole="studio" />
      <SendServiceRequest recipientId="USER456" recipientRole="artist" />
    </main>
  );
}