import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin
initializeApp({ credential: applicationDefault() });
const db = getFirestore();

interface FieldMigration {
  collection: string;
  oldField: string;
  newField: string;
  description: string;
}

// Define field migrations based on audit
const FIELD_MIGRATIONS: FieldMigration[] = [
  {
    collection: 'reviews',
    oldField: 'reviewerId',
    newField: 'reviewerUid',
    description: 'Migrate reviewerId to reviewerUid for consistency with Uid naming convention'
  },
  // Add more migrations as needed
];

interface MigrationResult {
  collection: string;
  totalDocs: number;
  migratedDocs: number;
  skippedDocs: number;
  errors: string[];
}

interface BackupDocument {
  id: string;
  data: any;
  collection: string;
  timestamp: string;
}

class FieldMigrationTool {
  private backupDir: string;
  private migrationDate: string;

  constructor() {
    this.migrationDate = new Date().toISOString().split('T')[0];
    this.backupDir = join(process.cwd(), 'backups', this.migrationDate);
    this.ensureBackupDir();
  }

  private ensureBackupDir(): void {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private async backupCollection(collectionName: string): Promise<void> {
    console.log(`📁 Backing up collection: ${collectionName}`);
    
    const snapshot = await db.collection(collectionName).get();
    const backupData: BackupDocument[] = [];

    snapshot.forEach((doc) => {
      backupData.push({
        id: doc.id,
        data: doc.data(),
        collection: collectionName,
        timestamp: new Date().toISOString()
      });
    });

    const backupFile = join(this.backupDir, `${collectionName}.json`);
    writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backed up ${backupData.length} documents from ${collectionName} to ${backupFile}`);
  }

  private async migrateField(migration: FieldMigration): Promise<MigrationResult> {
    console.log(`🔄 Starting migration: ${migration.description}`);
    
    const result: MigrationResult = {
      collection: migration.collection,
      totalDocs: 0,
      migratedDocs: 0,
      skippedDocs: 0,
      errors: []
    };

    try {
      // Backup collection first
      await this.backupCollection(migration.collection);

      // Get all documents in the collection
      const snapshot = await db.collection(migration.collection).get();
      result.totalDocs = snapshot.size;

      console.log(`📊 Processing ${result.totalDocs} documents in ${migration.collection}`);

      // Process each document
      for (const doc of snapshot.docs) {
        try {
          const data = doc.data();
          
          // Check if old field exists
          if (data.hasOwnProperty(migration.oldField)) {
            const updateData: any = {};
            
            // Copy old field value to new field
            updateData[migration.newField] = data[migration.oldField];
            
            // Update document with new field
            await doc.ref.update(updateData);
            
            // Delete old field
            await doc.ref.update({
              [migration.oldField]: db.FieldValue.delete()
            });
            
            result.migratedDocs++;
            console.log(`✅ Migrated ${doc.id}: ${migration.oldField} -> ${migration.newField}`);
          } else {
            result.skippedDocs++;
            console.log(`⏭️  Skipped ${doc.id}: ${migration.oldField} not found`);
          }
        } catch (error) {
          const errorMsg = `Error migrating document ${doc.id}: ${error}`;
          result.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      console.log(`🎉 Migration complete for ${migration.collection}:`);
      console.log(`   - Total documents: ${result.totalDocs}`);
      console.log(`   - Migrated: ${result.migratedDocs}`);
      console.log(`   - Skipped: ${result.skippedDocs}`);
      console.log(`   - Errors: ${result.errors.length}`);

    } catch (error) {
      const errorMsg = `Failed to migrate collection ${migration.collection}: ${error}`;
      result.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }

    return result;
  }

  async runMigrations(): Promise<void> {
    console.log(`🚀 Starting field migration process...`);
    console.log(`📅 Migration date: ${this.migrationDate}`);
    console.log(`📂 Backup directory: ${this.backupDir}`);

    const migrationResults: MigrationResult[] = [];

    for (const migration of FIELD_MIGRATIONS) {
      const result = await this.migrateField(migration);
      migrationResults.push(result);
      
      // Add delay between migrations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate summary report
    this.generateSummaryReport(migrationResults);
  }

  private generateSummaryReport(results: MigrationResult[]): void {
    console.log('\n📋 MIGRATION SUMMARY REPORT');
    console.log('=' .repeat(50));
    
    let totalMigrated = 0;
    let totalErrors = 0;
    let totalSkipped = 0;
    let totalProcessed = 0;

    for (const result of results) {
      console.log(`\n📚 Collection: ${result.collection}`);
      console.log(`   Total documents: ${result.totalDocs}`);
      console.log(`   Migrated: ${result.migratedDocs}`);
      console.log(`   Skipped: ${result.skippedDocs}`);
      console.log(`   Errors: ${result.errors.length}`);
      
      if (result.errors.length > 0) {
        console.log(`   Error details:`);
        result.errors.forEach(error => console.log(`     - ${error}`));
      }

      totalMigrated += result.migratedDocs;
      totalErrors += result.errors.length;
      totalSkipped += result.skippedDocs;
      totalProcessed += result.totalDocs;
    }

    console.log('\n🎯 OVERALL TOTALS:');
    console.log(`   Documents processed: ${totalProcessed}`);
    console.log(`   Documents migrated: ${totalMigrated}`);
    console.log(`   Documents skipped: ${totalSkipped}`);
    console.log(`   Errors encountered: ${totalErrors}`);

    // Save summary to file
    const summaryData = {
      migrationDate: this.migrationDate,
      backupDirectory: this.backupDir,
      migrationResults: results,
      totals: {
        processed: totalProcessed,
        migrated: totalMigrated,
        skipped: totalSkipped,
        errors: totalErrors
      }
    };

    const summaryFile = join(this.backupDir, 'migration-summary.json');
    writeFileSync(summaryFile, JSON.stringify(summaryData, null, 2));
    console.log(`📄 Summary saved to: ${summaryFile}`);

    // Exit with appropriate code
    if (totalErrors > 0) {
      console.log('\n❌ Migration completed with errors');
      process.exit(1);
    } else {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  const migrationTool = new FieldMigrationTool();
  migrationTool.runMigrations().catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
}

export { FieldMigrationTool, FIELD_MIGRATIONS };