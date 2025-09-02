"use client";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import SendServiceRequest from "./SendServiceRequest";
import { Service } from "../src/types/service";

type RoleFilter = "" | "artist" | "engineer" | "producer" | "studio" | "videographer";

export default function ExploreServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [filter, setFilter] = useState<RoleFilter>("");

  useEffect(() => {
    const fetchServices = async (): Promise<void> => {
      const snap = await getDocs(collection(db, "services"));
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    };
    fetchServices();
  }, []);

  const filtered = filter
    ? services.filter(s => s.category === filter || s.tags?.includes(filter))
    : services;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        {(["", "artist", "engineer", "producer", "studio", "videographer"] as RoleFilter[]).map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`btn ${filter === r ? "btn-primary" : "btn-secondary"}`}
          >
            {r === "" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-400">No services found.</p>
      )}

      {filtered.map(service => (
        <div key={service.id} className="border border-gray-700 bg-gray-900 p-6 rounded-lg">
          <h3 className="text-xl font-bold">{service.title}</h3>
          <p className="text-gray-300 mb-1">${service.price}</p>
          <p className="text-gray-400 mb-3">{service.description}</p>
          <SendServiceRequest
            serviceId={service.id}
            recipientId={service.userId}
            recipientRole={service.role === 'creator' ? 'creator' : service.role === 'admin' ? 'admin' : 'provider'}
          />
        </div>
      ))}
    </div>
  );
}
