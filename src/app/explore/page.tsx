'use client';

import Navbar from '@/app/components/Navbar';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/app/firebase';
import { useRouter } from 'next/navigation';

const ROLES = ['artist', 'engineer', 'studio', 'producer', 'videographer'];
const TAGS = ['mixing', 'trap', 'visuals', 'mastering', 'studio session'];

export default function ExploreServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'services'));
      const all = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(all);
      setFiltered(all);
      setLoading(false);
    };
    fetchServices();
  }, []);

  useEffect(() => {
    let temp = [...services];
    if (roleFilter) {
      temp = temp.filter(s => s.role === roleFilter);
    }
    if (tagFilter) {
      temp = temp.filter(s => s.tags?.includes(tagFilter));
    }
    setFiltered(temp);
  }, [roleFilter, tagFilter, services]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading services...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6">Explore Services</h1>

        <div className="flex flex-wrap gap-4 mb-8">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-black border border-white px-4 py-2 rounded"
          >
            <option value="">All Roles</option>
            {ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="bg-black border border-white px-4 py-2 rounded"
          >
            <option value="">All Tags</option>
            {TAGS.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setRoleFilter('');
              setTagFilter('');
            }}
            className="border border-white px-4 py-2 rounded hover:bg-white hover:text-black transition"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map(service => (
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
