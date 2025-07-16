'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import withAdminProtection from '@/middleware/withAdminProtection';
import toast from 'react-hot-toast';
import { toggleSignatureTier } from '@/lib/firestore/updateUserTier';
import SignatureBadge from '@/components/badges/SignatureBadge';

function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      const q = query(collection(db, 'users'), orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'));
      const snap = await getDocs(q);
      const users = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllUsers(users);
      setFiltered(users);
    }

    fetchUsers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    let f = allUsers;

    if (roleFilter) {
      f = f.filter((u) => u.role === roleFilter);
    }

    if (q) {
      f = f.filter(
        (u) =>
          u.id.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.name?.toLowerCase().includes(q)
      );
    }

    setFiltered(f);
  }, [search, roleFilter, allUsers]);

  const handleRoleChange = async (uid: string, newRole: string) => {
    try {
      const res = await fetch('/api/promote-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, role: newRole }),
      });

      if (!res.ok) throw new Error();
      toast.success(`User ${uid} promoted to ${newRole}`);

      setAllUsers((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, role: newRole } : u))
      );
    } catch {
      toast.error('Failed to update role');
    }
  };

  const toggleBan = async (uid: string, ban: boolean) => {
    try {
      await fetch('/api/ban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, banned: ban }),
      });

      toast.success(`User ${ban ? 'banned' : 'unbanned'}`);
      setAllUsers((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, banned: ban } : u))
      );
    } catch {
      toast.error('Failed to update ban status');
    }
  };

  const handleSignatureToggle = async (uid: string, signature: boolean) => {
    try {
      await toggleSignatureTier(uid, signature);
      toast.success(`User ${signature ? 'granted' : 'removed from'} Signature tier`);
      
      setAllUsers((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, signature } : u))
      );
    } catch (error) {
      console.error('Error toggling signature tier:', error);
      toast.error('Failed to update signature tier');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">User Directory</h1>

      <div className="flex items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search UID / Email / Name"
          className="p-2 text-black rounded w-64"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-2 rounded text-black"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="verified">Verified</option>
          <option value="pro">Pro</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400">No users match your filters.</p>
      ) : (
        filtered.map((user) => (
          <div key={user.id} className="bg-gray-900 p-4 rounded space-y-1">
            <div className="flex items-center gap-2">
              <p><strong>UID:</strong> {user.id}</p>
              {user.signature && <SignatureBadge />}
            </div>
            <p><strong>Email:</strong> {user.email || 'N/A'}</p>
            <p><strong>Name:</strong> {user.name || '—'}</p>
            <p><strong>Role:</strong> {user.role || 'user'}</p>
            <p><strong>Banned:</strong> {user.banned ? 'Yes' : 'No'}</p>
            <p><strong>Signature Tier:</strong> {user.signature ? 'Yes' : 'No'}</p>
            <p><strong>Joined:</strong> {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}</p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                Update Role
              </button>
              <button
                className={`${
                  user.banned ? 'bg-yellow-600' : 'bg-red-600'
                } text-white px-3 py-1 rounded text-sm`}
                onClick={() => toggleBan(user.id, !user.banned)}
              >
                {user.banned ? 'Unban' : 'Ban'}
              </button>
              <button
                className={`${
                  user.signature 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                } text-white px-3 py-1 rounded text-sm transition-colors`}
                onClick={() => handleSignatureToggle(user.id, !user.signature)}
                title={user.signature ? 'Remove Signature tier' : 'Grant Signature tier'}
              >
                {user.signature ? '💎 Remove Signature' : '💎 Grant Signature'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default withAdminProtection(AdminUsersPage);
