'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import PayButton from '../components/PayButton';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesSnapshot = await getDocs(collection(db, 'services'));
        const servicesList = servicesSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setServices(servicesList);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4">Available Services</h1>
      
      {loading ? (
        <p className="text-gray-400">Loading services...</p>
      ) : services.length > 0 ? (
        <ul className="space-y-4">
          {services.map(service => (
            <li key={service.id} className="border border-gray-700 p-4 rounded-lg bg-gray-900">
              <h2 className="text-xl font-semibold">{service.name}</h2>
              <p className="text-gray-400">{service.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-blue-400 font-bold">${service.price}</p>
                <PayButton 
                  serviceName={service.name} 
                  price={service.price} 
                  providerId={service.ownerId || 'admin'} 
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No services available yet.</p>
          <p className="text-sm text-gray-500">Check back later or contact an admin to add services.</p>
        </div>
      )}
    </div>
  );
}
