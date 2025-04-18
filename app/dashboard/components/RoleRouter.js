'use client';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import ArtistDashboard from './roles/ArtistDashboard';
import ProducerDashboard from './roles/ProducerDashboard';
import StudioDashboard from './roles/StudioDashboard';
import DefaultDashboard from './roles/DefaultDashboard';

export default function RoleRouter() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore(app);
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setRole(docSnap.data().role || 'default');
      }
    };

    fetchRole();
  }, []);

  if (!role) return <p>Loading dashboard...</p>;

  switch (role) {
    case 'artist':
      return <ArtistDashboard />;
    case 'producer':
      return <ProducerDashboard />;
    case 'studio':
      return <StudioDashboard />;
    default:
      return <DefaultDashboard />;
  }
}
