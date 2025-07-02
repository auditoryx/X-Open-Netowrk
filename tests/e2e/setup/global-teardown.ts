/**
 * Global teardown for Playwright tests
 * Cleans up test data and resources
 */
async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');

  // Close browser instance if it exists
  const browser = (global as any).__BROWSER__;
  const context = (global as any).__CONTEXT__;

  if (context) {
    await context.close();
  }

  if (browser) {
    await browser.close();
  }

  // Clean up test environment variables
  delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  delete process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR;
  delete process.env.STRIPE_PUBLISHABLE_KEY;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.SENDGRID_API_KEY;

  console.log('✅ Global test teardown completed');
}

export default globalTeardown;
