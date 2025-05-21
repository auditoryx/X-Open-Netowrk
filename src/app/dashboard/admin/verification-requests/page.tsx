'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';

export default function VerificationRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const q = query(collection(db, 'verificationRequests'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
      setLoading(false);
    };
    fetchRequests();
  }, []);

  const handleApprove = async (id: string, userId: string) => {
    await updateDoc(doc(db, 'users', userId), {
      verified: true,
      proTier: 'verified',
    });
    await updateDoc(doc(db, 'verificationRequests', id), {
      status: 'approved',
    });
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleReject = async (id: string) => {
    await updateDoc(doc(db, 'verificationRequests', id), {
      status: 'rejected',
    });
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Verification Requests</h1>
      {requests.length === 0 && <p>No requests pending.</p>}
      {requests.map((req) => (
        <div key={req.id} className="border border-white p-4 rounded mb-4">
          <p><strong>User:</strong> {req.userId}</p>
          <p><strong>Links:</strong> {req.links?.join(', ')}</p>
          <div className="flex gap-4 mt-2">
            <button className="bg-green-600 px-4 py-2 rounded" onClick={() => handleApprove(req.id, req.userId)}>Approve</button>
            <button className="bg-red-600 px-4 py-2 rounded" onClick={() => handleReject(req.id)}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
