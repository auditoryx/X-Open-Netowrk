'use client';

import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app, isFirebaseConfigured } from '@/lib/firebase';
import { UserProfile } from '@/types/user';
import ProfileCompletionMeter from '@/components/dashboard/ProfileCompletionMeter';
import { isProfileComplete } from '@/lib/profile/isProfileComplete';
import DashboardRoleOverview from '@/components/dashboard/DashboardRoleOverview';

function ArtistDashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!isFirebaseConfigured()) {
          console.warn('Firebase not configured, using mock data for artist dashboard');
          setProfile({
            uid: 'mock-artist-uid',
            email: 'mock@example.com',
            displayName: 'Mock Artist',
            role: 'artist',
            bio: 'This is mock profile data for development',
            profileImageUrl: '',
            createdAt: new Date(),
            updatedAt: new Date(),
          } as UserProfile);
          setLoading(false);
          return;
        }

        const auth = getAuth(app);
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const db = getFirestore(app);
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile({ uid: user.uid, ...snap.data() } as UserProfile);
        }
      } catch (error) {
        console.error('Failed to fetch artist profile:', error);
        setFirebaseError('Unable to load profile data. Please try again later.');
        // Provide fallback mock data
        setProfile({
          uid: 'fallback-artist-uid',
          email: 'artist@example.com',
          displayName: 'Artist (Offline)',
          role: 'artist',
          bio: 'Profile temporarily unavailable',
          profileImageUrl: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as UserProfile);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  const complete = profile && isProfileComplete(profile);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {firebaseError && (
        <div className="bg-red-900 text-red-100 p-4 rounded-lg mb-4">
          ⚠️ {firebaseError}
        </div>
      )}
      
      {!isFirebaseConfigured() && (
        <div className="bg-blue-900 text-blue-100 p-4 rounded-lg mb-4">
          ℹ️ Running in development mode with mock data
        </div>
      )}

      {profile && <DashboardRoleOverview profile={profile} />}
      {profile && <ProfileCompletionMeter profile={profile} />}

      {!complete && (
        <div className="bg-yellow-700 text-yellow-100 p-4 rounded-lg mb-4">
          🚨 Your profile is incomplete. You won&apos;t appear in search results or be bookable until it’s complete.
        </div>
      )}

      <p>Select an option from the sidebar to manage your account.</p>
      
      <button 
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        data-testid="smoke"
      >
        Artist Dashboard Actions
      </button>
    </div>
  );
}

export default ArtistDashboardPage;
