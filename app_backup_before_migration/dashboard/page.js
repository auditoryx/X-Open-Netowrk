<<<<<<< HEAD
'use client';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

import ArtistDashboard from './components/roles/ArtistDashboard';
import ProducerDashboard from './components/roles/ProducerDashboard';
import StudioDashboard from './components/roles/StudioDashboard';
import VideographerDashboard from './components/roles/VideographerDashboard';
import EngineerDashboard from './components/roles/EngineerDashboard';
import DefaultDashboard from './components/roles/DefaultDashboard';
import RoleToggle from "../../components/RoleToggle";

export default function Dashboard() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const token = await user.getIdTokenResult();
      setRole(token.claims.role || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

  switch (role) {
    case 'artist':
      return <ArtistDashboard />;
    case 'producer':
      return <ProducerDashboard />;
    case 'studio':
      return <StudioDashboard />;
    case 'videographer':
      return <VideographerDashboard />;
    case 'engineer':
      return <EngineerDashboard />;
    default:
      return <DefaultDashboard />;
  }
=======
"use client";
import RoleToggle from "../../components/RoleToggle";

export default function DashboardHome() {
  return (
    <div className="p-10 min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <RoleToggle />
    </div>
  );
>>>>>>> 3126253 (chore: finalize migration prep for rebase)
}
