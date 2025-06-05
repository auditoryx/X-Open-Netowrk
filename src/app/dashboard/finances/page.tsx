'use client';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

interface Record {
  id: string;
  amount: number;
  status: string;
}

export default function FinancesPage() {
  const [stats, setStats] = useState({ earned: 0, escrow: 0, paidOut: 0 });
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) return;
      const db = getFirestore(app);
      const q = query(collection(db, 'bookings'), where('providerId', '==', user.uid));
      const snap = await getDocs(q);
      let earned = 0;
      let escrow = 0;
      let paidOut = 0;
      const temp: Record[] = [];
      snap.forEach(docSnap => {
        const data: any = docSnap.data();
        const amt = data.price || 0;
        const status = data.paymentStatus || 'pending';
        earned += amt;
        if (status === 'held') escrow += amt;
        if (status === 'paid') paidOut += amt;
        temp.push({ id: docSnap.id, amount: amt, status });
      });
      setStats({ earned, escrow, paidOut });
      setRecords(temp);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">Finances</h1>
      <div className="space-y-2">
        <p>Total Earned: ${stats.earned}</p>
        <p>Pending Escrow: ${stats.escrow}</p>
        <p>Paid Out: ${stats.paidOut}</p>
      </div>
      <ul className="space-y-2">
        {records.map(r => (
          <li key={r.id} className="border p-2 rounded">
            Booking {r.id} - ${r.amount} - {r.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
