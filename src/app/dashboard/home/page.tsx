'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import { ProfileTrustStats } from '@/components/profile/ProfileTrustStats';
import { RankProgress } from '@/components/dashboard/RankProgress';
import CollabStatsWidget from '@/components/dashboard/collab/CollabStatsWidget';
import XPWidget from '@/components/gamification/XPWidget';
import Link from 'next/link';
import { MessageCircle, Bell, Calendar, Settings, Shield, Users } from 'lucide-react';

export default function DashboardHomePage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin/moderator
  const isAdmin = userData?.role && ['admin', 'moderator'].includes(userData.role.toLowerCase());

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
      
      {/* XP Widget */}
      {userData?.uid && (
        <section>
          <h2 className="text-xl font-bold mb-4">Your Progress</h2>
          <XPWidget showHistory={true} className="max-w-md mx-auto lg:mx-0" />
        </section>
      )}
      
      {/* Quick Navigation Cards */}
      <section>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isAdmin ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
          <Link 
            href="/dashboard/inbox"
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 hover:bg-neutral-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-blue-400" />
              <div>
                <h3 className="font-semibold">Booking Inbox</h3>
                <p className="text-sm text-gray-400">Manage bookings & messages</p>
              </div>
            </div>
          </Link>
          
          <Link 
            href="/dashboard/notifications"
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 hover:bg-neutral-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-green-400" />
              <div>
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-sm text-gray-400">View all notifications</p>
              </div>
            </div>
          </Link>
          
          <Link 
            href="/dashboard/bookings"
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 hover:bg-neutral-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-purple-400" />
              <div>
                <h3 className="font-semibold">Bookings</h3>
                <p className="text-sm text-gray-400">Manage your bookings</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/dashboard/collabs"
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 hover:bg-neutral-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-cyan-400" />
              <div>
                <h3 className="font-semibold">Collaborations</h3>
                <p className="text-sm text-gray-400">Manage collab packages</p>
              </div>
            </div>
          </Link>
          
          <Link 
            href="/dashboard/settings"
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 hover:bg-neutral-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-orange-400" />
              <div>
                <h3 className="font-semibold">Settings</h3>
                <p className="text-sm text-gray-400">Account preferences</p>
              </div>
            </div>
          </Link>

          {/* Admin Panel - Only show for admin/moderator users */}
          {isAdmin && (
            <Link 
              href="/dashboard/admin/verifications"
              className="bg-neutral-800 border border-red-700 rounded-lg p-4 hover:bg-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-red-400" />
                <div>
                  <h3 className="font-semibold">Admin Panel</h3>
                  <p className="text-sm text-gray-400">Manage verifications</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Rank Progress Widget */}
      {userData?.uid && userData?.role && (
        <section>
          <RankProgress 
            userId={userData.uid} 
            userRole={userData.role} 
            className="max-w-md mx-auto lg:mx-0"
          />
        </section>
      )}

      {/* Collab Stats Widget */}
      <section>
        <CollabStatsWidget />
      </section>

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
