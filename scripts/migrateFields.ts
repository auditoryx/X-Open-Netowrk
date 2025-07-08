#!/usr/bin/env ts-node

import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { 
  collection, 
  getDocs, 
  doc, 
  writeBatch, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Firebase configuration for emulator
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

// Connect to emulator if in emulator environment
if (process.env.FIRESTORE_EMULATOR_HOST || process.env.EMULATOR_ENV === "true") {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulator already connected
  }
}

interface FieldMigration {
  collection: string;
  oldField: string;
  newField: string;
  subcollection?: string;
}

// Define field migrations
const FIELD_MIGRATIONS: FieldMigration[] = [
  {
    collection: 'reviews',
    oldField: 'reviewerId',
    newField: 'authorId'
  },
  {
    collection: 'reviews',
    oldField: 'reviewedId', 
    newField: 'targetId'
  }
];

interface MigrationStats {
  totalCollections: number;
  totalDocuments: number;
  totalFieldsUpdated: number;
  errors: string[];
  backupPath: string;
}

class FieldMigrationService {
  private stats: MigrationStats = {
    totalCollections: 0,
    totalDocuments: 0,
    totalFieldsUpdated: 0,
    errors: [],
    backupPath: ''
  };

  /**
   * Create backup of affected collections
   */
  private async createBackup(): Promise<void> {
    const backupDir = join(process.cwd(), 'backups');
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(backupDir, `migration-backup-${timestamp}.json`);
    this.stats.backupPath = backupPath;

    const backup: Record<string, any[]> = {};

    // Get unique collections from migrations
    const collectionsToBackup = FIELD_MIGRATIONS.map(m => m.collection).filter((value, index, self) => self.indexOf(value) === index);

    for (const collectionName of collectionsToBackup) {
      console.log(`🔄 Backing up collection: ${collectionName}`);
      
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      backup[collectionName] = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));

      console.log(`✅ Backed up ${snapshot.docs.length} documents from ${collectionName}`);
    }

    writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`📦 Backup created at: ${backupPath}`);
  }

  /**
   * Migrate fields in a collection
   */
  private async migrateCollection(migration: FieldMigration): Promise<void> {
    console.log(`🔄 Migrating ${migration.collection}: ${migration.oldField} -> ${migration.newField}`);

    const collectionRef = collection(db, migration.collection);
    
    // Query for documents that have the old field
    const q = query(collectionRef, where(migration.oldField, '!=', null));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`✅ No documents found with field ${migration.oldField} in ${migration.collection}`);
      return;
    }

    // Process documents in batches
    const batchSize = 500;
    const docGroups: any[][] = [];
    
    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
      docGroups.push(snapshot.docs.slice(i, i + batchSize));
    }

    for (let i = 0; i < docGroups.length; i++) {
      const docGroup = docGroups[i];
      const batch = writeBatch(db);
      
      for (const docSnap of docGroup) {
        const docData = docSnap.data();
        
        // Skip if document already has the new field and not the old field
        if (docData[migration.newField] && !docData[migration.oldField]) {
          continue;
        }

        // Create update object
        const updateData: any = {};
        
        // Copy old field value to new field
        if (docData[migration.oldField] !== undefined) {
          updateData[migration.newField] = docData[migration.oldField];
          // Mark old field for deletion
          updateData[migration.oldField] = null;
        }

        // Add migration metadata
        updateData.migratedAt = Timestamp.now();
        updateData.migrationVersion = '1.0.0';

        batch.update(doc(db, migration.collection, docSnap.id), updateData);
        this.stats.totalFieldsUpdated++;
      }

      await batch.commit();
      console.log(`✅ Migrated batch ${i + 1}/${docGroups.length} (${docGroup.length} documents)`);
    }

    this.stats.totalDocuments += snapshot.docs.length;
    console.log(`✅ Completed migration for ${migration.collection}: ${snapshot.docs.length} documents updated`);
  }

  /**
   * Verify migration was successful
   */
  private async verifyMigration(): Promise<boolean> {
    console.log('🔍 Verifying migration...');
    
    let allMigrationsSuccessful = true;

    for (const migration of FIELD_MIGRATIONS) {
      const collectionRef = collection(db, migration.collection);
      
      // Check that no documents still have the old field
      const oldFieldQuery = query(collectionRef, where(migration.oldField, '!=', null));
      const oldFieldSnapshot = await getDocs(oldFieldQuery);
      
      if (!oldFieldSnapshot.empty) {
        console.error(`❌ Found ${oldFieldSnapshot.docs.length} documents still containing ${migration.oldField} in ${migration.collection}`);
        allMigrationsSuccessful = false;
      }

      // Check that documents have the new field
      const newFieldQuery = query(collectionRef, where(migration.newField, '!=', null));
      const newFieldSnapshot = await getDocs(newFieldQuery);
      
      console.log(`✅ ${migration.collection}: ${newFieldSnapshot.docs.length} documents have ${migration.newField}`);
    }

    return allMigrationsSuccessful;
  }

  /**
   * Run the complete migration process
   */
  async migrate(): Promise<void> {
    console.log('🚀 Starting Firestore field migration...');
    
    try {
      // Create backup
      await this.createBackup();
      
      // Run migrations
      this.stats.totalCollections = FIELD_MIGRATIONS.length;
      
      for (const migration of FIELD_MIGRATIONS) {
        await this.migrateCollection(migration);
      }
      
      // Verify migration
      const verificationPassed = await this.verifyMigration();
      
      if (!verificationPassed) {
        throw new Error('Migration verification failed');
      }
      
      // Print summary
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      this.stats.errors.push(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Print migration summary
   */
  private printSummary(): void {
    console.log('\n📊 Migration Summary:');
    console.log('=====================================');
    console.log(`Collections processed: ${this.stats.totalCollections}`);
    console.log(`Documents updated: ${this.stats.totalDocuments}`);
    console.log(`Fields migrated: ${this.stats.totalFieldsUpdated}`);
    console.log(`Backup location: ${this.stats.backupPath}`);
    console.log(`Errors: ${this.stats.errors.length}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\nErrors encountered:');
      this.stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('\n✅ Migration completed successfully!');
  }

  /**
   * Check if migration is idempotent (safe to run multiple times)
   */
  async checkIdempotency(): Promise<boolean> {
    console.log('🔄 Checking migration idempotency...');
    
    // Run migration twice and verify results are the same
    const initialStats = { ...this.stats };
    
    await this.migrate();
    const firstRunStats = { ...this.stats };
    
    // Reset stats for second run
    this.stats = {
      totalCollections: 0,
      totalDocuments: 0,
      totalFieldsUpdated: 0,
      errors: [],
      backupPath: ''
    };
    
    await this.migrate();
    const secondRunStats = { ...this.stats };
    
    // Compare results (second run should update 0 fields)
    const isIdempotent = secondRunStats.totalFieldsUpdated === 0;
    
    console.log(`First run updated ${firstRunStats.totalFieldsUpdated} fields`);
    console.log(`Second run updated ${secondRunStats.totalFieldsUpdated} fields`);
    console.log(`Migration is ${isIdempotent ? 'idempotent' : 'NOT idempotent'}`);
    
    return isIdempotent;
  }
}

// Main execution
async function main() {
  const migrationService = new FieldMigrationService();
  
  try {
    await migrationService.migrate();
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  main();
}

export { FieldMigrationService, FIELD_MIGRATIONS };