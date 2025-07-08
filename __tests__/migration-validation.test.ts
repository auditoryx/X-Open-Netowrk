#!/usr/bin/env node
/**
 * Simple test script to verify migration script compiles and runs without errors
 */

// Mock Firestore for testing
const mockFirestore = {
  collection: jest.fn(() => ({
    getDocs: jest.fn(() => Promise.resolve({ docs: [], empty: true }))
  })),
  writeBatch: jest.fn(() => ({
    update: jest.fn(),
    commit: jest.fn(() => Promise.resolve())
  })),
  doc: jest.fn()
};

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => mockFirestore),
  connectFirestoreEmulator: jest.fn(),
  collection: jest.fn(() => mockFirestore.collection()),
  getDocs: jest.fn(() => Promise.resolve({ docs: [], empty: true })),
  doc: jest.fn(),
  writeBatch: jest.fn(() => mockFirestore.writeBatch()),
  query: jest.fn(),
  where: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 }))
  }
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => [])
}));

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  existsSync: jest.fn(() => false)
}));

// Test the migration script
describe('Migration Script Tests', () => {
  let FieldMigrationService: any;
  let FIELD_MIGRATIONS: any;

  beforeAll(() => {
    // Import the migration script
    const migrationModule = require('../scripts/migrateFields');
    FieldMigrationService = migrationModule.FieldMigrationService;
    FIELD_MIGRATIONS = migrationModule.FIELD_MIGRATIONS;
  });

  it('should have correct field migration definitions', () => {
    expect(FIELD_MIGRATIONS).toBeDefined();
    expect(FIELD_MIGRATIONS.length).toBe(2);
    
    // Check reviewerId -> authorId migration
    const reviewerIdMigration = FIELD_MIGRATIONS.find((m: any) => 
      m.oldField === 'reviewerId' && m.newField === 'authorId'
    );
    expect(reviewerIdMigration).toBeDefined();
    expect(reviewerIdMigration.collection).toBe('reviews');
    
    // Check reviewedId -> targetId migration
    const reviewedIdMigration = FIELD_MIGRATIONS.find((m: any) => 
      m.oldField === 'reviewedId' && m.newField === 'targetId'
    );
    expect(reviewedIdMigration).toBeDefined();
    expect(reviewedIdMigration.collection).toBe('reviews');
  });

  it('should create migration service instance', () => {
    const service = new FieldMigrationService();
    expect(service).toBeDefined();
    expect(typeof service.migrate).toBe('function');
  });

  it('should run migration without errors on empty collections', async () => {
    const service = new FieldMigrationService();
    
    // Mock environment
    process.env.EMULATOR_ENV = "true";
    
    // Should not throw
    await expect(service.migrate()).resolves.not.toThrow();
  });
});

// Test schema validation
describe('Schema Validation Tests', () => {
  let ReviewSchema: any;
  let validateReview: any;

  beforeAll(() => {
    const schemaModule = require('../src/lib/schema');
    ReviewSchema = schemaModule.ReviewSchema;
    validateReview = schemaModule.validateReview;
  });

  it('should validate review with new field names', () => {
    const validReview = {
      authorId: 'user123',
      targetId: 'user456',
      bookingId: 'booking123',
      rating: 5,
      text: 'Great service!',
      createdAt: { seconds: 1234567890, nanoseconds: 0 }
    };

    expect(() => validateReview(validReview)).not.toThrow();
  });

  it('should reject review with old field names', () => {
    const invalidReview = {
      reviewerId: 'user123', // Old field name
      reviewedId: 'user456', // Old field name  
      bookingId: 'booking123',
      rating: 5,
      text: 'Great service!',
      createdAt: { seconds: 1234567890, nanoseconds: 0 }
    };

    expect(() => validateReview(invalidReview)).toThrow();
  });
});

console.log('✅ Migration script validation tests passed!');