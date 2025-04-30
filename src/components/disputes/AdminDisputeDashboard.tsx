'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function AdminDisputeDashboard() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDisputes = async () => {
      const snap = await getDocs(collection(db, 'disputes'));
      setDisputes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchDisputes();
  }, []);

  const handleResolve = async (id: string, result: 'resolved' | 'rejected') => {
    await updateDoc(doc(db, 'disputes', id), {
      status: result,
      resolvedAt: new Date(),
    });
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: result } : d))
    );
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Dispute Dashboard</h2>
      {disputes.map((d) => (
        <div key={d.id} className="p-4 border rounded bg-white text-black space-y-2">
          <p><strong>Booking ID:</strong> {d.bookingId}</p>
          <p><strong>User:</strong> {d.fromUser}</p>
          <p><strong>Reason:</strong> {d.reason}</p>
          <p><strong>Status:</strong> <span className={d.status === 'open' ? 'text-red-600' : 'text-green-600'}>{d.status}</span></p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => router.push(`/dashboard/bookings?bookingId=${d.bookingId}`)}
              className="border border-black px-3 py-1 rounded hover:bg-black hover:text-white transition"
            >
              View Booking
            </button>

            {d.status === 'open' && (
              <>
                <button
                  onClick={() => handleResolve(d.id, 'resolved')}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleResolve(d.id, 'rejected')}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
