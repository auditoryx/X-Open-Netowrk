'use client';

import { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { app } from '@/lib/firebase';

type Payout = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

export default function EarningsDashboard() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchPayouts = async () => {
      const db = getFirestore(app);
      const payoutsRef = query(
        collection(db, 'payouts'),
        where('providerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snap = await getDocs(payoutsRef);
      const parsed = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          amount: d.amount || 0,
          currency: d.currency || 'usd',
          status: d.status || 'pending',
          createdAt: new Date(d.createdAt?.seconds * 1000).toLocaleDateString(),
        };
      });

      const total = parsed.reduce((sum, p) => sum + p.amount, 0);
      setTotalEarned(total);
      setPayouts(parsed);
    };

    fetchPayouts();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="p-6 bg-white text-black shadow-md rounded-xl">
        <h2 className="text-lg font-semibold mb-2">Total Earned</h2>
        <p className="text-3xl font-bold">${(totalEarned / 100).toFixed(2)}</p>
      </div>

      <div className="p-6 bg-white text-black shadow-md rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Payout History</h2>
        {payouts.length === 0 ? (
          <p className="text-gray-500 text-sm">No payouts yet.</p>
        ) : (
          <ul className="space-y-3">
            {payouts.map((payout) => (
              <li key={payout.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{payout.createdAt}</span>
                <span className="font-semibold">
                  ${(payout.amount / 100).toFixed(2)} {payout.currency.toUpperCase()}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  payout.status === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : payout.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {payout.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 px-4 py-2 bg-black text-white text-sm font-semibold rounded hover:bg-gray-800"
        >
          Open Stripe Dashboard
        </a>
      </div>
    </div>
  );
}
