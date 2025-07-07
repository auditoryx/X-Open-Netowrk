/**
 * Ranking Data Seeder
 * Utility to populate ranking data for testing
 */

import { 
  collection, 
  doc, 
  setDoc, 
  writeBatch, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface MockUserData {
  userId: string;
  displayName: string;
  totalXP: number;
  weeklyXP: number;
  tier: 'new' | 'verified' | 'signature';
  isVerified: boolean;
  averageRating: number;
  completedBookings: number;
  profileViews: number;
}

/**
 * Generate mock ranking data for testing
 */
export async function seedRankingData(): Promise<void> {
  console.log('Starting ranking data seeding...');
  
  const mockUsers: MockUserData[] = [
    {
      userId: 'mock-user-1',
      displayName: 'Alex Thompson',
      totalXP: 2500,
      weeklyXP: 180,
      tier: 'verified',
      isVerified: true,
      averageRating: 4.9,
      completedBookings: 25,
      profileViews: 320
    },
    {
      userId: 'mock-user-2',
      displayName: 'Sarah Chen',
      totalXP: 2200,
      weeklyXP: 160,
      tier: 'verified',
      isVerified: true,
      averageRating: 4.8,
      completedBookings: 22,
      profileViews: 280
    },
    {
      userId: 'mock-user-3',
      displayName: 'Marcus Rodriguez',
      totalXP: 1950,
      weeklyXP: 140,
      tier: 'verified',
      isVerified: true,
      averageRating: 4.7,
      completedBookings: 19,
      profileViews: 245
    },
    {
      userId: 'mock-user-4',
      displayName: 'Emma Wilson',
      totalXP: 1800,
      weeklyXP: 120,
      tier: 'new',
      isVerified: false,
      averageRating: 4.6,
      completedBookings: 15,
      profileViews: 180
    },
    {
      userId: 'mock-user-5',
      displayName: 'David Kim',
      totalXP: 1650,
      weeklyXP: 110,
      tier: 'new',
      isVerified: false,
      averageRating: 4.5,
      completedBookings: 12,
      profileViews: 150
    },
    {
      userId: 'mock-user-6',
      displayName: 'Luna Martinez',
      totalXP: 1500,
      weeklyXP: 95,
      tier: 'new',
      isVerified: false,
      averageRating: 4.4,
      completedBookings: 10,
      profileViews: 120
    },
    {
      userId: 'mock-user-7',
      displayName: 'Ryan O\'Connor',
      totalXP: 1350,
      weeklyXP: 85,
      tier: 'new',
      isVerified: false,
      averageRating: 4.3,
      completedBookings: 8,
      profileViews: 100
    },
    {
      userId: 'mock-user-8',
      displayName: 'Zoe Johnson',
      totalXP: 1200,
      weeklyXP: 75,
      tier: 'new',
      isVerified: false,
      averageRating: 4.2,
      completedBookings: 6,
      profileViews: 80
    },
    {
      userId: 'mock-user-9',
      displayName: 'Tyler Brooks',
      totalXP: 1050,
      weeklyXP: 65,
      tier: 'new',
      isVerified: false,
      averageRating: 4.1,
      completedBookings: 5,
      profileViews: 60
    },
    {
      userId: 'mock-user-10',
      displayName: 'Ava Taylor',
      totalXP: 900,
      weeklyXP: 55,
      tier: 'new',
      isVerified: false,
      averageRating: 4.0,
      completedBookings: 4,
      profileViews: 45
    }
  ];

  try {
    // Create batches (Firestore batch limit is 500 operations)
    const batch = writeBatch(db);
    
    for (const userData of mockUsers) {
      // Calculate ranking score (simplified version)
      const xpScore = Math.log(userData.totalXP + 1) * 15;
      const verificationScore = userData.isVerified ? 25 : 0;
      const performanceScore = (userData.averageRating - 3.0) * 25;
      const rankingScore = xpScore + verificationScore + performanceScore;

      // Create user progress document
      const userProgressRef = doc(db, 'userProgress', userData.userId);
      batch.set(userProgressRef, {
        userId: userData.userId,
        totalXP: userData.totalXP,
        weeklyXP: userData.weeklyXP,
        dailyXP: Math.floor(userData.weeklyXP / 7),
        streak: Math.floor(Math.random() * 10) + 1,
        tier: userData.tier,
        lastActivityAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Create user ranking document
      const userRankingRef = doc(db, 'userRankings', userData.userId);
      batch.set(userRankingRef, {
        userId: userData.userId,
        displayName: userData.displayName,
        profileImage: null,
        rankingScore: Math.round(rankingScore * 100) / 100,
        tier: userData.tier,
        isVerified: userData.isVerified,
        totalXP: userData.totalXP,
        weeklyXP: userData.weeklyXP,
        lastUpdated: Timestamp.now()
      });

      // Create basic user document
      const userRef = doc(db, 'users', userData.userId);
      batch.set(userRef, {
        displayName: userData.displayName,
        tier: userData.tier,
        totalXP: userData.totalXP,
        weeklyXP: userData.weeklyXP,
        analytics: {
          profileViews: userData.profileViews,
          searchAppearances: Math.floor(userData.profileViews * 0.3),
          conversionRate: Math.random() * 0.3 + 0.1 // 10-40%
        }
      }, { merge: true });
    }

    // Commit the batch
    await batch.commit();
    console.log('Successfully seeded ranking data for', mockUsers.length, 'users');
    
    // Log the data for verification
    mockUsers.forEach((user, index) => {
      console.log(`#${index + 1}: ${user.displayName} - ${user.totalXP} XP (${user.tier})`);
    });
    
  } catch (error) {
    console.error('Error seeding ranking data:', error);
    throw error;
  }
}

/**
 * Clean up mock ranking data
 */
export async function cleanupRankingData(): Promise<void> {
  console.log('Cleaning up mock ranking data...');
  
  const mockUserIds = [
    'mock-user-1', 'mock-user-2', 'mock-user-3', 'mock-user-4', 'mock-user-5',
    'mock-user-6', 'mock-user-7', 'mock-user-8', 'mock-user-9', 'mock-user-10'
  ];

  try {
    const batch = writeBatch(db);
    
    for (const userId of mockUserIds) {
      // Delete user progress
      const userProgressRef = doc(db, 'userProgress', userId);
      batch.delete(userProgressRef);
      
      // Delete user ranking
      const userRankingRef = doc(db, 'userRankings', userId);
      batch.delete(userRankingRef);
      
      // Delete user document
      const userRef = doc(db, 'users', userId);
      batch.delete(userRef);
    }

    await batch.commit();
    console.log('Successfully cleaned up mock ranking data');
    
  } catch (error) {
    console.error('Error cleaning up ranking data:', error);
    throw error;
  }
}

/**
 * Browser-callable function to seed data
 */
export function seedTestData() {
  if (typeof window !== 'undefined') {
    seedRankingData()
      .then(() => alert('Mock ranking data seeded successfully!'))
      .catch(error => alert('Error seeding data: ' + error.message));
  }
}

/**
 * Browser-callable function to cleanup data
 */
export function cleanupTestData() {
  if (typeof window !== 'undefined') {
    cleanupRankingData()
      .then(() => alert('Mock ranking data cleaned up successfully!'))
      .catch(error => alert('Error cleaning up data: ' + error.message));
  }
}
