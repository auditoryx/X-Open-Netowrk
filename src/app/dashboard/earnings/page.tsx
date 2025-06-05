'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore(app);
      const q = query(collection(db, 'orders'), where('providerId', '==', user.uid), where('status', '==', 'completed'));
      const snap = await getDocs(q);

      const tempEarnings = [] as any[];

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        const serviceRef = doc(db, 'services', data.serviceId);
        const serviceSnap = await getDoc(serviceRef);
        const serviceData = serviceSnap.exists() ? serviceSnap.data() : null;

        tempEarnings.push({
          id: docSnap.id,
          title: serviceData?.title || 'Unknown Service',
          buyerName: data.buyerName || 'Unknown Buyer',
          amount: data.amountPaid || 0,
          timestamp: data.timestamp?.toDate().toLocaleDateString() || 'Unknown Date',
          payoutStatus: data.paymentStatus || 'unknown',
        });
      }

      setEarnings(tempEarnings);
      setLoading(false);
    };

    fetchEarnings();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading earnings...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">💸 My Earnings</h1>

        {earnings.length === 0 ? (
          <p className="text-gray-400">No completed orders or payouts yet.</p>
        ) : (
          <ul className="space-y-4">
            {earnings.map((earning) => (
              <li key={earning.id} className="border border-white rounded p-4 shadow">
                <h2 className="text-xl font-semibold">{earning.title}</h2>
                <p className="text-gray-400">👤 Buyer: {earning.buyerName}</p>
                <p className="text-green-400 font-bold">💰 ${earning.amount}</p>
                <p className="text-sm text-gray-500">📅 {earning.timestamp}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
