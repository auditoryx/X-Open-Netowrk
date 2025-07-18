'use client';

import withAdminProtection from '@/middleware/withAdminProtection';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS';
import {
  collection,
  getCountFromServer,
  query,
  where,
  collectionGroup,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';

function AdminDashboardPage() {
  const [stats, setStats] = useState({ bookings: 0, contracts: 0, disputes: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const bookingsSnap = await getCountFromServer(collection(db, 'bookings'));
      const contractsSnap = await getCountFromServer(collection(db, 'contracts'));
      const disputesSnap = await getCountFromServer(
        query(collection(db, 'disputes'), where(SCHEMA_FIELDS.BOOKING.STATUS, '==', 'open'))
      );
      setStats({
        bookings: bookingsSnap.data().count,
        contracts: contractsSnap.data().count,
        disputes: disputesSnap.data().count,
      });
    }

    async function fetchRecentActivity() {
      const q = query(collectionGroup(db, 'logs'), orderBy('timestamp', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentActivity(logs);
    }

    fetchStats();
    fetchRecentActivity();
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <Card label="Total Bookings" count={stats.bookings} />
        <Card label="Total Contracts" count={stats.contracts} />
        <Card label="Open Disputes" count={stats.disputes} />
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
        <ul className="bg-gray-900 p-4 rounded space-y-2">
          {recentActivity.map((log, idx) => (
            <li key={idx} className="text-sm text-white">
              [{new Date(log.timestamp?.seconds * 1000).toLocaleString()}]{" "}
              <strong>{log.actionType}</strong> – {JSON.stringify(log.details)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Card({ label, count }: { label: string; count: number }) {
  return (
    <div className="bg-gray-800 text-white rounded p-4 shadow">
      <div className="text-sm uppercase tracking-wide text-gray-400">{label}</div>
      <div className="text-2xl font-bold">{count}</div>
    </div>
  );
}

export default withAdminProtection(AdminDashboardPage);
