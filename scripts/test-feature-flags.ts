#!/usr/bin/env npx tsx

/**
 * Test script to validate feature flag functionality
 */

import { getFeatureFlags, isFeatureEnabled } from '../src/lib/featureFlags';

function testFeatureFlags() {
  console.log('🧪 Testing Feature Flag System...\n');

  // Test in development mode
  process.env.NODE_ENV = 'development';
  process.env.ENABLE_2FA = 'true';
  process.env.ENABLE_KYC_WEBHOOK = 'true';
  process.env.ENABLE_ANALYTICS_DASHBOARD = 'true';

  console.log('Development Mode Test:');
  const devFlags = getFeatureFlags();
  console.log('  ENABLE_2FA:', devFlags.ENABLE_2FA, '✓');
  console.log('  ENABLE_KYC_WEBHOOK:', devFlags.ENABLE_KYC_WEBHOOK, '✓');
  console.log('  ENABLE_ANALYTICS_DASHBOARD:', devFlags.ENABLE_ANALYTICS_DASHBOARD, '✓');

  // Test in production mode
  process.env.NODE_ENV = 'production';
  console.log('\nProduction Mode Test:');
  const prodFlags = getFeatureFlags();
  console.log('  ENABLE_2FA:', prodFlags.ENABLE_2FA, '(should be false)');
  console.log('  ENABLE_KYC_WEBHOOK:', prodFlags.ENABLE_KYC_WEBHOOK, '(should be false)');
  console.log('  ENABLE_ANALYTICS_DASHBOARD:', prodFlags.ENABLE_ANALYTICS_DASHBOARD, '(should be false)');

  // Validate expected behavior
  const allProduction = !prodFlags.ENABLE_2FA && !prodFlags.ENABLE_KYC_WEBHOOK && !prodFlags.ENABLE_ANALYTICS_DASHBOARD;
  
  if (allProduction) {
    console.log('\n✅ Feature flags working correctly - all sensitive features disabled in production');
  } else {
    console.log('\n❌ Feature flags not working correctly');
    process.exit(1);
  }

  console.log('\n🔒 Production security validated');
}

testFeatureFlags();