'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import withAdminProtection from '@/middleware/withAdminProtection';

function VerificationsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const q = query(collection(db, 'verificationRequests'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRequests(data.filter((r) => r.status === 'pending'));
      setLoading(false);
    };

    fetchRequests();
  }, []);

  const handleApprove = async (r: any) => {
    if (!r.uid) return;
    await updateDoc(doc(db, 'users', r.uid), { verified: true });

    await updateDoc(doc(db, 'verificationRequests', r.uid), {
      status: 'approved',
      reviewedAt: serverTimestamp(),
    });

    setRequests((prev) => prev.filter((req) => req.uid !== r.uid));
  };

  const handleReject = async (r: any) => {
    await updateDoc(doc(db, 'verificationRequests', r.uid), {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
    });

    setRequests((prev) => prev.filter((req) => req.uid !== r.uid));
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Verification Requests</h1>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No pending verification requests.</p>
      ) : (
        <div className="space-y-6">
          {requests.map((r) => (
            <div key={r.uid} className="border border-neutral-700 rounded-lg p-6 shadow">
              <p><strong>Email:</strong> {r.email}</p>
              <p><strong>UID:</strong> {r.uid}</p>
              <p><strong>Message:</strong> {r.message || '(no message)'}</p>
              <p><strong>Requested At:</strong> {r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}</p>

              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleApprove(r)}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(r)}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAdminProtection(VerificationsPage);
