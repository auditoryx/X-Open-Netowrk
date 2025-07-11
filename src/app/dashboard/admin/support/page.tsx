'use client';

import { useEffect, useState } from 'react';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import withAdminProtection from '@/middleware/withAdminProtection';
import Link from 'next/link';

type Ticket = {
  id: string;
  uid: string;
  email: string;
  message: string;
  status: string;
  createdAt?: any;
};

function SupportDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const q = query(collection(db, 'supportMessages'), orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ticket[];
        setTickets(data);
        setLoading(false);
      } catch (err: any) {
        console.error('❌ Failed to fetch tickets:', err.message);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">🎫 Support Tickets</h1>
      {loading ? (
        <p>Loading...</p>
      ) : tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div key={t.id} className="bg-zinc-900 p-4 rounded shadow-md space-y-2 border border-zinc-700">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-zinc-400">{t.createdAt?.toDate?.().toLocaleString() || 'N/A'}</p>
                  <p className="font-semibold">{t.email}</p>
                  <p className="text-sm text-zinc-300">{t.uid}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    t.status === 'open' ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <p className="text-zinc-200 whitespace-pre-line">{t.message}</p>
              <Link
                href={`/dashboard/admin/support/${t.id}`}
                className="text-sm text-blue-400 underline"
              >
                View / Respond
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAdminProtection(SupportDashboard);
