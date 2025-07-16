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

test.describe('Provider Role Smoke Test', () => {
  let authUtils: AuthUtils;
  let firestoreUtils: FirestoreUtils;
  let uiUtils: UIUtils;
  let stripeUtils: StripeUtils;
  let testProvider: TestUser;
  let testClient: TestUser;
  let testService: TestService;

  test.beforeEach(async ({ page }) => {
    // Initialize utilities
    authUtils = new AuthUtils(page);
    firestoreUtils = new FirestoreUtils();
    uiUtils = new UIUtils(page);
    stripeUtils = new StripeUtils(page);

    // Create test users
    testProvider = TestDataFactory.createTestProvider();
    testClient = TestDataFactory.createTestUser({ role: 'client' });
    testService = TestDataFactory.createTestService(testProvider.uid);

    // Set up test data
    await firestoreUtils.createTestUser(testClient);
  });

  test.afterEach(async () => {
    await firestoreUtils.cleanupTestData();
  });

  test('provider smoke test: sign-up → create profile → list services → get booked → complete service', async ({ page }) => {
    // Step 1: Visit homepage and go to apply
    await page.goto('/');
    await page.click('a[href="/apply"]');
    await expect(page.locator('h1')).toContainText('Apply as a Creator');

    // Step 2: Select provider role (producer)
    await page.click('[data-testid="apply-producer"]');
    await expect(page.locator('h1')).toContainText('Apply as Producer');

    // Step 3: Sign up as new provider
    await page.click('a[href="/signup"]');
    await page.fill('[placeholder="Email"]', testProvider.email);
    await page.fill('[placeholder="Password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Wait for redirect to application process
    await page.waitForURL('**/apply/**', { timeout: 10000 });

    // Step 4: Fill application form
    await page.fill('[data-testid="bio"]', 'Professional music producer with 5+ years experience');
    await page.fill('[data-testid="portfolio-links"]', 'https://soundcloud.com/testproducer');
    await page.fill('[data-testid="location"]', 'Tokyo, Japan');
    
    // Add genres
    await page.fill('[data-testid="genre-input"]', 'Hip-Hop');
    await page.press('[data-testid="genre-input"]', 'Enter');
    await page.fill('[data-testid="genre-input"]', 'Trap');
    await page.press('[data-testid="genre-input"]', 'Enter');

    // Set availability
    await page.click('[data-testid="availability-monday"]');
    await page.click('[data-testid="availability-tuesday"]');
    await page.click('[data-testid="availability-wednesday"]');

    // Agree to verification
    await page.click('[data-testid="agree-to-verify"]');

    // Submit application
    await page.click('[data-testid="submit-application"]');
    await expect(page.locator('text=Application submitted successfully')).toBeVisible();

    // Step 5: Simulate admin approval (set approved status directly)
    await firestoreUtils.createTestUser({
      ...testProvider,
      approved: true,
      role: 'producer'
    });

    // Step 6: Navigate to provider dashboard
    await page.goto('/dashboard/producer');
    await expect(page.locator('h1')).toContainText('Producer Dashboard');

    // Step 7: Create a service
    await page.click('[data-testid="create-service"]');
    await expect(page.locator('h1')).toContainText('Create New Service');

    await page.fill('[data-testid="service-title"]', 'Professional Beat Production');
    await page.fill('[data-testid="service-description"]', 'Custom beats for your next hit');
    await page.fill('[data-testid="service-price"]', '15000');
    await page.selectOption('[data-testid="service-type"]', 'production');
    await page.fill('[data-testid="service-location"]', 'Tokyo Studio');

    // Add sample tracks
    await page.fill('[data-testid="sample-track-url"]', 'https://soundcloud.com/sample1');
    await page.click('[data-testid="add-sample"]');

    // Set availability
    await page.click('[data-testid="available-monday"]');
    await page.click('[data-testid="available-tuesday"]');
    
    await page.click('[data-testid="create-service-submit"]');
    await expect(page.locator('text=Service created successfully')).toBeVisible();

    // Step 8: Verify service appears in dashboard
    await page.goto('/dashboard/producer/services');
    await expect(page.locator('text=Professional Beat Production')).toBeVisible();
    await expect(page.locator('text=¥15,000')).toBeVisible();

    // Step 9: Simulate receiving a booking (create booking directly)
    const testBooking = TestDataFactory.createTestBooking(testClient.uid, testProvider.uid, {
      serviceName: 'Professional Beat Production',
      status: 'confirmed'
    });
    await firestoreUtils.createTestBooking(testBooking);

    // Step 10: Check booking requests
    await page.goto('/dashboard/producer/bookings');
    await expect(page.locator('[data-testid="booking-request"]')).toBeVisible();
    await expect(page.locator('text=' + testClient.displayName)).toBeVisible();

    // Step 11: Accept booking
    await page.click('[data-testid="accept-booking"]');
    await expect(page.locator('text=Booking accepted')).toBeVisible();

    // Step 12: Complete the service
    await page.click('[data-testid="mark-completed"]');
    await page.fill('[data-testid="completion-notes"]', 'Beat delivered as requested');
    await page.click('[data-testid="submit-completion"]');
    await expect(page.locator('text=Service marked as completed')).toBeVisible();

    // Step 13: Check earnings
    await page.goto('/dashboard/producer/earnings');
    await expect(page.locator('text=¥15,000')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
  });

  test('provider smoke test: manage availability and calendar', async ({ page }) => {
    // Set up approved provider
    await firestoreUtils.createTestUser({
      ...testProvider,
      approved: true,
      role: 'producer'
    });

    // Sign in
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', testProvider.email);
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="signin-button"]');

    // Navigate to availability settings
    await page.goto('/dashboard/producer/availability');
    await expect(page.locator('h1')).toContainText('Manage Availability');

    // Set weekly availability
    await page.click('[data-testid="monday-available"]');
    await page.fill('[data-testid="monday-start"]', '09:00');
    await page.fill('[data-testid="monday-end"]', '17:00');

    await page.click('[data-testid="tuesday-available"]');
    await page.fill('[data-testid="tuesday-start"]', '10:00');
    await page.fill('[data-testid="tuesday-end"]', '18:00');

    await page.click('[data-testid="save-availability"]');
    await uiUtils.waitForToast('Availability updated successfully');

    // Set time off
    await page.click('[data-testid="add-time-off"]');
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    await page.fill('[data-testid="time-off-start"]', nextWeek.toISOString().split('T')[0]);
    await page.fill('[data-testid="time-off-end"]', nextWeek.toISOString().split('T')[0]);
    await page.fill('[data-testid="time-off-reason"]', 'Vacation');
    await page.click('[data-testid="save-time-off"]');
    
    await expect(page.locator('text=Time off scheduled')).toBeVisible();

    // Check calendar view
    await page.click('[data-testid="calendar-view"]');
    await expect(page.locator('[data-testid="calendar-container"]')).toBeVisible();
    await expect(page.locator('text=Vacation')).toBeVisible();
  });

  test('provider smoke test: service management and pricing', async ({ page }) => {
    // Set up approved provider
    await firestoreUtils.createTestUser({
      ...testProvider,
      approved: true,
      role: 'producer'
    });

    // Create existing service
    await firestoreUtils.createTestService(testService);

    // Sign in
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', testProvider.email);
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="signin-button"]');

    // Navigate to services
    await page.goto('/dashboard/producer/services');
    await expect(page.locator('text=' + testService.title)).toBeVisible();

    // Edit service
    await page.click('[data-testid="edit-service"]');
    await expect(page.locator('h1')).toContainText('Edit Service');

    // Update pricing
    await page.fill('[data-testid="service-price"]', '20000');
    await page.fill('[data-testid="service-description"]', 'Updated description with new features');
    
    // Add additional package
    await page.click('[data-testid="add-package"]');
    await page.fill('[data-testid="package-name"]', 'Premium Package');
    await page.fill('[data-testid="package-price"]', '35000');
    await page.fill('[data-testid="package-description"]', 'Includes mixing and mastering');

    await page.click('[data-testid="save-service"]');
    await uiUtils.waitForToast('Service updated successfully');

    // Verify updates
    await page.goto('/dashboard/producer/services');
    await expect(page.locator('text=¥20,000')).toBeVisible();
    await expect(page.locator('text=Premium Package')).toBeVisible();

    // Test service analytics
    await page.click('[data-testid="view-analytics"]');
    await expect(page.locator('h1')).toContainText('Service Analytics');
    await expect(page.locator('[data-testid="views-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-conversion"]')).toBeVisible();
  });

  test('provider smoke test: handle booking requests and communication', async ({ page }) => {
    // Set up approved provider and service
    await firestoreUtils.createTestUser({
      ...testProvider,
      approved: true,
      role: 'producer'
    });
    await firestoreUtils.createTestService(testService);

    // Create pending booking
    const testBooking = TestDataFactory.createTestBooking(testClient.uid, testProvider.uid, {
      serviceName: testService.title,
      status: 'pending'
    });
    await firestoreUtils.createTestBooking(testBooking);

    // Sign in
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', testProvider.email);
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="signin-button"]');

    // Check booking requests
    await page.goto('/dashboard/producer/bookings');
    await expect(page.locator('[data-testid="booking-request"]')).toBeVisible();
    await expect(page.locator('text=' + testClient.displayName)).toBeVisible();

    // View booking details
    await page.click('[data-testid="view-booking-details"]');
    await expect(page.locator('h1')).toContainText('Booking Details');
    await expect(page.locator('text=' + testBooking.location)).toBeVisible();
    await expect(page.locator('text=' + testBooking.date)).toBeVisible();

    // Send message to client
    await page.click('[data-testid="send-message"]');
    await page.fill('[data-testid="message-input"]', 'Hi! I received your booking request. Looking forward to working with you!');
    await page.click('[data-testid="send-message-button"]');
    await uiUtils.waitForToast('Message sent');

    // Accept booking
    await page.click('[data-testid="accept-booking"]');
    await expect(page.locator('text=Booking accepted')).toBeVisible();
    await uiUtils.waitForToast('Booking confirmed');

    // Check booking status changed
    await page.goto('/dashboard/producer/bookings');
    await expect(page.locator('text=Confirmed')).toBeVisible();

    // Test decline booking scenario
    const secondBooking = TestDataFactory.createTestBooking(testClient.uid, testProvider.uid, {
      serviceName: testService.title,
      status: 'pending',
      date: '2025-08-15'
    });
    await firestoreUtils.createTestBooking(secondBooking);

    await page.reload();
    await expect(page.locator('[data-testid="booking-request"]')).toBeVisible();
    
    await page.click('[data-testid="decline-booking"]');
    await page.fill('[data-testid="decline-reason"]', 'Not available on this date');
    await page.click('[data-testid="confirm-decline"]');
    await uiUtils.waitForToast('Booking declined');
  });
});