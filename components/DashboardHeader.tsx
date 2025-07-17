"use client";
import { useEffect, useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useRouter } from "next/navigation";
import XpProgressBar from './ui/XpProgressBar';
import { SCHEMA_FIELDS } from '@/src/lib/SCHEMA_FIELDS';
import { TIER_REQUIREMENTS } from '@/src/constants/gamification';

interface UserProgressData {
  totalXp: number;
  currentStreak: number;
  badges: string[];
  tier: 'standard' | 'verified' | 'signature';
}

export default function DashboardHeader(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userProgress, setUserProgress] = useState<UserProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email || "");
        
        try {
          // Get basic user info
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role || "");
            
            // Extract gamification data
            const totalXp = userData[SCHEMA_FIELDS.USER_PROGRESS.TOTAL_XP] || 0;
            const currentStreak = userData[SCHEMA_FIELDS.USER_PROGRESS.CURRENT_STREAK] || 0;
            const badges = userData[SCHEMA_FIELDS.USER_PROGRESS.BADGES_EARNED] || [];
            const tier = userData.tier || 'standard';
            
            setUserProgress({
              totalXp,
              currentStreak,
              badges,
              tier
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async (): Promise<void> => {
    await signOut(auth);
    router.push("/login");
  };

  // Calculate next tier XP requirement
  const getNextTierXp = (currentTier: string, currentXp: number) => {
    switch (currentTier) {
      case 'standard':
        return TIER_REQUIREMENTS.verified.xp;
      case 'verified':
        return TIER_REQUIREMENTS.signature.xp;
      case 'signature':
        return currentXp + 1000; // Show progress beyond signature
      default:
        return TIER_REQUIREMENTS.verified.xp;
    }
  };

  return (
    <header className="border-b border-gray-800 bg-black text-white">
      {/* Main Header Row */}
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h2 className="text-xl font-bold">Dashboard</h2>
          {email && <p className="text-sm text-gray-400">{email} — {role}</p>}
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      {/* Gamification Progress Row */}
      {userProgress && !loading && (
        <div className="px-6 pb-4">
          <XpProgressBar
            currentXp={userProgress.totalXp}
            nextLevelXp={getNextTierXp(userProgress.tier, userProgress.totalXp)}
            currentStreak={userProgress.currentStreak}
            badges={userProgress.badges}
            tier={userProgress.tier}
            compact={true}
          />
        </div>
      )}
    </header>
  );
}
