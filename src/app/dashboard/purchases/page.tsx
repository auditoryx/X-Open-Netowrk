'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useSearchParams();
  const success = params ? params.get('success') : null;

  useEffect(() => {
    const fetchPurchases = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const db = getFirestore(app);
      const q = query(collection(db, 'orders'), where('buyerId', '==', user.uid));
      const snap = await getDocs(q);

      const tempPurchases = [];

      for (const docSnap of snap.docs) {
        const orderData = docSnap.data();
        const serviceRef = doc(db, 'services', orderData.serviceId);
        const serviceSnap = await getDoc(serviceRef);
        const serviceData = serviceSnap.data();

        tempPurchases.push({
          id: docSnap.id,
          ...orderData,
          serviceTitle: serviceData?.title || 'Unknown Service',
        });
      }

      setPurchases(tempPurchases);
      setLoading(false);
    };

    fetchPurchases();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading your purchases...</div>;
  }

  if (purchases.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center p-6">
        <h2 className="text-xl font-bold mb-2">🛒 You haven’t booked anyone yet.</h2>
        <p className="text-gray-400 mb-4">Start exploring creators and find the right fit for your next project.</p>
        <button
          onClick={() => router.push('/explore')}
          className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition"
        >
          🔍 Explore Creators
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">My Purchases</h1>
        {success && (
          <div className="bg-green-600 p-4 mb-6 text-white rounded text-center">
            Payment successful! Your order has been recorded.
          </div>
        )}
        <ul className="space-y-6">
          {purchases.map(purchase => (
            <li key={purchase.id} className="border border-white p-6 rounded shadow">
              <h2 className="text-2xl font-semibold mb-2">{purchase.serviceTitle}</h2>
              <p className="text-gray-400 mb-1">Amount Paid: ${purchase.amountPaid}</p>
              <p className="text-gray-500 text-sm">Order ID: {purchase.id}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
