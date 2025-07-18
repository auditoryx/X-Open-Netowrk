'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import withAdminProtection from '@/src/middleware/withAdminProtection';
import toast from 'react-hot-toast';

function ListingReportsPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    async function fetchReports() {
      const q = query(
        collection(db, 'reports'),
        where('targetType', '==', 'listing'),
        orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc')
      );
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

  const handleDeleteListing = async (listingId: string, reportId: string) => {
    await deleteDoc(doc(db, 'services', listingId));
    await updateDoc(doc(db, 'reports', reportId), { status: 'removed' });
    toast.success('Listing deleted');
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Flagged Listings</h1>
      {reports.length === 0 ? (
        <p className="text-gray-400">No flagged listings found.</p>
      ) : (
        reports.map((r) => (
          <div key={r.id} className="bg-gray-900 p-4 rounded">
            <p>
              <strong>Listing:</strong> {r.listingTitle || r.targetId}
            </p>
            <p>
              <strong>Reporter:</strong> {r.reportedBy || 'Unknown'}
            </p>
            <p>
              <strong>Reason:</strong> {r.reason}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleResolve(r.id)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Mark Resolved
              </button>
              {r.targetId && (
                <button
                  onClick={() => handleDeleteListing(r.targetId, r.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Delete Listing
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default withAdminProtection(ListingReportsPage);
