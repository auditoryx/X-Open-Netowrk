'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import { ProfileTrustStats } from '@/components/profile/ProfileTrustStats';

export default function DashboardHomePage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(async current => {
      if (!current) {
        router.push('/login');
        return;
      }
      const db = getFirestore(app);
      const q = query(collection(db, 'bookingRequests'), where('buyerId', '==', current.uid));
      const snap = await getDocs(q);
      const upcoming = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(b => ['accepted', 'paid'].includes(b.status))
        .slice(0, 3);
      setBookings(upcoming);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 text-white space-y-8">
      <NotificationsPanel />
      <section>
        <h2 className="text-xl font-bold mb-2">Upcoming Bookings</h2>
        {bookings.length === 0 ? (
          <p>No upcoming bookings.</p>
        ) : (
          <ul className="space-y-2">
            {bookings.map(b => (
              <li key={b.id} className="border border-neutral-700 p-3 rounded">
                {b.serviceId} – {b.status}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-xl font-bold mb-2">Recent Messages</h2>
        <p>No new messages.</p>
      </section>
      <ProfileTrustStats />
    </div>
  );
}
