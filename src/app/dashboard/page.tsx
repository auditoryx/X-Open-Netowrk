'use client';

import Navbar from '@/app/components/Navbar';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      const db = getFirestore(app);

      // Fetch Orders
      const q = query(collection(db, 'orders'), where('sellerId', '==', user.uid));
      const snap = await getDocs(q);
      const tempOrders = [];

      for (const docSnap of snap.docs) {
        const orderData = docSnap.data();
        const serviceRef = doc(db, 'services', orderData.serviceId);
        const serviceSnap = await getDoc(serviceRef);
        const serviceData = serviceSnap.data();

        tempOrders.push({
          id: docSnap.id,
          ...orderData,
          serviceTitle: serviceData?.title || 'Unknown Service',
        });
      }

      setOrders(tempOrders);

      // Fetch Favorites
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const favIds: string[] = userData?.favorites || [];

      const favProfiles = [];
      for (const id of favIds) {
        const creatorRef = doc(db, 'users', id);
        const creatorSnap = await getDoc(creatorRef);
        if (creatorSnap.exists()) {
          favProfiles.push({ uid: id, ...creatorSnap.data() });
        }
      }

      setFavorites(favProfiles);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-center">Dashboard</h1>

        {userData?.proTier === 'standard' && (
          <div className="bg-yellow-400 text-black p-4 rounded-xl mb-6">
            <h2 className="font-bold text-lg">👤 Get Verified</h2>
            <p className="text-sm">
              Verified creators appear higher in Explore and unlock more visibility.
            </p>
            <Link href="/dashboard/edit">
              <button className="mt-2 px-4 py-2 bg-black text-white rounded">
                Start Verification
              </button>
            </Link>
          </div>
        )}

        <div className="flex flex-col space-y-6 mb-12">
          <button
            onClick={() => router.push('/dashboard/services')}
            className="border border-white p-4 rounded hover:bg-white hover:text-black transition"
          >
            Manage My Services
          </button>
          <button
            onClick={() => router.push('/services/add')}
            className="border border-white p-4 rounded hover:bg-white hover:text-black transition"
          >
            Add New Service
          </button>
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="border border-white p-4 rounded hover:bg-white hover:text-black transition"
          >
            View Orders (Sales)
          </button>
          <button
            onClick={() => router.push('/dashboard/purchases')}
            className="border border-white p-4 rounded hover:bg-white hover:text-black transition"
          >
            View Purchases (Buy History)
          </button>
          <button
            onClick={handleLogout}
            className="border border-white p-4 rounded hover:bg-white hover:text-black transition"
          >
            Logout
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4">🛒 My Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-400 mb-12">You haven’t sold any services yet.</p>
        ) : (
          <ul className="space-y-6 mb-12">
            {orders.map((order) => (
              <li key={order.id} className="border border-white p-6 rounded shadow">
                <h2 className="text-2xl font-semibold mb-2">{order.serviceTitle}</h2>
                <p className="text-gray-400 mb-1">
                  Buyer: {order.buyerName || 'Unknown Buyer'}
                </p>
                <p className="text-gray-500 text-sm mb-1">Amount Paid: ${order.amountPaid}</p>
                <p className="text-gray-500 text-sm">Order ID: {order.id}</p>
              </li>
            ))}
          </ul>
        )}

        <h2 className="text-2xl font-bold mb-4">⭐ Saved Creators</h2>
        {favorites.length === 0 ? (
          <p className="text-gray-400">You haven’t saved any creators yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map((creator) => (
              <li
                key={creator.uid}
                className="border border-neutral-700 p-4 rounded hover:bg-neutral-900 transition"
              >
                <p className="font-semibold text-lg">{creator.name || 'Unnamed'}</p>
                <p className="text-sm text-gray-400 mb-1 capitalize">{creator.role}</p>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {creator.bio || 'No bio provided.'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
