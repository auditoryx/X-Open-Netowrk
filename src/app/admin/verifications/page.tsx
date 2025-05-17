'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import withAdminProtection from '@/middleware/withAdminProtection';

function VerificationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      const snap = await getDocs(collection(db, 'pendingVerifications'));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setApps(data);
      setLoading(false);
    };
    fetchApps();
  }, []);

  const handleApprove = async (app: any) => {
    if (!app.uid) return;

    await updateDoc(doc(db, 'users', app.uid), {
      verified: true,
      role: app.role,
    });

    await deleteDoc(doc(db, 'pendingVerifications', app.id));
    setApps((prev) => prev.filter((a) => a.id !== app.id));
  };

  const handleReject = async (appId: string) => {
    await deleteDoc(doc(db, 'pendingVerifications', appId));
    setApps((prev) => prev.filter((a) => a.id !== appId));
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Pending Applications</h1>
      {loading ? (
        <p>Loading...</p>
      ) : apps.length === 0 ? (
        <p>No pending applications.</p>
      ) : (
        <div className="space-y-6">
          {apps.map((app) => (
            <div
              key={app.id}
              className="border border-neutral-800 rounded-lg p-6 shadow hover:border-white/20 transition"
            >
              <p><strong>Name:</strong> {app.name || 'Unknown'}</p>
              <p><strong>Email:</strong> {app.email}</p>
              <p><strong>Role:</strong> {app.role}</p>
              <p><strong>Bio:</strong> {app.bio}</p>
              <p><strong>Links:</strong> {app.links}</p>

              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleApprove(app)}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(app.id)}
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
