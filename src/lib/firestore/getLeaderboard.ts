import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  profileImage?: string;
  xp: number;
  tier: string;
  rank: number;
  weeklyXp?: number;
}

export interface LeaderboardData {
  weekly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
  lastUpdated: any;
}

/**
 * Get leaderboard data for a specific role
 * @param role - The role to get leaderboard for (influencer, freelancer, tutor, etc.)
 * @returns Promise<LeaderboardData | null>
 */
export async function getLeaderboard(role: string): Promise<LeaderboardData | null> {
  try {
    const leaderboardRef = doc(db, 'leaderboards', role);
    const leaderboardDoc = await getDoc(leaderboardRef);
    
    if (!leaderboardDoc.exists()) {
      console.log(`No leaderboard found for role: ${role}`);
      return null;
    }
    
    return leaderboardDoc.data() as LeaderboardData;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return null;
  }
}

/**
 * Get top creators across all roles
 * @param timeframe - 'weekly' or 'allTime'
 * @param limitCount - Number of creators to return (default: 10)
 * @returns Promise<LeaderboardEntry[]>
 */
export async function getTopCreators(
  timeframe: 'weekly' | 'allTime' = 'allTime', 
  limitCount: number = 10
): Promise<LeaderboardEntry[]> {
  try {
    const roles = ['influencer', 'freelancer', 'tutor', 'consultant', 'coach'];
    const allCreators: LeaderboardEntry[] = [];
    
    // Fetch leaderboards for all roles
    for (const role of roles) {
      const leaderboard = await getLeaderboard(role);
      if (leaderboard) {
        const creators = leaderboard[timeframe] || [];
        allCreators.push(...creators);
      }
    }
    
    // Sort by XP and return top creators
    const sortedCreators = allCreators
      .sort((a, b) => {
        const aXp = timeframe === 'weekly' ? (a.weeklyXp || 0) : a.xp;
        const bXp = timeframe === 'weekly' ? (b.weeklyXp || 0) : b.xp;
        return bXp - aXp;
      })
      .slice(0, limitCount)
      .map((creator, index) => ({
        ...creator,
        rank: index + 1
      }));
    
    return sortedCreators;
  } catch (error) {
    console.error('Error fetching top creators:', error);
    return [];
  }
}

/**
 * Get user's position in leaderboard for their role
 * @param userId - User ID to find
 * @param role - User's role
 * @returns Promise<{ weeklyRank?: number; allTimeRank?: number; weeklyXp?: number; allTimeXp?: number }>
 */
export async function getUserLeaderboardPosition(userId: string, role: string) {
  try {
    const leaderboard = await getLeaderboard(role);
    if (!leaderboard) return {};
    
    const weeklyRank = leaderboard.weekly?.findIndex(entry => entry.userId === userId);
    const allTimeRank = leaderboard.allTime?.findIndex(entry => entry.userId === userId);
    
    const weeklyEntry = leaderboard.weekly?.find(entry => entry.userId === userId);
    const allTimeEntry = leaderboard.allTime?.find(entry => entry.userId === userId);
    
    return {
      weeklyRank: weeklyRank !== -1 ? weeklyRank + 1 : undefined,
      allTimeRank: allTimeRank !== -1 ? allTimeRank + 1 : undefined,
      weeklyXp: weeklyEntry?.weeklyXp || weeklyEntry?.xp,
      allTimeXp: allTimeEntry?.xp
    };
  } catch (error) {
    console.error('Error getting user leaderboard position:', error);
    return {};
  }
}
