'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/app/firebase';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      const db = getFirestore(app);
      const ref = doc(db, 'services', id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setService(snap.data());
      }
      setLoading(false);
    };
    fetchService();
  }, [id]);

  const handleOrder = async () => {
    if (!service) return;
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: service.title,
        amount: service.price,
        serviceId: id,
      }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  if (loading) {
    return <div className="text-center mt-10">Loading service...</div>;
  }

  if (!service) {
    return <div className="text-center mt-10">Service not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
      <p className="text-gray-700 mb-4">{service.description}</p>
      <p className="text-blue-600 font-bold text-xl mb-6">${service.price}</p>
      <p className="text-sm text-gray-500 mb-6">Category: {service.category}</p>
      <button
        onClick={handleOrder}
        className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
      >
        Order Now
      </button>
    </div>
  );
}
