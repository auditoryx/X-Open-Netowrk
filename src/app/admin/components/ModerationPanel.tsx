'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

type Dispute = {
  id: string;
  bookingId: string;
  fromUser: string;
  providerId: string;
  reason: string;
  status: 'open' | 'resolved' | 'rejected';
  adminNotes?: string;
  createdAt?: any;
};

type VerificationRequest = {
  id: string;
  uid: string;
  email: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: any;
};

export default function ModerationPanel() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'disputes' | 'verifications'>('disputes');

  useEffect(() => {
    async function fetchDisputes() {
      const q = query(
        collection(db, 'disputes'),
        where('status', '==', 'open'),
        orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc')
      );
      const snap = await getDocs(q);
      setDisputes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dispute)));
    }

    async function fetchVerificationRequests() {
      const q = query(
        collection(db, 'verificationRequests'),
        where('status', '==', 'pending'),
        orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc')
      );
      const snap = await getDocs(q);
      setVerificationRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as VerificationRequest)));
    }

    fetchDisputes();
    fetchVerificationRequests();
  }, []);

  const handleResolve = async (id: string, result: 'resolved' | 'rejected') => {
    await updateDoc(doc(db, 'disputes', id), {
      status: result,
      resolvedAt: serverTimestamp(),
    });
    setDisputes(prev =>
      prev.map(d => (d.id === id ? { ...d, status: result } : d))
    );
  };

  const handleNoteChange = async (id: string, note: string) => {
    await updateDoc(doc(db, 'disputes', id), {
      adminNotes: note,
    });
    setDisputes(prev =>
      prev.map(d => (d.id === id ? { ...d, adminNotes: note } : d))
    );
  };

  const handleVerificationAction = async (requestId: string, uid: string, action: 'approved' | 'rejected') => {
    // Update verification request
    await updateDoc(doc(db, 'verificationRequests', requestId), {
      status: action,
      reviewedAt: serverTimestamp(),
    });

    // If approved, update user document
    if (action === 'approved') {
      await updateDoc(doc(db, 'users', uid), {
        verified: true,
        verifiedAt: serverTimestamp(),
      });
    }

    // Remove from pending list
    setVerificationRequests(prev => prev.filter(req => req.id !== requestId));
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('disputes')}
          className={`pb-2 px-4 ${
            activeTab === 'disputes'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Disputes ({disputes.length})
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-2 px-4 ${
            activeTab === 'verifications'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Verifications ({verificationRequests.length})
        </button>
      </div>

      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Open Disputes</h3>
          {disputes.length === 0 ? (
            <p className="text-gray-400">No open disputes</p>
          ) : (
            disputes.map(d => (
              <div key={d.id} className="bg-gray-900 p-4 rounded border border-gray-700">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <p><strong className="text-gray-300">Booking ID:</strong> <span className="text-white">{d.bookingId}</span></p>
                  <p><strong className="text-gray-300">Client:</strong> <span className="text-white">{d.fromUser}</span></p>
                  <p><strong className="text-gray-300">Provider:</strong> <span className="text-white">{d.providerId}</span></p>
                  <p><strong className="text-gray-300">Status:</strong> 
                    <span className="ml-2 px-2 py-1 rounded text-xs bg-yellow-600 text-white">{d.status}</span>
                  </p>
                </div>
                <p><strong className="text-gray-300">Reason:</strong> <span className="text-white">{d.reason}</span></p>

                <textarea
                  defaultValue={d.adminNotes || ''}
                  onBlur={e => handleNoteChange(d.id, e.target.value)}
                  className="mt-3 w-full p-2 rounded text-black bg-white border border-gray-300"
                  placeholder="Admin notes and resolution details..."
                  rows={3}
                />

                {d.status === 'open' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleResolve(d.id, 'resolved')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      ✓ Resolve
                    </button>
                    <button
                      onClick={() => handleResolve(d.id, 'rejected')}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Pending Verification Requests</h3>
          {verificationRequests.length === 0 ? (
            <p className="text-gray-400">No pending verification requests</p>
          ) : (
            verificationRequests.map(req => (
              <div key={req.id} className="bg-gray-900 p-4 rounded border border-gray-700">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <p><strong className="text-gray-300">Email:</strong> <span className="text-white">{req.email}</span></p>
                  <p><strong className="text-gray-300">User ID:</strong> <span className="text-white font-mono text-sm">{req.uid}</span></p>
                </div>
                <p><strong className="text-gray-300">Message:</strong> <span className="text-white">{req.message}</span></p>
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleVerificationAction(req.id, req.uid, 'approved')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    ✓ Approve Verification
                  </button>
                  <button
                    onClick={() => handleVerificationAction(req.id, req.uid, 'rejected')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    ✗ Reject Request
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
