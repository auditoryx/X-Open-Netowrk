'use client';

import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { app } from '@/app/firebase';
import { useRouter } from 'next/navigation';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      const db = getFirestore(app);
      const servicesCollection = collection(db, 'services');
      const serviceSnapshot = await getDocs(servicesCollection);
      const serviceList = serviceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(serviceList);
      setLoading(false);
    };

    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'services', id));
    setServices(prev => prev.filter(service => service.id !== id));
  };

  if (loading) return <div>Loading services...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Manage Services</h1>
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/services/add')}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
        >
          Add New Service
        </button>
      </div>
      <ul className="space-y-6">
        {services.map(service => (
          <li key={service.id} className="border p-4 rounded shadow text-white">
            <h2 className="text-xl font-semibold mb-2">{service.title}</h2>
            <p className="text-gray-300 mb-1">${service.price}</p>
            <p className="text-sm text-gray-400 mb-2">{service.description}</p>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push(`/dashboard/services/edit/${service.id}`)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
