'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from 'firebase/firestore';
import withAdminProtection from '@/middleware/withAdminProtection';
import toast from 'react-hot-toast';

function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setUsers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }

    fetchUsers();
  }, []);

  const handleRoleChange = async (uid: string, newRole: string) => {
    try {
      const res = await fetch('/api/promote-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, role: newRole }),
      });

      if (!res.ok) throw new Error();

      setUsers((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, role: newRole } : u))
      );

      toast.success(`User ${uid} promoted to ${newRole}`);
    } catch {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">All Users</h1>
      {users.map((user) => (
        <div key={user.id} className="bg-gray-900 p-4 rounded space-y-1">
          <p><strong>UID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email || 'N/A'}</p>
          <p><strong>Role:</strong> {user.role || 'user'}</p>
          <p><strong>Created:</strong> {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}</p>

          <div className="flex items-center gap-2 mt-2">
            <select
              className="p-1 rounded text-black"
              value={user.role || ''}
              onChange={(e) => handleRoleChange(user.id, e.target.value)}
            >
              <option value="user">User</option>
              <option value="verified">Verified</option>
              <option value="pro">Pro</option>
              <option value="admin">Admin</option>
            </select>
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
              onClick={() => handleRoleChange(user.id, user.role)}
            >
              Update
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default withAdminProtection(AdminUsersPage);
