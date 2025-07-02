#!/usr/bin/env ts-node

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

interface ClaimOptions {
  uid: string;
  admin?: boolean;
  role?: 'admin' | 'artist' | 'client' | 'moderator';
  verified?: boolean;
  tier?: 'signature' | 'premium' | 'basic';
}

async function setUserClaims(options: ClaimOptions): Promise<void> {
  const { uid, admin, role, verified, tier } = options;
  
  if (!uid) {
    throw new Error('UID is required');
  }

  const claims: Record<string, any> = {};
  
  // Set admin claim
  if (admin !== undefined) {
    claims.admin = admin;
  }
  
  // Set role claim
  if (role) {
    claims.role = role;
  }
  
  // Set verified claim
  if (verified !== undefined) {
    claims.verified = verified;
  }
  
  // Set tier claim
  if (tier) {
    claims.tier = tier;
  }

  try {
    await getAuth().setCustomUserClaims(uid, claims);
    
    console.log(`✅ Claims set successfully for UID: ${uid}`);
    console.log(`📋 Claims:`, claims);
  } catch (error) {
    console.error('❌ Error setting user claims:', error);
    throw error;
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: 
  ts-node setUserClaims.ts <uid> [--admin] [--role <role>] [--verified] [--tier <tier>]

Examples:
  # Set admin claim
  ts-node setUserClaims.ts user123 --admin

  # Set role claim
  ts-node setUserClaims.ts user123 --role artist

  # Set multiple claims
  ts-node setUserClaims.ts user123 --admin --role admin --verified --tier signature

  # Remove admin claim
  ts-node setUserClaims.ts user123 --admin false

Available roles: admin, artist, client, moderator
Available tiers: signature, premium, basic
    `);
    process.exit(1);
  }

  const uid = args[0];
  const options: ClaimOptions = { uid };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--admin':
        const adminValue = args[i + 1];
        if (adminValue === 'false') {
          options.admin = false;
          i++;
        } else {
          options.admin = true;
        }
        break;
        
      case '--role':
        const role = args[i + 1] as ClaimOptions['role'];
        if (!['admin', 'artist', 'client', 'moderator'].includes(role as string)) {
          console.error('❌ Invalid role. Must be: admin, artist, client, or moderator');
          process.exit(1);
        }
        options.role = role;
        i++;
        break;
        
      case '--verified':
        const verifiedValue = args[i + 1];
        if (verifiedValue === 'false') {
          options.verified = false;
          i++;
        } else {
          options.verified = true;
        }
        break;
        
      case '--tier':
        const tier = args[i + 1] as ClaimOptions['tier'];
        if (!['signature', 'premium', 'basic'].includes(tier as string)) {
          console.error('❌ Invalid tier. Must be: signature, premium, or basic');
          process.exit(1);
        }
        options.tier = tier;
        i++;
        break;
    }
  }

  try {
    await setUserClaims(options);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to set user claims:', error);
    process.exit(1);
  }
}

// Export for programmatic use
export { setUserClaims, ClaimOptions };

// Run CLI if called directly
if (require.main === module) {
  main();
}
