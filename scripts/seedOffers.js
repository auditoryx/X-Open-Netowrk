#!/usr/bin/env node

/**
 * Seed script for AX Beta offers system
 * Creates demo offers for testing the new role-based system
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
const offersConfig = require('../config/offers.json');

// Initialize Firebase (you'll need to set your config)
const firebaseConfig = {
  // Add your Firebase config here or load from environment
  projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Demo user IDs (replace with actual user IDs from your system)
const DEMO_USERS = {
  producer1: 'demo-producer-001',
  producer2: 'demo-producer-002',
  engineer1: 'demo-engineer-001',
  engineer2: 'demo-engineer-002',
  videographer1: 'demo-videographer-001',
  studio1: 'demo-studio-001',
  artist1: 'demo-artist-001',
  artist2: 'demo-artist-002'
};

async function seedOffers() {
  console.log('🌱 Starting offers seed process...');
  
  const now = Timestamp.now();
  let createdOffers = 0;
  
  try {
    // Create offers for each role based on templates
    for (const [role, templates] of Object.entries(offersConfig.templates)) {
      console.log(`\n📦 Creating ${role} offers...`);
      
      // Get demo users for this role
      const roleUsers = Object.entries(DEMO_USERS)
        .filter(([key]) => key.includes(role))
        .map(([, userId]) => userId);
      
      if (roleUsers.length === 0) {
        console.log(`⚠️  No demo users found for role: ${role}`);
        continue;
      }
      
      // Create offers for each template and user combination
      for (const template of templates) {
        for (const userId of roleUsers) {
          const offerData = {
            userId,
            role,
            title: template.name,
            description: template.description,
            price: template.defaultPrice,
            currency: template.currency,
            turnaroundDays: template.defaultTurnaround,
            revisions: template.defaultRevisions,
            deliverables: template.defaultDeliverables,
            addons: template.defaultAddons || [],
            usagePolicy: template.usagePolicyTemplate,
            media: [], // Empty for demo
            active: Math.random() > 0.3, // 70% chance of being active
            status: Math.random() > 0.3 ? 'active' : 'draft',
            createdAt: now,
            updatedAt: now,
            views: Math.floor(Math.random() * 100),
            bookings: Math.floor(Math.random() * 10),
            completedBookings: Math.floor(Math.random() * 8),
            templateId: template.id,
            isCustom: false,
            // Add role-specific fields
            ...template.roleSpecific
          };
          
          const docRef = await addDoc(collection(db, 'offers'), offerData);
          createdOffers++;
          
          console.log(`✅ Created ${role} offer: ${template.name} for user ${userId.slice(-3)}`);
        }
      }
    }
    
    console.log(`\n🎉 Seed complete! Created ${createdOffers} offers.`);
    
    // Create some demo bookings
    await seedDemoBookings();
    
  } catch (error) {
    console.error('❌ Error seeding offers:', error);
    process.exit(1);
  }
}

async function seedDemoBookings() {
  console.log('\n📋 Creating demo bookings...');
  
  const now = Timestamp.now();
  const oneWeekAgo = new Timestamp(now.seconds - 7 * 24 * 60 * 60, 0);
  const oneMonthAgo = new Timestamp(now.seconds - 30 * 24 * 60 * 60, 0);
  
  const demoBookings = [
    {
      clientId: 'demo-client-001',
      providerId: DEMO_USERS.producer1,
      serviceId: 'demo-service-001',
      serviceName: 'Beat Store Basics',
      status: 'completed',
      title: 'Custom Hip Hop Beat',
      notes: 'Need something with heavy 808s',
      createdAt: oneMonthAgo,
      completedAt: oneWeekAgo,
      isPaid: true,
      creditAwarded: true,
      creditSource: 'ax-verified',
      offerId: 'demo-offer-001',
      offerSnapshot: {
        title: 'Beat Store Basics',
        price: 50,
        currency: 'USD',
        turnaroundDays: 1,
        revisions: 2,
        deliverables: ['Mixed instrumental (MP3 320kbps)', 'WAV stems (8-16 tracks)', 'Beat license agreement'],
        totalPrice: 50
      },
      contract: {
        terms: 'Standard beat license agreement',
        agreedByClient: true,
        agreedByProvider: true
      }
    },
    {
      clientId: 'demo-client-002',
      providerId: DEMO_USERS.engineer1,
      serviceId: 'demo-service-002', 
      serviceName: 'Professional Mixing',
      status: 'completed',
      title: 'Mix My Track',
      notes: 'Looking for a polished radio-ready sound',
      createdAt: oneWeekAgo,
      completedAt: now,
      isPaid: true,
      creditAwarded: true,
      creditSource: 'ax-verified',
      offerId: 'demo-offer-002',
      offerSnapshot: {
        title: 'Professional Mixing',
        price: 150,
        currency: 'USD',
        turnaroundDays: 5,
        revisions: 3,
        deliverables: ['Mixed track (24-bit WAV)', 'MP3 320kbps master', 'Mix notes and processing summary'],
        totalPrice: 150
      },
      contract: {
        terms: 'Standard mixing service agreement',
        agreedByClient: true,
        agreedByProvider: true
      }
    }
  ];
  
  for (const booking of demoBookings) {
    await addDoc(collection(db, 'bookings'), booking);
    console.log(`✅ Created demo booking: ${booking.title}`);
  }
  
  // Create some demo reviews (text-only)
  await seedDemoReviews();
}

async function seedDemoReviews() {
  console.log('\n💬 Creating demo reviews...');
  
  const now = Timestamp.now();
  
  const demoReviews = [
    {
      authorId: 'demo-client-001',
      targetId: DEMO_USERS.producer1,
      bookingId: 'demo-booking-001',
      text: 'Amazing beat! Exactly what I was looking for. The 808s hit hard and the melody is catchy. Will definitely be working with this producer again.',
      type: 'testimonial',
      createdAt: now,
      status: 'approved',
      visible: true,
      isEditable: false,
      source: 'ax-beta'
    },
    {
      authorId: 'demo-client-002',
      targetId: DEMO_USERS.engineer1,
      bookingId: 'demo-booking-002',
      text: 'Professional mixing service that really brought my track to life. Great communication throughout the process and delivered exactly on time. Highly recommended!',
      type: 'testimonial',
      createdAt: now,
      status: 'approved',
      visible: true,
      isEditable: false,
      source: 'ax-beta'
    }
  ];
  
  for (const review of demoReviews) {
    await addDoc(collection(db, 'reviews'), review);
    console.log(`✅ Created demo review from client ${review.authorId.slice(-3)}`);
  }
}

// Usage instructions
function printUsageInstructions() {
  console.log(`
🚀 AX Beta Offers Seed Script

This script creates demo data for the new offers system including:
- Sample offers based on config templates for each role
- Demo bookings with offer references
- Text-only reviews for completed bookings

Before running:
1. Set your Firebase project ID in FIREBASE_PROJECT_ID env var
2. Update DEMO_USERS object with actual user IDs from your system
3. Make sure you have proper Firebase admin credentials

To run:
  node scripts/seedOffers.js

or from the npm script:
  npm run seed:offers
  `);
}

// Run the script
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printUsageInstructions();
    process.exit(0);
  }
  
  console.log('🚀 AX Beta Offers Seed Script\n');
  seedOffers()
    .then(() => {
      console.log('\n✨ All done! Check your Firestore console to see the seeded data.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seedOffers, seedDemoBookings, seedDemoReviews };