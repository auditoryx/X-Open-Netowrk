/**
 * Firestore Security Rules Tests for Offers System
 * Tests the updated rules for offers, userBadges, and reviews
 */

const { 
  assertSucceeds, 
  assertFails, 
  initializeTestEnvironment,
  RulesTestEnvironment 
} = require('@firebase/rules-unit-testing');

describe('Firestore Rules - Offers System', () => {
  let testEnv;
  let authDb;
  let unauthDb;
  let adminDb;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-offers-rules',
      firestore: {
        rules: require('fs').readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    
    // Create authenticated user context
    authDb = testEnv.authenticatedContext('user123', {
      admin: false,
      system: false
    }).firestore();
    
    // Create unauthenticated context
    unauthDb = testEnv.unauthenticatedContext().firestore();
    
    // Create admin context
    adminDb = testEnv.authenticatedContext('admin123', {
      admin: true,
      system: false
    }).firestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe('Offers Collection Rules', () => {
    test('allows anyone to read offers', async () => {
      const offer = {
        userId: 'user123',
        role: 'producer',
        title: 'Professional Beat Production',
        description: 'High-quality beats for your next project',
        price: 150,
        currency: 'USD',
        turnaroundDays: 7,
        revisions: 3,
        deliverables: ['Mixed track', 'Stems'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await adminDb.collection('offers').doc('offer123').set(offer);
      
      // Authenticated user can read
      await assertSucceeds(authDb.collection('offers').doc('offer123').get());
      
      // Unauthenticated user can read
      await assertSucceeds(unauthDb.collection('offers').doc('offer123').get());
    });

    test('allows offer creation by authenticated users with valid data', async () => {
      const validOffer = {
        userId: 'user123',
        role: 'producer',
        title: 'Professional Beat Production',
        description: 'High-quality beats for your next project',
        price: 150,
        currency: 'USD',
        turnaroundDays: 7,
        revisions: 3,
        deliverables: ['Mixed track', 'Stems'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Owner can create their own offer
      await assertSucceeds(
        authDb.collection('offers').doc('offer123').set(validOffer)
      );
    });

    test('rejects offer creation with invalid data', async () => {
      // Missing required fields
      const invalidOffer = {
        userId: 'user123',
        role: 'producer',
        title: 'Test', // Too short
        price: -100, // Negative price
        currency: 'INVALID'
      };

      await assertFails(
        authDb.collection('offers').doc('offer123').set(invalidOffer)
      );
    });

    test('prevents users from creating offers for other users', async () => {
      const offer = {
        userId: 'otheruser',
        role: 'producer',
        title: 'Professional Beat Production',
        description: 'High-quality beats for your next project',
        price: 150,
        currency: 'USD',
        turnaroundDays: 7,
        revisions: 3,
        deliverables: ['Mixed track', 'Stems'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await assertFails(
        authDb.collection('offers').doc('offer123').set(offer)
      );
    });

    test('allows offer owner to update non-protected fields', async () => {
      const offer = {
        userId: 'user123',
        role: 'producer',
        title: 'Professional Beat Production',
        description: 'High-quality beats for your next project',
        price: 150,
        currency: 'USD',
        turnaroundDays: 7,
        revisions: 3,
        deliverables: ['Mixed track', 'Stems'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await adminDb.collection('offers').doc('offer123').set(offer);

      // Owner can update title and price
      await assertSucceeds(
        authDb.collection('offers').doc('offer123').update({
          title: 'Updated Beat Production',
          price: 200,
          updatedAt: new Date()
        })
      );
    });

    test('prevents updating protected fields by non-admin', async () => {
      const offer = {
        userId: 'user123',
        role: 'producer',
        title: 'Professional Beat Production',
        description: 'High-quality beats for your next project',
        price: 150,
        currency: 'USD',
        turnaroundDays: 7,
        revisions: 3,
        deliverables: ['Mixed track', 'Stems'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 100,
        bookings: 5
      };

      await adminDb.collection('offers').doc('offer123').set(offer);

      // Cannot update protected analytics fields
      await assertFails(
        authDb.collection('offers').doc('offer123').update({
          views: 200,
          bookings: 10
        })
      );
    });
  });

  describe('UserBadges Collection Rules', () => {
    test('allows users to read their own badges', async () => {
      const badge = {
        userId: 'user123',
        badgeId: 'first-booking',
        awardedAt: new Date(),
        awardedBy: 'system'
      };

      await adminDb.collection('userBadges').doc('badge123').set(badge);

      await assertSucceeds(
        authDb.collection('userBadges').doc('badge123').get()
      );
    });

    test('prevents users from reading other users badges', async () => {
      const badge = {
        userId: 'otheruser',
        badgeId: 'first-booking',
        awardedAt: new Date(),
        awardedBy: 'system'
      };

      await adminDb.collection('userBadges').doc('badge123').set(badge);

      await assertFails(
        authDb.collection('userBadges').doc('badge123').get()
      );
    });

    test('allows admin and system to create badges', async () => {
      const badge = {
        userId: 'user123',
        badgeId: 'first-booking',
        awardedAt: new Date(),
        awardedBy: 'admin'
      };

      // Admin can create badges
      await assertSucceeds(
        adminDb.collection('userBadges').doc('badge123').set(badge)
      );
    });

    test('allows system context to create badges with expiration', async () => {
      const systemDb = testEnv.authenticatedContext('system', {
        admin: false,
        system: true
      }).firestore();

      const badge = {
        userId: 'user123',
        badgeId: 'on-time-streak',
        awardedAt: new Date(),
        awardedBy: 'system',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      };

      await assertSucceeds(
        systemDb.collection('userBadges').doc('badge123').set(badge)
      );
    });

    test('prevents regular users from creating badges', async () => {
      const badge = {
        userId: 'user123',
        badgeId: 'first-booking',
        awardedAt: new Date(),
        awardedBy: 'user'
      };

      await assertFails(
        authDb.collection('userBadges').doc('badge123').set(badge)
      );
    });

    test('prevents badge modification after creation', async () => {
      const badge = {
        userId: 'user123',
        badgeId: 'first-booking',
        awardedAt: new Date(),
        awardedBy: 'system'
      };

      await adminDb.collection('userBadges').doc('badge123').set(badge);

      // Cannot update badges (immutable)
      await assertFails(
        adminDb.collection('userBadges').doc('badge123').update({
          badgeId: 'different-badge'
        })
      );
    });
  });

  describe('Reviews Collection Rules', () => {
    test('allows anyone to read reviews', async () => {
      const review = {
        authorId: 'user123',
        targetId: 'provider456',
        bookingId: 'booking789',
        text: 'Great service, highly recommended!',
        createdAt: new Date(),
        visible: true,
        status: 'approved',
        isEditable: false
      };

      await adminDb.collection('reviews').doc('review123').set(review);

      await assertSucceeds(
        authDb.collection('reviews').doc('review123').get()
      );
    });

    test('prevents review creation with rating field (text-only)', async () => {
      const reviewWithRating = {
        authorId: 'user123',
        targetId: 'provider456',
        bookingId: 'booking789',
        text: 'Great service!',
        rating: 5, // This should be rejected
        createdAt: new Date(),
        visible: true,
        status: 'pending',
        isEditable: false
      };

      await assertFails(
        authDb.collection('reviews').doc('review123').set(reviewWithRating)
      );
    });

    test('prevents review creation with media attachments', async () => {
      const reviewWithMedia = {
        authorId: 'user123',
        targetId: 'provider456',
        bookingId: 'booking789',
        text: 'Great service!',
        media: ['image1.jpg', 'video1.mp4'], // This should be rejected
        createdAt: new Date(),
        visible: true,
        status: 'pending',
        isEditable: false
      };

      await assertFails(
        authDb.collection('reviews').doc('review123').set(reviewWithMedia)
      );
    });

    test('prevents review updates (immutable)', async () => {
      const review = {
        authorId: 'user123',
        targetId: 'provider456',
        bookingId: 'booking789',
        text: 'Great service!',
        createdAt: new Date(),
        visible: true,
        status: 'approved',
        isEditable: false
      };

      await adminDb.collection('reviews').doc('review123').set(review);

      // Cannot update reviews
      await assertFails(
        authDb.collection('reviews').doc('review123').update({
          text: 'Updated review text'
        })
      );
    });
  });

  describe('User Collection Protection', () => {
    test('prevents users from updating credibility scores', async () => {
      const user = {
        uid: 'user123',
        email: 'user@example.com',
        roles: ['producer'],
        tier: 'standard',
        verificationStatus: 'unverified',
        xp: 0,
        isActive: true,
        credibilityScore: 750,
        stats: { completedBookings: 5 },
        counts: { axVerifiedCredits: 2 },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await adminDb.collection('users').doc('user123').set(user);

      // User cannot update protected fields
      await assertFails(
        authDb.collection('users').doc('user123').update({
          credibilityScore: 1000,
          stats: { completedBookings: 100 },
          counts: { axVerifiedCredits: 50 }
        })
      );
    });

    test('allows users to update non-protected profile fields', async () => {
      const user = {
        uid: 'user123',
        email: 'user@example.com',
        roles: ['producer'],
        tier: 'standard',
        verificationStatus: 'unverified',
        xp: 0,
        isActive: true,
        displayName: 'Original Name',
        bio: 'Original bio',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await adminDb.collection('users').doc('user123').set(user);

      // User can update profile fields
      await assertSucceeds(
        authDb.collection('users').doc('user123').update({
          displayName: 'Updated Name',
          bio: 'Updated bio',
          updatedAt: new Date()
        })
      );
    });
  });
});

module.exports = {
  displayName: 'Firestore Rules Tests',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};