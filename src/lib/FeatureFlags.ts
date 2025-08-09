/**
 * Server-side Feature Flags Helper
 * 
 * Loads feature flags from Firestore config/exposure collection with process.env fallback
 * This is used for server-side components and API routes
 */

import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import * as fs from 'fs';
import * as path from 'path';

// AX Beta feature flags
export interface FeatureFlagConfig {
  EXPOSE_SCORE_V1?: boolean;        // Enable credibility-based sorting
  BYO_LINKS?: boolean;              // Enable creator invite system  
  FIRST_SCREEN_MIX?: boolean;       // Enable 70/20/10 result composition
  LANE_NUDGES?: boolean;            // Enable role-specific performance boosts
  CASE_STUDIES?: boolean;           // Enable creator showcase system
  POSITIVE_REVIEWS_ONLY?: boolean;  // Convert to testimonial-only format
}

// Default flags (safe defaults for production)
const DEFAULT_FLAGS: FeatureFlagConfig = {
  EXPOSE_SCORE_V1: false,
  BYO_LINKS: false,
  FIRST_SCREEN_MIX: false,
  LANE_NUDGES: false,
  CASE_STUDIES: false,
  POSITIVE_REVIEWS_ONLY: false,
};

let cachedFlags: FeatureFlagConfig | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Get feature flags with caching and fallback logic
 */
export async function getFlags(): Promise<FeatureFlagConfig> {
  const now = Date.now();
  
  // Return cached flags if still valid
  if (cachedFlags && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedFlags;
  }

  try {
    // Try Firestore first
    const firestoreFlags = await loadFromFirestore();
    if (firestoreFlags) {
      cachedFlags = firestoreFlags;
      lastFetchTime = now;
      return firestoreFlags;
    }
  } catch (error) {
    console.warn('Failed to load flags from Firestore:', error);
  }

  try {
    // Fallback to local JSON config
    const jsonFlags = await loadFromJSON();
    if (jsonFlags) {
      cachedFlags = jsonFlags;
      lastFetchTime = now;
      return jsonFlags;
    }
  } catch (error) {
    console.warn('Failed to load flags from JSON config:', error);
  }

  // Final fallback to environment variables
  const envFlags = loadFromEnvironment();
  cachedFlags = envFlags;
  lastFetchTime = now;
  return envFlags;
}

/**
 * Load feature flags from Firestore config/exposure document
 */
async function loadFromFirestore(): Promise<FeatureFlagConfig | null> {
  try {
    const db = getFirestore(app);
    const configDoc = await getDoc(doc(db, 'config', 'exposure'));
    
    if (configDoc.exists()) {
      const data = configDoc.data();
      return {
        EXPOSE_SCORE_V1: !!data.EXPOSE_SCORE_V1,
        BYO_LINKS: !!data.BYO_LINKS,
        FIRST_SCREEN_MIX: !!data.FIRST_SCREEN_MIX,
        LANE_NUDGES: !!data.LANE_NUDGES,
        CASE_STUDIES: !!data.CASE_STUDIES,
        POSITIVE_REVIEWS_ONLY: !!data.POSITIVE_REVIEWS_ONLY,
      };
    }
  } catch (error) {
    console.error('Error loading flags from Firestore:', error);
  }
  
  return null;
}

/**
 * Load feature flags from local JSON config file
 */
async function loadFromJSON(): Promise<FeatureFlagConfig | null> {
  try {
    const configPath = path.join(process.cwd(), 'config', 'exposure.json');
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (configData.featureFlags) {
        return {
          EXPOSE_SCORE_V1: !!configData.featureFlags.EXPOSE_SCORE_V1,
          BYO_LINKS: !!configData.featureFlags.BYO_LINKS,
          FIRST_SCREEN_MIX: !!configData.featureFlags.FIRST_SCREEN_MIX,
          LANE_NUDGES: !!configData.featureFlags.LANE_NUDGES,
          CASE_STUDIES: !!configData.featureFlags.CASE_STUDIES,
          POSITIVE_REVIEWS_ONLY: !!configData.featureFlags.POSITIVE_REVIEWS_ONLY,
        };
      }
    }
  } catch (error) {
    console.error('Error loading flags from JSON:', error);
  }
  
  return null;
}

/**
 * Load feature flags from environment variables (fallback)
 */
function loadFromEnvironment(): FeatureFlagConfig {
  return {
    EXPOSE_SCORE_V1: process.env.EXPOSE_SCORE_V1 === 'true',
    BYO_LINKS: process.env.BYO_LINKS === 'true',
    FIRST_SCREEN_MIX: process.env.FIRST_SCREEN_MIX === 'true',
    LANE_NUDGES: process.env.LANE_NUDGES === 'true',
    CASE_STUDIES: process.env.CASE_STUDIES === 'true',
    POSITIVE_REVIEWS_ONLY: process.env.POSITIVE_REVIEWS_ONLY === 'true',
  };
}

/**
 * Check if a specific feature flag is enabled
 */
export async function isFeatureEnabled(flag: keyof FeatureFlagConfig): Promise<boolean> {
  const flags = await getFlags();
  return !!flags[flag];
}

/**
 * Get all enabled feature flags
 */
export async function getEnabledFeatures(): Promise<string[]> {
  const flags = await getFlags();
  return Object.entries(flags)
    .filter(([_, enabled]) => enabled)
    .map(([flag]) => flag);
}

/**
 * Invalidate feature flag cache (useful for testing or immediate updates)
 */
export function invalidateCache(): void {
  cachedFlags = null;
  lastFetchTime = 0;
}

/**
 * Development helper - log current server feature flag status
 */
export async function logServerFeatureFlags(): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    const flags = await getFlags();
    console.group('🚩 Server Feature Flags Status');
    console.table(flags);
    console.groupEnd();
  }
}