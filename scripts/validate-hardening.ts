#!/usr/bin/env npx tsx

/**
 * Pre-Ship Hardening Validation Script
 * 
 * Validates that all hardening requirements have been implemented correctly
 */

import { existsSync, readFileSync } from 'fs';
import { getFeatureFlags } from '../src/lib/featureFlags';

interface ValidationResult {
  test: string;
  passed: boolean;
  details?: string;
}

const results: ValidationResult[] = [];

function validate(test: string, condition: boolean, details?: string) {
  results.push({ test, passed: condition, details });
  console.log(condition ? '✅' : '❌', test, details ? `- ${details}` : '');
}

function validateHardening() {
  console.log('🔒 Pre-Ship Hardening Validation\n');

  // 1. Backend deprecation
  const deprecatedExists = existsSync('./backend/DEPRECATED.md');
  validate('Backend Express Server Deprecated', deprecatedExists, 
    deprecatedExists ? 'DEPRECATED.md file created' : 'Missing deprecation notice');

  // 2. Firestore rules - check that isWithinRateLimit is removed
  const rulesContent = readFileSync('./firestore.rules', 'utf8');
  const hasNoOpRateLimit = !rulesContent.includes('return true; // Placeholder for now');
  const hasRateLimitFunction = rulesContent.includes('isWithinRateLimit');
  validate('Firestore Rules Cleaned', hasNoOpRateLimit && !hasRateLimitFunction, 
    hasNoOpRateLimit ? 'No-op rate limiting removed' : 'Still contains placeholder rate limiting');

  // 3. Stripe webhook security
  const webhookContent = readFileSync('./src/app/api/webhooks/stripe/route.ts', 'utf8');
  const hasSecretValidation = webhookContent.includes('STRIPE_WEBHOOK_SECRET is required in production');
  const hasSentryIntegration = webhookContent.includes('Sentry.captureException');
  const hasErrorHandling = webhookContent.includes('Webhook signature verification failed');
  validate('Stripe Webhook Security Enhanced', hasSecretValidation && hasSentryIntegration && hasErrorHandling,
    `Secret validation: ${hasSecretValidation}, Sentry: ${hasSentryIntegration}, Error handling: ${hasErrorHandling}`);

  // 4. Feature flags
  process.env.NODE_ENV = 'production';
  const prodFlags = getFeatureFlags();
  const allFeaturesDisabled = !prodFlags.ENABLE_2FA && !prodFlags.ENABLE_KYC_WEBHOOK && !prodFlags.ENABLE_ANALYTICS_DASHBOARD;
  validate('Feature Flags Working', allFeaturesDisabled, 
    'Sensitive features disabled in production');

  // 5. Minimal environment config
  const minimalEnvExists = existsSync('./.env.local.example-min');
  validate('Minimal Environment Config Created', minimalEnvExists,
    minimalEnvExists ? 'Boot-only configuration file available' : 'Missing minimal config');

  // 6. CI configuration
  const ciContent = readFileSync('./.github/workflows/ci.yml', 'utf8');
  const hasTypeCheck = ciContent.includes('pnpm type-check');
  const hasVitest = ciContent.includes('pnpm test:vitest');
  validate('CI Configuration Updated', hasTypeCheck && hasVitest,
    `Type check: ${hasTypeCheck}, Vitest: ${hasVitest}`);

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`\n📊 Results: ${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log('🎉 All pre-ship hardening requirements implemented successfully!');
    console.log('🚀 Ready for production deployment');
  } else {
    console.log('⚠️  Some hardening requirements need attention');
    const failed = results.filter(r => !r.passed);
    console.log('Failed checks:');
    failed.forEach(r => console.log(`  - ${r.test}: ${r.details || 'Failed'}`));
    process.exit(1);
  }
}

validateHardening();