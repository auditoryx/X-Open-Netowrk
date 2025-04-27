'use client';

import Navbar from '@/app/components/Navbar';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/app/firebase';
import { useRouter } from 'next/navigation';

export default function ExploreServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'services'));
      const tempServices = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(tempServices);
      setLoading(false);
    };

    fetchServices();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading services...</div>;
  }

  if (services.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">No services found.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">Explore Services</h1>

        <div className="mb-8">
          <button
            onClick={() => router.push('/services/add')}
            className="border border-white px-6 py-3 rounded hover:bg-white hover:text-black transition"
          >
            List Your Service
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map(service => (
            <div key={service.id} className="border p-4 rounded shadow hover:bg-white hover:text-black transition">
              <h2 className="text-2xl font-semibold mb-2">{service.title}</h2>
              <p className="text-gray-300 mb-2">${service.price}</p>
              <p className="text-gray-400 mb-4">{service.description?.substring(0, 100)}...</p>
              <button
                onClick={() => router.push(`/services/${service.id}`)}
                className="mt-2 border border-white px-4 py-2 rounded hover:bg-black hover:text-white transition"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
