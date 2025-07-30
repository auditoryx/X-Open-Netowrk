'use client';

import { useEffect, useState } from 'react';
import { db, isFirebaseConfigured } from '@/lib/firebase';
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
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        if (!isFirebaseConfigured()) {
          console.warn('Firebase not configured, using mock data for applications');
          setApps([
            {
              id: 'mock-app-1',
              uid: 'mock-user-1',
              role: 'producer',
              bio: 'Mock application for producer role',
              socials: ['instagram.com/mock', 'soundcloud.com/mock'],
              createdAt: { seconds: Date.now() / 1000 },
              status: 'pending'
            },
            {
              id: 'mock-app-2',
              uid: 'mock-user-2',
              role: 'artist',
              bio: 'Mock application for artist role',
              socials: ['spotify.com/mock', 'instagram.com/mock2'],
              createdAt: { seconds: Date.now() / 1000 },
              status: 'pending'
            }
          ]);
          setLoading(false);
          return;
        }

        const q = query(collection(db, 'applications'), orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'));
        const snap = await getDocs(q);
        setApps(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        setFirebaseError('Unable to load applications. Please try again later.');
        // Provide fallback mock data
        setApps([
          {
            id: 'fallback-app-1',
            uid: 'fallback-user-1',
            role: 'producer',
            bio: 'Fallback application data (offline mode)',
            socials: ['N/A'],
            createdAt: { seconds: Date.now() / 1000 },
            status: 'pending'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  const handleDecision = async (id: string, uid: string, status: 'approved' | 'rejected') => {
    try {
      if (!isFirebaseConfigured()) {
        toast.error('Firebase not configured - cannot update applications');
        return;
      }

      await updateDoc(doc(db, 'applications', id), {
        status,
        reviewedAt: new Date(),
      });

      setApps((prev) => prev.filter((a) => a.id !== id));
      toast.success(`Application ${status}`);
    } catch (error) {
      console.error('Failed to update application:', error);
      toast.error('Failed to update application');
    }
  };

  const handlePromote = async (uid: string, role: string) => {
    try {
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
    } catch (error) {
      console.error('Failed to promote user:', error);
      toast.error('Promotion failed');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">User Applications</h1>
        <div className="text-gray-400">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">User Applications</h1>
      
      {firebaseError && (
        <div className="bg-red-900 text-red-100 p-4 rounded-lg">
          ⚠️ {firebaseError}
        </div>
      )}
      
      {!isFirebaseConfigured() && (
        <div className="bg-blue-900 text-blue-100 p-4 rounded-lg">
          ℹ️ Running in development mode with mock data
        </div>
      )}

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
                disabled={!isFirebaseConfigured()}
              >
                Approve
              </button>
              <button
                onClick={() => handleDecision(app.id, app.uid, 'rejected')}
                className="bg-red-600 text-white px-4 py-1 rounded text-sm"
                disabled={!isFirebaseConfigured()}
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
      
      <button 
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        data-testid="smoke"
      >
        Admin Actions Available
      </button>
    </div>
  );
}

export default withAdminProtection(ApplicationsPage);
