'use client';

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

      // Fetch services created by this user
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, where('creatorId', '==', user.uid));
      const servicesSnap = await getDocs(q);
      const serviceIds = servicesSnap.docs.map(doc => doc.id);

      if (serviceIds.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Fetch orders for those services
      const ordersRef = collection(db, 'orders');
      const ordersSnap = await getDocs(ordersRef);

      const filteredOrders = [];

      for (const order of ordersSnap.docs) {
        const data = order.data();
        if (serviceIds.includes(data.serviceId)) {
          // Fetch service title
          const serviceRef = doc(db, 'services', data.serviceId);
          const serviceSnap = await getDoc(serviceRef);
          const serviceData = serviceSnap.data();
          filteredOrders.push({
            id: order.id,
            ...data,
            serviceTitle: serviceData?.title || 'Unknown Service',
          });
        }
      }

      setOrders(filteredOrders);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center mt-10">No orders yet.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <ul className="space-y-6">
        {orders.map((order) => (
          <li key={order.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{order.serviceTitle}</h2>
            <p className="text-gray-600 mb-1">Service ID: {order.serviceId}</p>
            <p className="text-gray-800 font-bold mb-1">${order.amountPaid}</p>
            <p className="text-sm text-gray-400">Order ID: {order.id}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
