'use client';

import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { UserProfile } from '@/types/user';
import ProfileCompletionMeter from '@/components/dashboard/ProfileCompletionMeter';
import { isProfileComplete } from '@/lib/profile/isProfileComplete';
import DashboardRoleOverview from '@/components/dashboard/DashboardRoleOverview';
import { withRoleProtection } from '@/lib/utils/withRoleProtection';

function StudioDashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore(app);
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile({ uid: user.uid, ...snap.data() } as UserProfile);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  const complete = profile && isProfileComplete(profile);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {profile && <DashboardRoleOverview profile={profile} />}
      {profile && <ProfileCompletionMeter profile={profile} />}

      {!complete && (
        <div className="bg-yellow-700 text-yellow-100 p-4 rounded-lg mb-4">
          🚨 Your profile is incomplete. You won&apos;t appear in search results or be bookable until it’s complete.
        </div>
      )}

      <p>Select an option from the sidebar to manage your account.</p>
    </div>
  );
}

export default withRoleProtection(StudioDashboardPage, ['studio']);
