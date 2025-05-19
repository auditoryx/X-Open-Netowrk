'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
} from 'firebase/firestore';
import withAdminProtection from '@/middleware/withAdminProtection';

function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    async function fetchApplications() {
      const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setApps(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }

    fetchApplications();
  }, []);

  const handleDecision = async (id: string, uid: string, status: 'approved' | 'rejected') => {
    await updateDoc(doc(db, 'applications', id), {
      status,
      reviewedAt: new Date(),
    });

    if (status === 'approved') {
      await updateDoc(doc(db, 'users', uid), {
        isVerified: true,
      });
    }

    setApps((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">User Applications</h1>
      {apps.length === 0 ? (
        <p className="text-gray-400">No pending applications.</p>
      ) : (
        apps.map((app) => (
          <div key={app.id} className="bg-gray-900 p-4 rounded">
            <p><strong>User ID:</strong> {app.uid}</p>
            <p><strong>Applied Role:</strong> {app.role}</p>
            <p><strong>Bio:</strong> {app.bio}</p>
            <p><strong>Socials:</strong> {app.socials?.join(', ')}</p>
            <p className="text-sm text-gray-500">
              Submitted: {new Date(app.createdAt?.seconds * 1000).toLocaleString()}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleDecision(app.id, app.uid, 'approved')}
                className="bg-green-600 text-white px-4 py-1 rounded text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => handleDecision(app.id, app.uid, 'rejected')}
                className="bg-red-600 text-white px-4 py-1 rounded text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default withAdminProtection(ApplicationsPage);
