'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  setDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import withAdminProtection from '@/middleware/withAdminProtection';

function AdminDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchSubmissions = async () => {
      const snapshot = await getDocs(collection(db, 'pendingVerifications'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSubmissions(data);
      setLoading(false);
    };
    fetchSubmissions();
  }, [user]);

  const handleApprove = async (submission: any) => {
    try {
      await setDoc(doc(db, 'profiles', submission.uid), {
        uid: submission.uid,
        name: submission.name,
        email: submission.email,
        role: submission.role,
        genres: submission.genres || [],
        minBpm: submission.minBpm || null,
        maxBpm: submission.maxBpm || null,
        location: submission.location,
        bio: submission.bio,
        links: submission.links,
        verified: true,
        createdAt: serverTimestamp(),
      });

      await deleteDoc(doc(db, 'pendingVerifications', submission.id));

      await setDoc(doc(db, 'adminApprovals', submission.uid), {
        approvedAt: serverTimestamp(),
        approvedBy: user?.uid,
      });

      setSubmissions((prev) => prev.filter((s) => s.id !== submission.id));

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: submission.uid,
          email: submission.email,
          type: 'admin',
          title: 'Account Approved',
          message: 'Your account has been approved by the admin team.',
          link: '/dashboard'
        })
      })
    } catch (err) {
      console.error('❌ Approval error:', err);
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      await deleteDoc(doc(db, 'pendingVerifications', submissionId));
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    } catch (err) {
      console.error('❌ Rejection error:', err);
    }
  };

  if (!user) {
    return <div className="text-center p-6 text-red-500">You must be logged in.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4">🛡️ Admin – Pending Verifications</h1>
      {loading ? (
        <p>Loading...</p>
      ) : submissions.length === 0 ? (
        <p>No pending submissions.</p>
      ) : (
        <div className="space-y-6">
          {submissions.map((s) => (
            <div
              key={s.id}
              className="bg-zinc-900 border border-zinc-700 rounded p-4 space-y-2 shadow-md"
            >
              <p>
                <strong>Name:</strong> {s.name}
              </p>
              <p>
                <strong>Email:</strong> {s.email}
              </p>
              <p>
                <strong>Role:</strong> {s.role}
              </p>
              <p>
                <strong>Location:</strong> {s.location}
              </p>
              <p>
                <strong>Bio:</strong> {s.bio}
              </p>
              {s.genres && (
                <p>
                  <strong>Genres:</strong> {s.genres.join(', ')}
                </p>
              )}
              {(s.minBpm || s.maxBpm) && (
                <p>
                  <strong>BPM:</strong> {s.minBpm ?? '?'} - {s.maxBpm ?? '?'}
                </p>
              )}
              <p>
                <strong>Links:</strong> {s.links}
              </p>
              <div className="flex space-x-4 pt-2">
                <button
                  onClick={() => handleApprove(s)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleReject(s.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAdminProtection(AdminDashboard);
