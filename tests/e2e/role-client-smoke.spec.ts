import { test, expect } from '@playwright/test';
import { 
  AuthUtils, 
  FirestoreUtils, 
  UIUtils, 
  StripeUtils, 
  TestDataFactory,
  TestUser,
  TestService,
  TestBooking
} from './utils/test-helpers';

test.describe('Client Role Smoke Test', () => {
  let authUtils: AuthUtils;
  let firestoreUtils: FirestoreUtils;
  let uiUtils: UIUtils;
  let stripeUtils: StripeUtils;
  let testClient: TestUser;
  let testProvider: TestUser;
  let testService: TestService;

  test.beforeEach(async ({ page }) => {
    // Initialize utilities
    authUtils = new AuthUtils(page);
    firestoreUtils = new FirestoreUtils();
    uiUtils = new UIUtils(page);
    stripeUtils = new StripeUtils(page);

    // Create test users and services
    testClient = TestDataFactory.createTestUser({ role: 'client' });
    testProvider = TestDataFactory.createTestProvider();
    testService = TestDataFactory.createTestService(testProvider.uid);

    // Set up test data
    await firestoreUtils.createTestUser(testProvider);
    await firestoreUtils.createTestService(testService);
  });

  test.afterEach(async () => {
    await firestoreUtils.cleanupTestData();
  });

  test('client smoke test: sign-up → explore → book → pay → leave review', async ({ page }) => {
    // Step 1: Visit homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('The Global Creative Network Built for Music');

    // Step 2: Sign up as new client
    await page.click('a[href="/signup"]');
    await page.fill('[placeholder="Email"]', testClient.email);
    await page.fill('[placeholder="Password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard or onboarding
    await page.waitForURL('**/dashboard*', { timeout: 10000 });

    // Step 3: Explore services
    await page.goto('/explore');
    await expect(page.locator('h1')).toContainText('Find Your Next Collaborator');
    
    // Search for our test service
    await page.fill('[data-testid="search-input"]', 'production');
    await page.click('[data-testid="search-button"]');
    
    // Verify service appears in results
    await expect(page.locator(`[data-testid="service-${testService.id}"]`)).toBeVisible();

    // Step 4: View service details and book
    await page.click(`[data-testid="service-${testService.id}"]`);
    await expect(page.locator('h1')).toContainText(testService.title);
    
    // Click book now
    await page.click('[data-testid="book-now-button"]');
    
    // Fill booking form
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingDate = tomorrow.toISOString().split('T')[0];

    await uiUtils.fillBookingForm({
      date: bookingDate,
      startTime: '14:00',
      location: 'Studio Tokyo'
    });

    await page.fill('[data-testid="booking-notes"]', 'Looking forward to working together!');
    await page.click('[data-testid="proceed-to-payment"]');

    // Step 5: Complete payment
    await expect(page.locator('h1')).toContainText('Payment');
    await stripeUtils.completePayment();

    // Step 6: Verify booking confirmation
    await expect(page.locator('h1')).toContainText('Booking Confirmed');
    await expect(page.locator('text=' + testProvider.displayName)).toBeVisible();

    // Step 7: Navigate to bookings dashboard
    await page.goto('/dashboard/bookings');
    await expect(page.locator('[data-testid="booking-card"]')).toBeVisible();
    await expect(page.locator('text=' + testService.title)).toBeVisible();

    // Step 8: Mark booking as completed (simulate service completion)
    await page.click('[data-testid="mark-completed"]');
    await expect(page.locator('text=Completed')).toBeVisible();

    // Step 9: Leave a review
    await page.click('[data-testid="leave-review"]');
    await expect(page.locator('h1')).toContainText('Leave a Review');
    
    await uiUtils.submitReview(5, 'Amazing service! Highly recommend.');
    await expect(page.locator('text=Review submitted successfully')).toBeVisible();

    // Step 10: Verify review appears on provider profile
    await page.goto(`/profile/${testProvider.uid}`);
    await expect(page.locator('text=Amazing service! Highly recommend.')).toBeVisible();
    await expect(page.locator('[data-testid="review-stars"]')).toContainText('5');
  });

  test('client smoke test: search and filter services', async ({ page }) => {
    // Create multiple services with different types
    const studioService = TestDataFactory.createTestService(testProvider.uid, {
      title: 'Professional Studio Rental',
      type: 'studio',
      price: 10000
    });
    const mixingService = TestDataFactory.createTestService(testProvider.uid, {
      title: 'Professional Mixing Service',
      type: 'mixing',
      price: 20000
    });

    await firestoreUtils.createTestService(studioService);
    await firestoreUtils.createTestService(mixingService);

    // Sign up and navigate to explore
    await page.goto('/signup');
    await page.fill('[placeholder="Email"]', testClient.email);
    await page.fill('[placeholder="Password"]', 'testpass123');
    await page.click('button[type="submit"]');

    await page.goto('/explore');

    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'mixing');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('text=' + mixingService.title)).toBeVisible();
    await expect(page.locator('text=' + studioService.title)).not.toBeVisible();

    // Test filter by type
    await page.click('[data-testid="filter-type"]');
    await page.click('[data-testid="filter-studio"]');
    
    await expect(page.locator('text=' + studioService.title)).toBeVisible();
    await expect(page.locator('text=' + mixingService.title)).not.toBeVisible();

    // Test price range filter
    await page.click('[data-testid="filter-price"]');
    await page.fill('[data-testid="min-price"]', '15000');
    await page.fill('[data-testid="max-price"]', '25000');
    await page.click('[data-testid="apply-price-filter"]');
    
    await expect(page.locator('text=' + mixingService.title)).toBeVisible();
    await expect(page.locator('text=' + studioService.title)).not.toBeVisible();
  });

  test('client smoke test: booking validation and error handling', async ({ page }) => {
    // Set up test data
    await firestoreUtils.createTestUser(testClient);

    // Sign in
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', testClient.email);
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="signin-button"]');

    // Navigate to service and attempt booking
    await page.goto(`/services/${testService.id}`);
    await page.click('[data-testid="book-now-button"]');

    // Try to submit empty form
    await page.click('[data-testid="proceed-to-payment"]');
    
    // Verify validation errors
    await expect(page.locator('text=Date is required')).toBeVisible();
    await expect(page.locator('text=Time is required')).toBeVisible();

    // Try booking in the past
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await uiUtils.fillBookingForm({
      date: yesterday.toISOString().split('T')[0],
      startTime: '14:00',
      location: 'Studio Tokyo'
    });

    await page.click('[data-testid="proceed-to-payment"]');
    await expect(page.locator('text=cannot be in the past')).toBeVisible();

    // Fill valid form
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await uiUtils.fillBookingForm({
      date: tomorrow.toISOString().split('T')[0],
      startTime: '14:00',
      location: 'Studio Tokyo'
    });

    await page.click('[data-testid="proceed-to-payment"]');
    await expect(page.locator('h1')).toContainText('Payment');
  });

  test('client smoke test: dashboard navigation and features', async ({ page }) => {
    // Set up test data
    await firestoreUtils.createTestUser(testClient);
    
    // Create a booking
    const testBooking = TestDataFactory.createTestBooking(testClient.uid, testProvider.uid);
    await firestoreUtils.createTestBooking(testBooking);

    // Sign in
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', testClient.email);
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="signin-button"]');

    // Test dashboard navigation
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Check bookings section
    await page.click('[data-testid="nav-bookings"]');
    await expect(page.locator('text=' + testBooking.serviceName)).toBeVisible();

    // Check saved section
    await page.click('[data-testid="nav-saved"]');
    await expect(page.locator('h1')).toContainText('Saved');

    // Check settings section
    await page.click('[data-testid="nav-settings"]');
    await expect(page.locator('h1')).toContainText('Settings');

    // Test profile update
    await page.fill('[data-testid="display-name"]', 'Updated Test User');
    await page.click('[data-testid="save-profile"]');
    await uiUtils.waitForToast('Profile updated successfully');
  });
});