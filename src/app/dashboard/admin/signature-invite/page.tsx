'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';

export default function SignatureInvitePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const promoteToSignature = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), {
      proTier: 'signature',
      contactOnlyViaRequest: true,
    });
    alert('User upgraded to Signature');
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Signature Tier Invites</h1>
      {users.map((user) => (
        <div key={user.id} className="border border-white p-4 rounded mb-4">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>proTier:</strong> {user.proTier || 'standard'}</p>
          <div className="mt-2">
            {user.proTier !== 'signature' && (
              <button
                className="bg-purple-700 px-4 py-2 rounded"
                onClick={() => promoteToSignature(user.id)}
              >
                Invite to Signature
              </button>
            )}
            {user.proTier === 'signature' && (
              <span className="text-green-400">Already Signature</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
