import { useCart } from "@/context/CartContext";
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { SaveButton } from '@/components/profile/SaveButton';

export default function ServiceDetailPage() {
  const { id: rawId } = useParams();
  const id = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : '';
  const { addItem } = useCart();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchService = async () => {
      const db = getFirestore(app);
      const ref = doc(db, 'services', id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setService(snap.data());
      } else {
        setService(null);
      }

      setLoading(false);
    };

    if (id) fetchService();
  }, [id]);

  if (loading) return <div className="text-white p-8">Loading service...</div>;
  if (!service) return <div className="text-red-400 p-8">Service not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold mb-4">{service.title || 'Untitled Service'}</h1>
        <p className="text-gray-400 mb-6">{service.description || 'No description provided.'}</p>

        <div className="flex items-center justify-between border-t border-b py-4 mb-6">
          <div>
            <p className="text-sm text-gray-300">Provided by</p>
            <p className="font-semibold">{service.creatorName || 'Unknown'}</p>
          </div>
          <SaveButton providerId={service.creatorId || ''} />
        </div>

        <p className="text-lg">💵 ${service.price}</p>
        <button
          onClick={() =>
            addItem({ serviceId: id, serviceName: service.title, price: service.price })
          }
          className="btn mt-4"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
