'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/app/firebase';

export default function ExplorePage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const db = getFirestore(app);
      const servicesRef = collection(db, 'services');
      const servicesSnap = await getDocs(servicesRef);
      const servicesList = servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesList);
      setLoading(false);
    };
    fetchServices();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading services...</div>;
  }

  if (services.length === 0) {
    return <div className="text-center mt-10">No services available yet.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Explore Services</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {services.map(service => (
          <Link key={service.id} href={`/services/${service.id}`}>
            <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer">
              <h2 className="text-xl font-bold mb-2">{service.title}</h2>
              <p className="text-sm mb-2">{service.description}</p>
              <p className="text-blue-600 font-bold">${service.price}</p>
              <p className="text-gray-500 text-xs mt-2">{service.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
