'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import withAdminProtection from '@/src/middleware/withAdminProtection';

function VerificationsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [verifiedUsers, setVerifiedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, 'verificationRequests'), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const verifiedQ = query(collection(db, 'users'), where('verified', '==', true));
      const verifiedSnap = await getDocs(verifiedQ);
      setVerifiedUsers(verifiedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      setLoading(false);
    };
    fetchData();
  }, []);

  const approve = async (req: any) => {
    await updateDoc(doc(db, 'users', req.uid), {
      verified: true,
      verifiedAt: serverTimestamp()
    });
    await updateDoc(doc(db, 'verificationRequests', req.id), {
      status: 'approved',
      reviewedAt: serverTimestamp()
    });
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
  };

  const reject = async (req: any) => {
    await updateDoc(doc(db, 'verificationRequests', req.id), {
      status: 'rejected',
      reviewedAt: serverTimestamp()
    });
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
  };

  const revoke = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), {
      verified: false,
      verifiedRevokedAt: serverTimestamp()
    });
    setVerifiedUsers((prev) => prev.filter((u) => u.id !== uid));
  };

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pending Verification Requests</h1>
      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="border p-4 rounded-md">
            <p><b>Email:</b> {req.email}</p>
            <p><b>User ID:</b> {req.uid}</p>
            <p><b>Message:</b> {req.message}</p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => approve(req)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => reject(req)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-10 mb-4">Currently Verified Users</h2>
      <div className="space-y-4">
        {verifiedUsers.map((user) => (
          <div key={user.id} className="border p-4 rounded-md">
            <p><b>Name:</b> {user.name || 'Unnamed'}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Role:</b> {user.role}</p>
            <div className="mt-2">
              <button
                onClick={() => revoke(user.id)}
                className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600"
              >
                Revoke Verification
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAdminProtection(VerificationsPage);
