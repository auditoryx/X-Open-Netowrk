'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from '@/app/firebase';
import { useRouter } from 'next/navigation';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

      for (const order of snap.docs) {
        const data = order.data();
        const serviceRef = doc(db, 'services', data.serviceId);
        const serviceSnap = await getDoc(serviceRef);
        const serviceData = serviceSnap.data();
        tempPurchases.push({
          id: order.id,
          ...data,
          serviceTitle: serviceData?.title || 'Unknown Service',
        });
      }

      setPurchases(tempPurchases);
      setLoading(false);
    };

    fetchPurchases();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading purchases...</div>;
  }

  if (purchases.length === 0) {
    return <div className="text-center mt-10">No purchases yet.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Purchases</h1>
      <ul className="space-y-6">
        {purchases.map((purchase) => (
          <li key={purchase.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{purchase.serviceTitle}</h2>
            <p className="text-gray-600 mb-1">Service ID: {purchase.serviceId}</p>
            <p className="text-gray-800 font-bold mb-1">${purchase.amountPaid}</p>
            <p className="text-sm text-gray-400">Purchase ID: {purchase.id}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
