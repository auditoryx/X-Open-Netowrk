'use client';

import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { app } from '@/lib/firebase';
import ProfileCompletionMeter from '@/components/dashboard/ProfileCompletionMeter';
import AvailabilitySelector from '@/components/profile/AvailabilitySelector';
import { PortfolioEditor } from '@/components/profile/PortfolioEditor';

export default function EditDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [availability, setAvailability] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const db = getFirestore(app);
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setAvailability(data.availability || []);
      }
    };
    fetchProfile();
  }, [user]);

  if (!user || !profile) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto text-white">
      <h1 className="text-xl font-semibold mb-4">Edit Your Profile</h1>

      <ProfileCompletionMeter profile={profile} />

      {/* 🗓️ Editable Availability Grid */}
      <AvailabilitySelector
        availability={availability}
        setAvailability={setAvailability}
      />

      {/* 🎨 Portfolio Upload Area */}
      <PortfolioEditor uid={user.uid} initial={profile.portfolio || []} />
    </div>
  );
}
