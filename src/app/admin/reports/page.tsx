'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import withAdminProtection from '@/middleware/withAdminProtection';
import toast from 'react-hot-toast';

function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    async function fetchReports() {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }

    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
    await updateDoc(doc(db, 'reports', id), { status: 'resolved' });
    toast.success('Marked as resolved');
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'reports', id));
    toast.success('Report deleted');
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">User Reports</h1>
      {reports.length === 0 ? (
        <p className="text-gray-400">No reports found.</p>
      ) : (
        reports.map((r) => (
          <div key={r.id} className="bg-gray-900 p-4 rounded">
            <p><strong>Reporter:</strong> {r.reportedBy || 'Unknown'}</p>
            <p><strong>Target:</strong> {r.targetId || 'Unknown'}</p>
            <p><strong>Target Type:</strong> {r.targetType || 'user'}</p>
            <p><strong>Reason:</strong> {r.reason}</p>
            <p className="text-sm text-gray-500">
              Reported: {r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleString() : ''}
            </p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleResolve(r.id)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default withAdminProtection(ReportsPage);
