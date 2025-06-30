'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  query,
} from 'firebase/firestore';

type Dispute = {
  id: string;
  bookingId: string;
  fromUser: string;
  providerId: string;
  reason: string;
  status: 'open' | 'resolved' | 'rejected';
  adminNotes?: string;
  createdAt?: any;
};

export default function ModerationPanel() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  useEffect(() => {
    async function fetchDisputes() {
      const q = query(
        collection(db, 'disputes'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setDisputes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dispute)));
    }

    fetchDisputes();
  }, []);

  const handleResolve = async (id: string, result: 'resolved' | 'rejected') => {
    await updateDoc(doc(db, 'disputes', id), {
      status: result,
      resolvedAt: new Date(),
    });
    setDisputes(prev =>
      prev.map(d => (d.id === id ? { ...d, status: result } : d))
    );
  };

  const handleNoteChange = async (id: string, note: string) => {
    await updateDoc(doc(db, 'disputes', id), {
      adminNotes: note,
    });
    setDisputes(prev =>
      prev.map(d => (d.id === id ? { ...d, adminNotes: note } : d))
    );
  };

  return (
    <div className="space-y-6">
      {disputes.map(d => (
        <div key={d.id} className="bg-gray-900 p-4 rounded">
          <p><strong>Booking ID:</strong> {d.bookingId}</p>
          <p><strong>Client:</strong> {d.fromUser}</p>
          <p><strong>Provider:</strong> {d.providerId}</p>
          <p><strong>Reason:</strong> {d.reason}</p>
          <p><strong>Status:</strong> {d.status}</p>

          <textarea
            defaultValue={d.adminNotes || ''}
            onBlur={e => handleNoteChange(d.id, e.target.value)}
            className="mt-2 w-full p-2 rounded text-black"
            placeholder="Admin notes..."
          />

          {d.status === 'open' && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleResolve(d.id, 'resolved')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Resolve
              </button>
              <button
                onClick={() => handleResolve(d.id, 'rejected')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
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
