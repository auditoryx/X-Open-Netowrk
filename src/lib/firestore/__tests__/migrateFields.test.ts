import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';

// Test that the migration configuration is properly defined
describe('migrateFields Schema Test', () => {
  it('should have valid migration script', () => {
    const migrationScript = readFileSync(
      join(__dirname, '../../../../scripts/migrateFields.ts'), 
      'utf8'
    );
    
    expect(migrationScript).toContain('reviewerId');
    expect(migrationScript).toContain('reviewerUid');
    expect(migrationScript).toContain('FIELD_MIGRATIONS');
    expect(migrationScript).toContain('FieldMigrationTool');
  });

  it('should have migration from reviewerId to reviewerUid', () => {
    const migrationScript = readFileSync(
      join(__dirname, '../../../../scripts/migrateFields.ts'), 
      'utf8'
    );
    
    // Check that the migration is configured correctly
    expect(migrationScript).toContain("oldField: 'reviewerId'");
    expect(migrationScript).toContain("newField: 'reviewerUid'");
    expect(migrationScript).toContain("collection: 'reviews'");
  });

  it('should have backup functionality', () => {
    const migrationScript = readFileSync(
      join(__dirname, '../../../../scripts/migrateFields.ts'), 
      'utf8'
    );
    
    expect(migrationScript).toContain('backupCollection');
    expect(migrationScript).toContain('backupDir');
    expect(migrationScript).toContain('backups');
  });

  it('should handle idempotency', () => {
    const migrationScript = readFileSync(
      join(__dirname, '../../../../scripts/migrateFields.ts'), 
      'utf8'
    );
    
    // Should check if old field exists before migrating
    expect(migrationScript).toContain('hasOwnProperty');
    expect(migrationScript).toContain('skippedDocs');
  });

  it('should exit with proper status codes', () => {
    const migrationScript = readFileSync(
      join(__dirname, '../../../../scripts/migrateFields.ts'), 
      'utf8'
    );
    
    expect(migrationScript).toContain('process.exit(0)');
    expect(migrationScript).toContain('process.exit(1)');
  });
});

// Test that the API route uses the new field name
describe('API Route Schema Test', () => {
  it('should use reviewerUid instead of reviewerId', () => {
    const apiRoute = readFileSync(
      join(__dirname, '../../../../src/app/api/reviews/route.ts'), 
      'utf8'
    );
    
    expect(apiRoute).toContain('reviewerUid');
    expect(apiRoute).not.toContain('reviewerId:');
  });
});

// Test that no legacy field names remain
describe('Legacy Field Name Validation', () => {
  it('should pass the field name audit', () => {
    const { execSync } = require('child_process');
    
    try {
      const result = execSync('./scripts/audit-field-names.sh', {
        cwd: process.cwd(),
        encoding: 'utf8'
      });
      
      expect(result).toContain('AUDIT PASSED');
      expect(result).toContain('Total legacy field occurrences: 0');
    } catch (error) {
      // If audit fails, show the output
      console.log('Audit output:', error.stdout);
      console.log('Audit error:', error.stderr);
      throw new Error('Field name audit failed');
    }
  });
});

export { };