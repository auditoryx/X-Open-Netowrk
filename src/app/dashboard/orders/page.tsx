'use client';

import Navbar from '@/app/components/Navbar';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from '@/app/firebase';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const db = getFirestore(app);
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
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading your orders...</div>;
  }

  if (orders.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">You haven't sold any services yet.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">My Orders (Sales)</h1>
        <ul className="space-y-6">
          {orders.map(order => (
            <li key={order.id} className="border border-white p-6 rounded shadow">
              <h2 className="text-2xl font-semibold mb-2">{order.serviceTitle}</h2>
              <p className="text-gray-400 mb-1">Buyer: {order.buyerName || 'Unknown Buyer'}</p>
              <p className="text-gray-500 text-sm mb-1">Amount Paid: ${order.amountPaid}</p>
              <p className="text-gray-500 text-sm">Order ID: {order.id}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
