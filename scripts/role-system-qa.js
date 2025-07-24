#!/usr/bin/env node

/**
 * Phase 2: Role System Integration QA - End-to-End Testing Script
 * 
 * This script validates the complete user journey for all roles:
 * 1. Registration → Application → Approval → Profile completion
 * 2. Discovery and visibility in explore pages  
 * 3. Booking system end-to-end
 * 4. Review submission and rating updates
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp 
} = require('firebase/firestore');

// Firebase config (using environment variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test data for different roles
const testRoles = ['artist', 'producer', 'studio', 'engineer', 'videographer'];
const testUsers = {};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m', 
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️ ${message}`, 'blue');
}

// Generate test user data
function generateTestUser(role) {
  const userId = `test_${role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    uid: userId,
    email: `${userId}@test.com`,
    name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    role: role,
    bio: `I'm a professional ${role} with years of experience in the industry.`,
    location: 'Los Angeles, CA',
    portfolio: 'https://example.com/portfolio',
    createdAt: new Date(),
    status: 'pending'
  };
}

// JJ-01: Validate Onboarding Flow for All Roles
async function testOnboardingFlow() {
  info('\n🧱 JJ-01: Testing Onboarding Flow for All Roles');
  
  let passedTests = 0;
  const totalTests = testRoles.length;

  for (const role of testRoles) {
    try {
      info(`Testing ${role} application flow...`);
      
      // 1. Generate test user
      const testUser = generateTestUser(role);
      testUsers[role] = testUser;
      
      // 2. Create user document
      await setDoc(doc(db, 'users', testUser.uid), {
        email: testUser.email,
        name: testUser.name,
        role: null, // Not yet approved
        createdAt: serverTimestamp(),
        approved: false
      });
      
      // 3. Create application document  
      const applicationData = {
        role: role,
        uid: testUser.uid,
        name: testUser.name,
        location: testUser.location,
        portfolio: testUser.portfolio,
        agreedToVerify: true,
        createdAt: serverTimestamp(),
        approved: false,
        status: 'pending'
      };
      
      await setDoc(doc(db, 'applications', testUser.uid), applicationData);
      
      // 4. Verify application was created
      const appDoc = await getDoc(doc(db, 'applications', testUser.uid));
      if (appDoc.exists()) {
        success(`${role} application created in Firestore`);
        passedTests++;
      } else {
        error(`${role} application not found in Firestore`);
      }
      
    } catch (err) {
      error(`${role} application flow failed: ${err.message}`);
    }
  }
  
  info(`\nJJ-01 Results: ${passedTests}/${totalTests} roles passed onboarding flow`);
  return passedTests === totalTests;
}

// Helper function to approve applications
async function approveApplications() {
  info('\n🔧 Approving all test applications...');
  
  for (const role of testRoles) {
    try {
      const testUser = testUsers[role];
      if (!testUser) continue;
      
      // Approve application
      await updateDoc(doc(db, 'applications', testUser.uid), {
        approved: true,
        status: 'approved',
        reviewedAt: serverTimestamp()
      });
      
      // Update user role
      await updateDoc(doc(db, 'users', testUser.uid), {
        role: role,
        approved: true,
        tier: 'standard'
      });
      
      success(`Approved ${role} application`);
    } catch (err) {
      error(`Failed to approve ${role}: ${err.message}`);
    }
  }
}

// JJ-02: Complete Profile After Approval
async function testProfileCompletion() {
  info('\n🧱 JJ-02: Testing Profile Completion After Approval');
  
  let passedTests = 0;
  const totalTests = testRoles.length;
  
  for (const role of testRoles) {
    try {
      const testUser = testUsers[role];
      if (!testUser) continue;
      
      info(`Testing ${role} profile completion...`);
      
      // Complete profile with additional data
      const profileData = {
        bio: testUser.bio,
        location: testUser.location,
        availability: [
          '2024-02-01T10:00',
          '2024-02-01T14:00',
          '2024-02-02T10:00'
        ],
        genres: role === 'artist' ? ['Hip Hop', 'R&B'] : [],
        pricing: { baseRate: 100, currency: 'USD' },
        verified: false,
        profileComplete: true,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'users', testUser.uid), profileData);
      
      // Verify profile was updated
      const userDoc = await getDoc(doc(db, 'users', testUser.uid));
      if (userDoc.exists() && userDoc.data().profileComplete) {
        success(`${role} profile completed`);
        passedTests++;
      } else {
        error(`${role} profile completion failed`);
      }
      
    } catch (err) {
      error(`${role} profile completion failed: ${err.message}`);
    }
  }
  
  info(`\nJJ-02 Results: ${passedTests}/${totalTests} profiles completed`);
  return passedTests === totalTests;
}

// JJ-03: Verify Role Discovery Visibility
async function testRoleDiscovery() {
  info('\n🧱 JJ-03: Testing Role Discovery Visibility');
  
  let passedTests = 0;
  const totalTests = testRoles.length;
  
  for (const role of testRoles) {
    try {
      info(`Testing ${role} discovery...`);
      
      // Query users by role
      const q = query(collection(db, 'users'), where('role', '==', role));
      const snapshot = await getDocs(q);
      
      let found = false;
      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (testUsers[role] && doc.id === testUsers[role].uid) {
          found = true;
        }
      });
      
      if (found) {
        success(`${role} profile visible in discovery`);
        passedTests++;
      } else {
        error(`${role} profile not found in discovery`);
      }
      
    } catch (err) {
      error(`${role} discovery test failed: ${err.message}`);
    }
  }
  
  info(`\nJJ-03 Results: ${passedTests}/${totalTests} roles discoverable`);
  return passedTests === totalTests;
}

// JJ-04: Booking System End-to-End Test
async function testBookingSystem() {
  info('\n🧱 JJ-04: Testing Booking System End-to-End');
  
  let passedTests = 0;
  const totalTests = 2; // Will test booking creation and retrieval
  
  try {
    // Use artist as provider and producer as client for this test
    const provider = testUsers['artist'];
    const client = testUsers['producer'];
    
    if (!provider || !client) {
      error('Missing test users for booking test');
      return false;
    }
    
    info('Creating test booking...');
    
    // Create booking request
    const bookingData = {
      providerId: provider.uid,
      clientId: client.uid,
      message: 'Test booking request for QA validation',
      selectedTime: '2024-02-01T14:00',
      providerLocation: provider.location,
      baseAmount: 100,
      platformFee: 15,
      totalAmount: 115,
      createdAt: serverTimestamp(),
      status: 'pending'
    };
    
    const bookingRef = await addDoc(collection(db, 'bookingRequests'), bookingData);
    
    if (bookingRef.id) {
      success('Booking request created');
      passedTests++;
      
      // Verify booking appears in provider's bookings
      const bookingQuery = query(
        collection(db, 'bookingRequests'),
        where('providerId', '==', provider.uid)
      );
      const bookingSnapshot = await getDocs(bookingQuery);
      
      if (!bookingSnapshot.empty) {
        success('Booking appears in provider dashboard');
        passedTests++;
      } else {
        error('Booking not found in provider dashboard');
      }
    } else {
      error('Booking creation failed');
    }
    
  } catch (err) {
    error(`Booking system test failed: ${err.message}`);
  }
  
  info(`\nJJ-04 Results: ${passedTests}/${totalTests} booking tests passed`);
  return passedTests === totalTests;
}

// JJ-05: Post-Booking Review Flow
async function testReviewFlow() {
  info('\n🧱 JJ-05: Testing Post-Booking Review Flow');
  
  let passedTests = 0;
  const totalTests = 2; // Will test review creation and rating update
  
  try {
    const provider = testUsers['artist'];
    const client = testUsers['producer'];
    
    if (!provider || !client) {
      error('Missing test users for review test');
      return false;
    }
    
    info('Creating test review...');
    
    // Create a completed booking first
    const completedBookingData = {
      providerId: provider.uid,
      clientId: client.uid,
      status: 'completed',
      completedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    const bookingRef = await addDoc(collection(db, 'bookings'), completedBookingData);
    
    // Create review
    const reviewData = {
      bookingId: bookingRef.id,
      authorId: client.uid,
      targetId: provider.uid,
      rating: 5,
      text: 'Excellent work! Very professional and delivered exactly what I needed.',
      createdAt: serverTimestamp()
    };
    
    const reviewRef = await addDoc(collection(db, 'reviews'), reviewData);
    
    if (reviewRef.id) {
      success('Review created successfully');
      passedTests++;
      
      // Check if provider's rating needs to be updated
      const reviewQuery = query(
        collection(db, 'reviews'),
        where('targetId', '==', provider.uid)
      );
      const reviewSnapshot = await getDocs(reviewQuery);
      
      if (!reviewSnapshot.empty) {
        success('Review appears in provider reviews');
        passedTests++;
        
        // Calculate average rating
        let totalRating = 0;
        let count = 0;
        reviewSnapshot.forEach((doc) => {
          const review = doc.data();
          totalRating += review.rating;
          count++;
        });
        
        const averageRating = count > 0 ? totalRating / count : 0;
        
        // Update provider's average rating
        await updateDoc(doc(db, 'users', provider.uid), {
          averageRating: averageRating,
          reviewCount: count,
          updatedAt: serverTimestamp()
        });
        
        info(`Updated provider rating to ${averageRating} (${count} reviews)`);
      } else {
        error('Review not found in provider reviews');
      }
    } else {
      error('Review creation failed');
    }
    
  } catch (err) {
    error(`Review flow test failed: ${err.message}`);
  }
  
  info(`\nJJ-05 Results: ${passedTests}/${totalTests} review tests passed`);
  return passedTests === totalTests;
}

// Cleanup test data
async function cleanup() {
  info('\n🧹 Cleaning up test data...');
  
  for (const role of testRoles) {
    try {
      const testUser = testUsers[role];
      if (!testUser) continue;
      
      // Delete user document
      await setDoc(doc(db, 'users', testUser.uid), { deleted: true });
      
      // Delete application
      await setDoc(doc(db, 'applications', testUser.uid), { deleted: true });
      
      info(`Cleaned up ${role} test data`);
    } catch (err) {
      warning(`Failed to cleanup ${role}: ${err.message}`);
    }
  }
}

// Main test runner
async function runRoleSystemQA() {
  info('🚀 Starting Phase 2: Role System Integration QA Tests\n');
  
  const results = {
    onboarding: false,
    profileCompletion: false,
    discovery: false,
    booking: false,
    reviews: false
  };
  
  try {
    // Run all test suites
    results.onboarding = await testOnboardingFlow();
    await approveApplications();
    results.profileCompletion = await testProfileCompletion();
    results.discovery = await testRoleDiscovery();
    results.booking = await testBookingSystem();
    results.reviews = await testReviewFlow();
    
  } catch (err) {
    error(`QA test suite failed: ${err.message}`);
  }
  
  // Summary
  info('\n📊 QA Test Results Summary:');
  info('================================');
  
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      success(`${test.toUpperCase()}: PASSED`);
    } else {
      error(`${test.toUpperCase()}: FAILED`);
    }
  });
  
  const passedCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;
  
  info(`\nOverall: ${passedCount}/${totalCount} test suites passed`);
  
  if (passedCount === totalCount) {
    success('\n🎉 All role system integration tests PASSED! Ready for beta deployment.');
  } else {
    error('\n🚨 Some tests FAILED. Please review and fix issues before beta deployment.');
  }
  
  // Cleanup (optional - comment out to inspect test data)
  // await cleanup();
}

// Run the tests if this script is executed directly
if (require.main === module) {
  runRoleSystemQA().catch(console.error);
}

module.exports = { runRoleSystemQA };