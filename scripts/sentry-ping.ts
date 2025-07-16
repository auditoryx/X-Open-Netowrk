#!/usr/bin/env ts-node

/**
 * Sentry Ping Script
 * 
 * This script tests Sentry error tracking by sending a test event.
 * Run with: npx ts-node scripts/sentry-ping.ts
 */

import * as Sentry from '@sentry/nextjs';
import { config } from 'dotenv';

// Load environment variables
config();

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (!SENTRY_DSN) {
  console.error('❌ SENTRY_DSN not found in environment variables');
  console.log('Please set NEXT_PUBLIC_SENTRY_DSN or SENTRY_DSN in your .env file');
  process.exit(1);
}

console.log('🔧 Initializing Sentry...');

// Initialize Sentry
Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
  debug: true,
  
  beforeSend(event) {
    console.log('📤 Sending event to Sentry:', event.event_id);
    return event;
  },
});

async function sendTestEvent() {
  try {
    console.log('🚀 Sending test event to Sentry...');
    
    // Set user context
    Sentry.setUser({
      id: 'test-user',
      email: 'test@auditoryx.com',
      username: 'sentry-ping-test'
    });
    
    // Add tags
    Sentry.setTag('test-type', 'sentry-ping');
    Sentry.setTag('script', 'sentry-ping.ts');
    
    // Add extra context
    Sentry.setContext('test-info', {
      timestamp: new Date().toISOString(),
      script: 'sentry-ping.ts',
      purpose: 'Testing Sentry integration'
    });
    
    // Send a test message
    const messageId = Sentry.captureMessage('🏓 Sentry ping test - integration working!', 'info');
    console.log('✅ Test message sent with ID:', messageId);
    
    // Send a test error
    const testError = new Error('Test error from sentry-ping.ts script');
    testError.name = 'SentryPingTestError';
    
    const errorId = Sentry.captureException(testError);
    console.log('✅ Test error sent with ID:', errorId);
    
    // Send a custom event
    const customEventId = Sentry.captureEvent({
      message: 'Custom Sentry ping event',
      level: 'warning',
      tags: {
        'test-type': 'custom-event',
        'component': 'sentry-ping'
      },
      extra: {
        customData: 'This is a custom event from sentry-ping.ts',
        timestamp: Date.now()
      }
    });
    console.log('✅ Custom event sent with ID:', customEventId);
    
    console.log('📊 All test events sent successfully!');
    console.log('');
    console.log('📈 Check your Sentry dashboard to verify events were received:');
    console.log(`   Dashboard: https://sentry.io/organizations/your-org/projects/your-project/`);
    console.log('');
    console.log('🔍 Event IDs to look for:');
    console.log(`   Message: ${messageId}`);
    console.log(`   Error: ${errorId}`);
    console.log(`   Custom: ${customEventId}`);
    
  } catch (error) {
    console.error('❌ Error sending test events:', error);
    throw error;
  }
}

async function main() {
  try {
    await sendTestEvent();
    
    // Wait a bit for events to be sent
    console.log('⏳ Waiting for events to be sent...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Sentry ping test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Sentry ping test failed:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}

export { sendTestEvent };