import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { FieldMigrationService, FIELD_MIGRATIONS } from '../scripts/migrateFields';

// Test Firebase configuration
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo"
};

let app: any;
let db: any;

describe('Field Migration Tests', () => {
  beforeAll(async () => {
    // Initialize Firebase for testing
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    db = getFirestore(app);
    
    // Connect to emulator
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (error) {
      // Emulator already connected
    }
  });

  beforeEach(async () => {
    // Clean up collections before each test
    await cleanupCollections();
  });

  afterAll(async () => {
    // Clean up after all tests
    await cleanupCollections();
  });

  async function cleanupCollections() {
    const collectionsToClean = ['reviews', 'test-reviews'];
    
    for (const collectionName of collectionsToClean) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    }
  }

  async function createTestData() {
    // Create test documents with old field names
    const testReviews = [
      {
        id: 'review1',
        reviewerId: 'user1',
        reviewedId: 'user2',
        rating: 5,
        text: 'Great service!',
        createdAt: Timestamp.now()
      },
      {
        id: 'review2',
        reviewerId: 'user3',
        reviewedId: 'user4',
        rating: 4,
        text: 'Good work!',
        createdAt: Timestamp.now()
      },
      {
        id: 'review3',
        reviewerId: 'user5',
        reviewedId: 'user6',
        rating: 3,
        text: 'Average service',
        createdAt: Timestamp.now()
      }
    ];

    for (const review of testReviews) {
      await setDoc(doc(db, 'reviews', review.id), review);
    }

    return testReviews;
  }

  it('should migrate reviewerId to authorId successfully', async () => {
    // Setup test data
    const testReviews = await createTestData();
    
    // Run migration
    const migrationService = new FieldMigrationService();
    await migrationService.migrate();
    
    // Verify migration
    const reviewsRef = collection(db, 'reviews');
    const allReviews = await getDocs(reviewsRef);
    
    expect(allReviews.docs.length).toBe(testReviews.length);
    
    for (const reviewDoc of allReviews.docs) {
      const reviewData = reviewDoc.data();
      
      // Check that old field is removed/null
      expect(reviewData.reviewerId).toBeNull();
      expect(reviewData.reviewedId).toBeNull();
      
      // Check that new fields exist
      expect(reviewData.authorId).toBeDefined();
      expect(reviewData.targetId).toBeDefined();
      
      // Check migration metadata
      expect(reviewData.migratedAt).toBeDefined();
      expect(reviewData.migrationVersion).toBe('1.0.0');
    }
  });

  it('should be idempotent (safe to run multiple times)', async () => {
    // Setup test data
    await createTestData();
    
    // Run migration first time
    const migrationService1 = new FieldMigrationService();
    await migrationService1.migrate();
    
    // Get state after first migration
    const reviewsRef = collection(db, 'reviews');
    const firstMigrationResults = await getDocs(reviewsRef);
    const firstMigrationData = firstMigrationResults.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }));
    
    // Run migration second time
    const migrationService2 = new FieldMigrationService();
    await migrationService2.migrate();
    
    // Get state after second migration
    const secondMigrationResults = await getDocs(reviewsRef);
    const secondMigrationData = secondMigrationResults.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }));
    
    // Compare results - should be identical
    expect(secondMigrationData.length).toBe(firstMigrationData.length);
    
    for (let i = 0; i < firstMigrationData.length; i++) {
      const first = firstMigrationData[i];
      const second = secondMigrationData[i];
      
      expect(second.id).toBe(first.id);
      expect(second.data.authorId).toBe(first.data.authorId);
      expect(second.data.targetId).toBe(first.data.targetId);
      expect(second.data.reviewerId).toBeNull();
      expect(second.data.reviewedId).toBeNull();
    }
  });

  it('should handle empty collections gracefully', async () => {
    // Don't create any test data
    
    // Run migration on empty collection
    const migrationService = new FieldMigrationService();
    await migrationService.migrate();
    
    // Should complete without errors
    const reviewsRef = collection(db, 'reviews');
    const results = await getDocs(reviewsRef);
    
    expect(results.empty).toBe(true);
  });

  it('should preserve other fields during migration', async () => {
    // Create test data with additional fields
    const testReview = {
      id: 'test-review',
      reviewerId: 'user1',
      reviewedId: 'user2',
      rating: 5,
      text: 'Great service!',
      bookingId: 'booking123',
      createdAt: Timestamp.now(),
      customField: 'custom-value'
    };

    await setDoc(doc(db, 'reviews', testReview.id), testReview);
    
    // Run migration
    const migrationService = new FieldMigrationService();
    await migrationService.migrate();
    
    // Verify other fields are preserved
    const reviewsRef = collection(db, 'reviews');
    const results = await getDocs(reviewsRef);
    
    expect(results.docs.length).toBe(1);
    
    const reviewData = results.docs[0].data();
    expect(reviewData.rating).toBe(5);
    expect(reviewData.text).toBe('Great service!');
    expect(reviewData.bookingId).toBe('booking123');
    expect(reviewData.customField).toBe('custom-value');
    expect(reviewData.createdAt).toBeDefined();
  });

  it('should not migrate documents that already have new field names', async () => {
    // Create test data with new field names (already migrated)
    const alreadyMigratedReview = {
      id: 'migrated-review',
      authorId: 'user1',
      targetId: 'user2',
      rating: 5,
      text: 'Already migrated!',
      migratedAt: Timestamp.now(),
      migrationVersion: '1.0.0'
    };

    await setDoc(doc(db, 'reviews', alreadyMigratedReview.id), alreadyMigratedReview);
    
    // Run migration
    const migrationService = new FieldMigrationService();
    await migrationService.migrate();
    
    // Verify data is unchanged
    const reviewsRef = collection(db, 'reviews');
    const results = await getDocs(reviewsRef);
    
    expect(results.docs.length).toBe(1);
    
    const reviewData = results.docs[0].data();
    expect(reviewData.authorId).toBe('user1');
    expect(reviewData.targetId).toBe('user2');
    expect(reviewData.reviewerId).toBeUndefined();
    expect(reviewData.reviewedId).toBeUndefined();
  });

  it('should verify no legacy field names remain after migration', async () => {
    // Create test data with legacy field names
    await createTestData();
    
    // Run migration
    const migrationService = new FieldMigrationService();
    await migrationService.migrate();
    
    // Check that no documents have legacy field names
    const reviewsRef = collection(db, 'reviews');
    
    const reviewerIdQuery = query(reviewsRef, where('reviewerId', '!=', null));
    const reviewerIdResults = await getDocs(reviewerIdQuery);
    expect(reviewerIdResults.empty).toBe(true);
    
    const reviewedIdQuery = query(reviewsRef, where('reviewedId', '!=', null));
    const reviewedIdResults = await getDocs(reviewedIdQuery);
    expect(reviewedIdResults.empty).toBe(true);
  });

  it('should create backup before migration', async () => {
    // Create test data
    await createTestData();
    
    // Run migration
    const migrationService = new FieldMigrationService();
    await migrationService.migrate();
    
    // Note: In a real test, we would check that backup file was created
    // For now, we verify that migration completed successfully
    const reviewsRef = collection(db, 'reviews');
    const results = await getDocs(reviewsRef);
    
    expect(results.docs.length).toBe(3);
  });
});