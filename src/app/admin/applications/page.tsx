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
import withAdminProtection from '@/middleware/withAdminProtection';
import toast from 'react-hot-toast';
import { SCHEMA_FIELDS } from '@/lib/schema-fields';

function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchApplications() {
      const q = query(collection(db, 'applications'), orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'));
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

    setApps((prev) => prev.filter((a) => a.id !== id));
    toast.success(`Application ${status}`);
  };

  const handlePromote = async (uid: string, role: string) => {
    const res = await fetch('/api/promote-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, role }),
    });

    if (res.ok) {
      toast.success(`Promoted to ${role}`);
    } else {
      toast.error('Promotion failed');
    }
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
            <p><strong>Role Applied:</strong> {app.role}</p>
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

            <div className="mt-4 flex items-center gap-2">
              <select
                value={roles[app.uid] || ''}
                onChange={(e) => setRoles((prev) => ({ ...prev, [app.uid]: e.target.value }))}
                className="text-black p-2 rounded"
              >
                <option value="">Select role</option>
                <option value="user">User</option>
                <option value="pro">Pro</option>
                <option value="verified">Verified</option>
                <option value="admin">Admin</option>
              </select>
              <button
                disabled={!roles[app.uid]}
                onClick={() => handlePromote(app.uid, roles[app.uid])}
                className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
              >
                Promote
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default withAdminProtection(ApplicationsPage);
