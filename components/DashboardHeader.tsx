"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { SCHEMA_FIELDS } from "@/lib/SCHEMA_FIELDS";
import { TIER_REQUIREMENTS } from "@/constants/gamification";
import XpProgressBar from "@/components/ui/XpProgressBar";
import { Flame, Trophy, Star } from "lucide-react";

interface UserProgress {
  totalXp: number;
  currentStreak: number;
  badges?: string[];
  level?: number;
  tier?: 'standard' | 'verified' | 'signature';
}

export default function DashboardHeader() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalXp: 0,
    currentStreak: 0,
    badges: [],
    level: 1,
    tier: 'standard'
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || "");
      getDoc(doc(db, "users", user.email || "")).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role || "");
          
          // Load user progress data
          setUserProgress({
            totalXp: data[SCHEMA_FIELDS.USER_PROGRESS.TOTAL_XP] || 0,
            currentStreak: data[SCHEMA_FIELDS.USER_PROGRESS.CURRENT_STREAK] || 0,
            badges: data[SCHEMA_FIELDS.USER_PROGRESS.BADGES_EARNED] || [],
            level: data[SCHEMA_FIELDS.USER_PROGRESS.LEVEL] || 1,
            tier: data.tier || 'standard'
          });
        }
      });
    }
  }, []);

  const handleLogout = async (): Promise<void> => {
    await signOut(auth);
    router.push("/login");
  };

  const getNextTierXp = (currentTier: string) => {
    switch (currentTier) {
      case 'standard': return TIER_REQUIREMENTS.verified.xp;
      case 'verified': return TIER_REQUIREMENTS.signature.xp;
      case 'signature': return TIER_REQUIREMENTS.signature.xp;
      default: return TIER_REQUIREMENTS.verified.xp;
    }
  };

  return (
    <header className="border-b border-gray-800 bg-black text-white">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold">Dashboard</h2>
          {email && <p className="text-sm text-gray-400">{email} — {role}</p>}
        </div>
        
        {/* Gamification Progress Section */}
        <div className="flex items-center space-x-6 mr-6">
          {/* XP Progress */}
          <div className="hidden lg:block w-48">
            <XpProgressBar
              currentXp={userProgress.totalXp}
              nextTierXp={getNextTierXp(userProgress.tier || 'standard')}
              currentTier={userProgress.tier || 'standard'}
            />
          </div>

          {/* Streak Display */}
          {userProgress.currentStreak > 0 && (
            <div className="flex items-center space-x-2 bg-orange-600 bg-opacity-20 rounded-lg px-3 py-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-200">
                {userProgress.currentStreak} day streak
              </span>
            </div>
          )}

          {/* Badges Count */}
          {(userProgress.badges?.length || 0) > 0 && (
            <div className="flex items-center space-x-2 bg-yellow-600 bg-opacity-20 rounded-lg px-3 py-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-200">
                {userProgress.badges?.length} badges
              </span>
            </div>
          )}

          {/* Tier Badge */}
          <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 ${
            userProgress.tier === 'signature' ? 'bg-purple-600 bg-opacity-20' :
            userProgress.tier === 'verified' ? 'bg-blue-600 bg-opacity-20' :
            'bg-gray-600 bg-opacity-20'
          }`}>
            <Star className={`w-4 h-4 ${
              userProgress.tier === 'signature' ? 'text-purple-400' :
              userProgress.tier === 'verified' ? 'text-blue-400' :
              'text-gray-400'
            }`} />
            <span className={`text-sm font-medium capitalize ${
              userProgress.tier === 'signature' ? 'text-purple-200' :
              userProgress.tier === 'verified' ? 'text-blue-200' :
              'text-gray-200'
            }`}>
              {userProgress.tier}
            </span>
          </div>
        </div>

        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      {/* Mobile XP Progress */}
      <div className="lg:hidden px-6 pb-4">
        <XpProgressBar
          currentXp={userProgress.totalXp}
          nextTierXp={getNextTierXp(userProgress.tier || 'standard')}
          currentTier={userProgress.tier || 'standard'}
        />
      </div>
    </header>
  );
}
