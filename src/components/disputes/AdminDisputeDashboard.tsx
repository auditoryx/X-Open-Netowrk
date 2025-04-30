'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function AdminDisputeDashboard() {
  const [disputes, setDisputes] = useState<any[]>([]);

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
    toast.success(`Dispute ${result}`);
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Dispute Dashboard</h2>
      {disputes.map((d) => (
        <div key={d.id} className="p-4 border rounded">
          <p><strong>Booking ID:</strong> {d.bookingId}</p>
          <p><strong>User:</strong> {d.fromUser}</p>
          <p><strong>Reason:</strong> {d.reason}</p>
          <p><strong>Status:</strong> {d.status}</p>
          {d.status === 'open' && (
            <div className="space-x-2 mt-2">
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
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
