'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ServiceItem {
  name: string;
  description: string;
  price: string;
  availability: string;
}

export default function ServiceManager() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [newService, setNewService] = useState<ServiceItem>({ name: '', description: '', price: '', availability: '' });

  const user = auth.currentUser;

  useEffect(() => {
    const fetchServices = async (): Promise<void> => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().services) {
        setServices(docSnap.data().services);
      }
    };
    fetchServices();
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewService({ ...newService, [e.target.name]: e.target.value });
  };

  const handleAddService = async (): Promise<void> => {
    const updated = [...services, newService];
    setServices(updated);
    setNewService({ name: '', description: '', price: '', availability: '' });

    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, { services: updated }, { merge: true });
  };

  const handleDeleteService = async (index: number): Promise<void> => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);

    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, { services: updated }, { merge: true });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-md mt-6 text-white">
      <h2 className="text-xl font-semibold mb-2">Manage Your Services</h2>
      <div className="space-y-2">
        <input name="name" placeholder="Service name" value={newService.name} onChange={handleChange} className="w-full p-2 text-black rounded" />
        <input name="description" placeholder="Description" value={newService.description} onChange={handleChange} className="w-full p-2 text-black rounded" />
        <input name="price" placeholder="Price" value={newService.price} onChange={handleChange} className="w-full p-2 text-black rounded" />
        <input name="availability" placeholder="Availability" value={newService.availability} onChange={handleChange} className="w-full p-2 text-black rounded" />
        <button onClick={handleAddService} className="bg-blue-500 px-4 py-2 rounded">Add Service</button>
      </div>

      <ul className="mt-4 space-y-2">
        {services.map((service, idx) => (
          <li key={idx} className="border p-2 rounded flex justify-between items-center">
            <div>
              <strong>{service.name}</strong>: {service.description} – ${service.price} ({service.availability})
            </div>
            <button onClick={() => handleDeleteService(idx)} className="text-red-400">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}