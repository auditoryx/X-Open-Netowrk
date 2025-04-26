'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/app/firebase';

export default function ProfilePage() {
  const { uid } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndServices = async () => {
      if (!uid) return;
      const db = getFirestore(app);
      const userRef = doc(db, 'users', uid as string);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfile(userSnap.data());
      }

      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, where('creatorId', '==', uid));
      const servicesSnap = await getDocs(q);
      const servicesList = servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setServices(servicesList);
      setLoading(false);
    };
    fetchProfileAndServices();
  }, [uid]);

  if (loading) {
    return <div className="text-center mt-10">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center mt-10">Profile not found.</div>;
  }

  const defaultProfilePic = '/images/default-profile.png';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-center mb-6">
        <img
          src={profile.profilePicUrl || defaultProfilePic}
          alt="Profile Picture"
          className="w-32 h-32 rounded-full object-cover transition-transform hover:scale-110 duration-300"
          onError={(e) => (e.currentTarget.src = defaultProfilePic)}
        />
      </div>
      <h1 className="text-3xl font-bold mb-4">{profile.name || 'No Name Provided'}</h1>
      <p className="mb-2">{profile.bio || 'No bio yet.'}</p>

      {profile.socials && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Social Links:</h2>
          <ul className="list-disc list-inside">
            {Object.entries(profile.socials).map(([platform, link]) => (
              <li key={platform}>
                <a href={link} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                  {platform}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {services.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Services Offered</h2>
          <ul className="space-y-4">
            {services.map(service => (
              <li key={service.id} className="border p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold">{service.title}</h3>
                <p className="text-sm mb-2">{service.description}</p>
                <p className="text-blue-600 font-bold">${service.price}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
