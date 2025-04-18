"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ClientPage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const servicesRef = collection(db, "services");
      const querySnapshot = await getDocs(servicesRef);
      const fetchedServices = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(fetchedServices);
    };

    fetchServices();
  }, []);

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-4xl font-bold mb-6">Available Services</h1>
      {services.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <ul className="space-y-6">
          {services.map((service) => (
            <li
              key={service.id}
              className="bg-zinc-900 p-4 rounded-md shadow border border-zinc-700"
            >
              <h2 className="text-xl font-semibold">{service.title}</h2>
              <p className="text-sm text-gray-400 mt-1">{service.description}</p>
              <p className="text-green-400 mt-2">${service.price}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
