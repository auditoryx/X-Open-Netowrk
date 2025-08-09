/**
 * Staging Seed Script for AX Beta Testing
 * Creates sample data to test credibility scoring and explore API
 */

import { getFirestore, collection, addDoc, setDoc, doc, Timestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Firebase config (use staging/test environment)
const firebaseConfig = {
  // Add your staging Firebase config here
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample creator roles
const CREATOR_ROLES = ['artist', 'producer', 'engineer', 'videographer', 'studio'];

// Sample badges
const BADGE_DEFINITIONS = [
  {
    id: 'rising-talent',
    name: 'Rising Talent',
    description: 'Showing strong growth in bookings',
    scoreImpact: 25,
    type: 'dynamic',
    category: 'performance'
  },
  {
    id: 'trending-now',
    name: 'Trending Now',
    description: 'High activity in the last week',
    scoreImpact: 30,
    type: 'dynamic',
    category: 'performance'
  },
  {
    id: 'new-this-week',
    name: 'New This Week',
    description: 'Recently joined the platform',
    scoreImpact: 15,
    type: 'dynamic',
    category: 'milestone'
  },
  {
    id: 'verified-pro',
    name: 'Verified Professional',
    description: 'Identity and credentials verified',
    scoreImpact: 40,
    type: 'achievement',
    category: 'verification'
  },
  {
    id: 'five-star-pro',
    name: 'Five Star Professional',
    description: 'Maintains excellent ratings',
    scoreImpact: 35,
    type: 'performance',
    category: 'quality'
  }
];

// Generate sample users with varying credibility scores
function generateSampleUsers() {
  const users = [];
  
  // High credibility signature users (top tier)
  for (let i = 0; i < 5; i++) {
    users.push({
      uid: `signature-${i}`,
      name: `Signature Creator ${i + 1}`,
      bio: `Top-tier professional with extensive experience and verified credentials.`,
      tier: 'signature',
      roles: [CREATOR_ROLES[i % CREATOR_ROLES.length], 'creator'],
      status: 'approved',
      credibilityScore: 1200 + Math.random() * 300, // 1200-1500
      badgeIds: ['verified-pro', 'five-star-pro', i % 2 === 0 ? 'trending-now' : 'rising-talent'],
      stats: {
        completedBookings: 50 + Math.floor(Math.random() * 100),
        positiveReviewCount: 30 + Math.floor(Math.random() * 50),
        responseRate: 95 + Math.random() * 5,
        avgResponseTimeHours: 0.5 + Math.random() * 2,
        distinctClients90d: 15 + Math.floor(Math.random() * 15),
        lastCompletedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      },
      counts: {
        axVerifiedCredits: 25 + Math.floor(Math.random() * 25),
        clientConfirmedCredits: 10 + Math.floor(Math.random() * 15)
      },
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      services: ['Mixing', 'Mastering', 'Production'],
      media: Array.from({length: 5}, (_, i) => `https://example.com/media${i}.mp3`),
      genres: ['Hip Hop', 'R&B', 'Pop']
    });
  }
  
  // Medium credibility verified users (mid tier)
  for (let i = 0; i < 10; i++) {
    users.push({
      uid: `verified-${i}`,
      name: `Verified Creator ${i + 1}`,
      bio: `Professional creator with verified credentials and solid track record.`,
      tier: 'verified',
      roles: [CREATOR_ROLES[i % CREATOR_ROLES.length], 'creator'],
      status: 'approved',
      credibilityScore: 600 + Math.random() * 200, // 600-800
      badgeIds: [
        'verified-pro',
        ...(i % 3 === 0 ? ['rising-talent'] : []),
        ...(i % 4 === 0 ? ['trending-now'] : [])
      ],
      stats: {
        completedBookings: 15 + Math.floor(Math.random() * 35),
        positiveReviewCount: 10 + Math.floor(Math.random() * 25),
        responseRate: 85 + Math.random() * 10,
        avgResponseTimeHours: 1 + Math.random() * 4,
        distinctClients90d: 8 + Math.floor(Math.random() * 12),
        lastCompletedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      },
      counts: {
        axVerifiedCredits: 8 + Math.floor(Math.random() * 15),
        clientConfirmedCredits: 5 + Math.floor(Math.random() * 10)
      },
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      services: ['Recording', 'Mixing', 'Songwriting'],
      media: Array.from({length: 3}, (_, i) => `https://example.com/media${i}.mp3`),
      genres: ['Pop', 'Rock', 'Electronic']
    });
  }
  
  // Lower credibility standard users (entry tier)
  for (let i = 0; i < 15; i++) {
    const isNewThisWeek = i < 3;
    users.push({
      uid: `standard-${i}`,
      name: `Standard Creator ${i + 1}`,
      bio: `${isNewThisWeek ? 'New' : 'Aspiring'} creator building their reputation on the platform.`,
      tier: 'standard',
      roles: [CREATOR_ROLES[i % CREATOR_ROLES.length], 'creator'],
      status: 'approved',
      credibilityScore: 100 + Math.random() * 150, // 100-250
      badgeIds: [
        ...(isNewThisWeek ? ['new-this-week'] : []),
        ...(i % 5 === 0 ? ['rising-talent'] : [])
      ],
      stats: {
        completedBookings: Math.floor(Math.random() * 10),
        positiveReviewCount: Math.floor(Math.random() * 8),
        responseRate: 75 + Math.random() * 15,
        avgResponseTimeHours: 2 + Math.random() * 8,
        distinctClients90d: Math.floor(Math.random() * 5),
        lastCompletedAt: isNewThisWeek ? 
          new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) :
          new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
      },
      counts: {
        axVerifiedCredits: Math.floor(Math.random() * 5),
        clientConfirmedCredits: Math.floor(Math.random() * 3)
      },
      createdAt: isNewThisWeek ? 
        new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) :
        new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      services: ['Recording', 'Basic Mixing'],
      media: Array.from({length: 1 + Math.floor(Math.random() * 2)}, (_, i) => `https://example.com/media${i}.mp3`),
      genres: ['Hip Hop', 'Pop']
    });
  }
  
  return users;
}

async function seedDatabase() {
  console.log('🌱 Starting AX Beta seed process...');
  
  try {
    // 1. Create badge definitions
    console.log('Creating badge definitions...');
    for (const badge of BADGE_DEFINITIONS) {
      await setDoc(doc(db, 'badgeDefinitions', badge.id), {
        ...badge,
        isActive: true,
        createdAt: Timestamp.now()
      });
    }
    
    // 2. Create sample users
    console.log('Creating sample users...');
    const users = generateSampleUsers();
    for (const user of users) {
      await setDoc(doc(db, 'users', user.uid), {
        ...user,
        createdAt: Timestamp.fromDate(user.createdAt),
        stats: {
          ...user.stats,
          lastCompletedAt: user.stats.lastCompletedAt ? Timestamp.fromDate(user.stats.lastCompletedAt) : null
        }
      });
    }
    
    // 3. Create feature flag configuration
    console.log('Setting up feature flags...');
    await setDoc(doc(db, 'config', 'exposure'), {
      EXPOSE_SCORE_V1: true,
      BYO_LINKS: true,
      FIRST_SCREEN_MIX: true,
      LANE_NUDGES: true,
      CASE_STUDIES: false,
      POSITIVE_REVIEWS_ONLY: false,
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Seed process completed successfully!');
    console.log(`Created ${BADGE_DEFINITIONS.length} badge definitions`);
    console.log(`Created ${users.length} sample users:`);
    console.log(`  - 5 Signature tier (high credibility)`);
    console.log(`  - 10 Verified tier (medium credibility)`);
    console.log(`  - 15 Standard tier (entry level)`);
    console.log(`Feature flags enabled for testing`);
    
  } catch (error) {
    console.error('❌ Error during seed process:', error);
    process.exit(1);
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('🎉 Ready for AX Beta testing!');
    console.log('Visit /explore-beta to see the results');
    process.exit(0);
  });
}

export { seedDatabase, generateSampleUsers };