"use client";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS';

interface ServiceData {
  id: string;
  title: string;
  price: string;
  desc: string;
  userId: string;
  role: string;
  createdAt: number;
}

interface ServiceListProps {
  userId: string;
}

export default function ServiceList({ userId }: ServiceListProps): JSX.Element {
  const [services, setServices] = useState<ServiceData[]>([]);

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      const q = query(collection(db, "services"), where(SCHEMA_FIELDS.USER.USER_ID, "==", userId));
      const snap = await getDocs(q);
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceData)));
    };
    fetch();
  }, [userId]);

  if (!services.length) return <p className="text-gray-400">No services posted yet.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Services</h2>
      {services.map((s) => (
        <div key={s.id} className="p-4 border border-gray-700 bg-gray-900 rounded">
          <h3 className="text-lg font-bold">{s.title}</h3>
          <p className="text-sm text-gray-300">${s.price}</p>
          <p className="text-sm text-gray-400">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}
