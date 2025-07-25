import { admin } from '@/lib/firebase-admin';
import { UnifiedUser, UnifiedUserSchema } from '../user';

/**
 * User Data Migration Script
 * 
 * Migrates and unifies user data from multiple sources:
 * 1. Mongoose users (backend/models/User.js)
 * 2. Firestore users (existing collection)
 * 3. NextAuth sessions and accounts
 * 
 * Creates a single unified users collection with all required fields
 */

interface MigrationResult {
  success: boolean;
  totalUsers: number;
  migratedUsers: number;
  skippedUsers: number;
  errors: Array<{ uid: string; error: string }>;
}

interface LegacyUser {
  // Mongoose fields
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Existing Firestore fields
  id?: string;
  uid?: string;
  displayName?: string;
  averageRating?: number;
  reviewCount?: number;
  tier?: string;
  xp?: number;
  rankScore?: number;
  
  // NextAuth fields
  emailVerified?: boolean;
  image?: string;
}

/**
 * Convert legacy user data to unified schema
 */
function convertLegacyUser(legacyUser: LegacyUser, uid: string): Partial<UnifiedUser> {
  const now = new Date();
  
  return {
    uid,
    email: legacyUser.email || '',
    displayName: legacyUser.displayName || legacyUser.name || null,
    name: legacyUser.name,
    emailVerified: legacyUser.emailVerified ?? false,
    
    // Map legacy roles to new role enum
    role: mapLegacyRole(legacyUser.role),
    
    // Default new fields
    tier: (legacyUser.tier as any) || 'standard',
    verificationStatus: 'unverified',
    xp: legacyUser.xp || 0,
    rankScore: legacyUser.rankScore || 0,
    averageRating: legacyUser.averageRating,
    reviewCount: legacyUser.reviewCount || 0,
    
    profilePicture: legacyUser.image || undefined,
    
    // Default settings
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    profileVisibility: 'public',
    paymentMethodsSetup: false,
    isActive: true,
    
    // Timestamps
    createdAt: legacyUser.createdAt || now,
    updatedAt: legacyUser.updatedAt || now,
    
    // Migration metadata
    migratedFrom: determineMigrationSource(legacyUser),
    migrationVersion: '1.0.0',
    migratedAt: now,
  };
}

/**
 * Map legacy role values to unified role enum
 */
function mapLegacyRole(legacyRole?: string): UnifiedUser['role'] {
  if (!legacyRole) return 'client';
  
  const roleMapping: Record<string, UnifiedUser['role']> = {
    'buyer': 'client',
    'user': 'client',
    'client': 'client',
    'creator': 'creator',
    'artist': 'artist',
    'producer': 'producer',
    'engineer': 'engineer',
    'studio': 'studio',
    'videographer': 'videographer',
    'admin': 'admin',
    'moderator': 'moderator',
  };
  
  return roleMapping[legacyRole.toLowerCase()] || 'client';
}

/**
 * Determine the source of migration data
 */
function determineMigrationSource(legacyUser: LegacyUser): 'mongoose' | 'firestore' | 'nextauth' {
  if (legacyUser._id) return 'mongoose';
  if (legacyUser.tier || legacyUser.xp) return 'firestore';
  return 'nextauth';
}

/**
 * Migrate users from existing Firestore users collection
 */
async function migrateFirestoreUsers(): Promise<{ users: Array<{ uid: string; data: Partial<UnifiedUser> }>; errors: Array<{ uid: string; error: string }> }> {
  const users: Array<{ uid: string; data: Partial<UnifiedUser> }> = [];
  const errors: Array<{ uid: string; error: string }> = [];
  
  try {
    const usersSnapshot = await admin.firestore().collection('users').get();
    
    for (const doc of usersSnapshot.docs) {
      try {
        const legacyData = doc.data() as LegacyUser;
        const uid = doc.id;
        
        const unifiedData = convertLegacyUser(legacyData, uid);
        users.push({ uid, data: unifiedData });
      } catch (error) {
        errors.push({
          uid: doc.id,
          error: `Failed to convert user data: ${error}`,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching Firestore users:', error);
  }
  
  return { users, errors };
}

/**
 * Migrate users from NextAuth accounts/users collections
 */
async function migrateNextAuthUsers(): Promise<{ users: Array<{ uid: string; data: Partial<UnifiedUser> }>; errors: Array<{ uid: string; error: string }> }> {
  const users: Array<{ uid: string; data: Partial<UnifiedUser> }> = [];
  const errors: Array<{ uid: string; error: string }> = [];
  
  try {
    // Check if NextAuth collections exist
    const accountsSnapshot = await admin.firestore().collection('accounts').limit(1).get();
    if (accountsSnapshot.empty) {
      console.log('No NextAuth accounts found, skipping NextAuth migration');
      return { users, errors };
    }
    
    const usersSnapshot = await admin.firestore().collection('next-auth-users').get();
    
    for (const doc of usersSnapshot.docs) {
      try {
        const legacyData = doc.data() as LegacyUser;
        const uid = doc.id;
        
        // Skip if user already exists in main users collection
        const existingUser = await admin.firestore().collection('users').doc(uid).get();
        if (existingUser.exists) {
          continue;
        }
        
        const unifiedData = convertLegacyUser(legacyData, uid);
        users.push({ uid, data: unifiedData });
      } catch (error) {
        errors.push({
          uid: doc.id,
          error: `Failed to convert NextAuth user data: ${error}`,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching NextAuth users:', error);
  }
  
  return { users, errors };
}

/**
 * Validate unified user data against schema
 */
function validateUnifiedUserData(data: Partial<UnifiedUser>): UnifiedUser | null {
  try {
    return UnifiedUserSchema.parse(data);
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
}

/**
 * Save unified user to Firestore
 */
async function saveUnifiedUser(uid: string, userData: UnifiedUser): Promise<void> {
  const userRef = admin.firestore().collection('users').doc(uid);
  
  // Convert Date objects to Firestore Timestamps
  const firestoreData = {
    ...userData,
    createdAt: admin.firestore.Timestamp.fromDate(userData.createdAt),
    updatedAt: admin.firestore.Timestamp.fromDate(userData.updatedAt),
    lastSignIn: userData.lastSignIn ? admin.firestore.Timestamp.fromDate(userData.lastSignIn) : null,
    verifiedAt: userData.verifiedAt ? admin.firestore.Timestamp.fromDate(userData.verifiedAt) : null,
    migratedAt: userData.migratedAt ? admin.firestore.Timestamp.fromDate(userData.migratedAt) : null,
    deletedAt: userData.deletedAt ? admin.firestore.Timestamp.fromDate(userData.deletedAt) : null,
  };
  
  await userRef.set(firestoreData, { merge: true });
}

/**
 * Main migration function
 */
export async function migrateUserData(dryRun: boolean = true): Promise<MigrationResult> {
  console.log(`Starting user data migration (${dryRun ? 'DRY RUN' : 'LIVE RUN'})...`);
  
  const result: MigrationResult = {
    success: true,
    totalUsers: 0,
    migratedUsers: 0,
    skippedUsers: 0,
    errors: [],
  };
  
  try {
    // Collect users from all sources
    const [firestoreResult, nextAuthResult] = await Promise.all([
      migrateFirestoreUsers(),
      migrateNextAuthUsers(),
    ]);
    
    // Combine all users
    const allUsers = [...firestoreResult.users, ...nextAuthResult.users];
    const allErrors = [...firestoreResult.errors, ...nextAuthResult.errors];
    
    result.totalUsers = allUsers.length;
    result.errors = allErrors;
    
    console.log(`Found ${allUsers.length} users to migrate`);
    
    // Process each user
    for (const { uid, data } of allUsers) {
      try {
        // Validate the unified user data
        const validatedUser = validateUnifiedUserData(data);
        if (!validatedUser) {
          result.errors.push({
            uid,
            error: 'Failed to validate unified user data',
          });
          result.skippedUsers++;
          continue;
        }
        
        if (dryRun) {
          console.log(`[DRY RUN] Would migrate user ${uid}:`, {
            email: validatedUser.email,
            role: validatedUser.role,
            tier: validatedUser.tier,
            migratedFrom: validatedUser.migratedFrom,
          });
        } else {
          await saveUnifiedUser(uid, validatedUser);
          console.log(`Migrated user ${uid} (${validatedUser.email})`);
        }
        
        result.migratedUsers++;
      } catch (error) {
        result.errors.push({
          uid,
          error: `Migration failed: ${error}`,
        });
        result.skippedUsers++;
      }
    }
    
    console.log('Migration completed:', {
      total: result.totalUsers,
      migrated: result.migratedUsers,
      skipped: result.skippedUsers,
      errors: result.errors.length,
    });
    
    if (result.errors.length > 0) {
      console.log('Migration errors:', result.errors);
      result.success = false;
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    result.success = false;
    result.errors.push({
      uid: 'system',
      error: `System error: ${error}`,
    });
  }
  
  return result;
}

/**
 * CLI interface for running migration
 */
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  const live = process.argv.includes('--live');
  
  if (!dryRun && !live) {
    console.log('Usage: npm run migrate:users [--dry-run|--live]');
    console.log('  --dry-run: Preview migration without making changes');
    console.log('  --live: Execute actual migration');
    process.exit(1);
  }
  
  migrateUserData(dryRun)
    .then((result) => {
      console.log('Migration result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}