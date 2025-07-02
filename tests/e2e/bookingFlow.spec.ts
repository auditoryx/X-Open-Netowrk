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

test.describe('Booking Flow E2E', () => {
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

    // Create test users
    testClient = TestDataFactory.createTestUser({ role: 'client' });
    testProvider = TestDataFactory.createTestProvider();
    testService = TestDataFactory.createTestService(testProvider.uid);

    // Set up test data
    await firestoreUtils.createTestUser(testClient);
    await firestoreUtils.createTestUser(testProvider);
    await firestoreUtils.createTestService(testService);
  });

  test.afterEach(async () => {
    // Clean up test data
    await firestoreUtils.cleanupTestData();
  });

  test('should complete full booking flow from search to confirmation', async ({ page }) => {
    // Step 1: Client searches for services
    await page.goto('/');
    await page.fill('[data-testid="search-input"]', 'music production');
    await page.click('[data-testid="search-button"]');

    // Verify search results
    await expect(page.locator('[data-testid="service-card"]')).toBeVisible();
    await expect(page.locator('text=' + testService.title)).toBeVisible();

    // Step 2: Client views service details
    await page.click(`[data-testid="service-${testService.id}"]`);
    await expect(page.locator('h1')).toContainText(testService.title);
    await expect(page.locator('text=' + testService.description)).toBeVisible();

    // Step 3: Client signs in
    await page.click('[data-testid="book-now-button"]');
    await authUtils.signIn(testClient.email);

    // Step 4: Client fills booking form
    await expect(page.locator('h1')).toContainText('Book Service');
    
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

    // Step 5: Client completes payment
    await expect(page.locator('h1')).toContainText('Payment');
    await expect(page.locator('text=¥15,000')).toBeVisible();

    await stripeUtils.completePayment();

    // Step 6: Verify booking confirmation
    await expect(page.locator('h1')).toContainText('Booking Confirmed');
    await expect(page.locator('text=' + testProvider.displayName)).toBeVisible();
    await expect(page.locator('text=' + bookingDate)).toBeVisible();

    // Step 7: Verify confirmation email trigger
    await uiUtils.waitForToast('Confirmation emails sent');

    // Step 8: Check booking appears in client dashboard
    await page.goto('/dashboard/bookings');
    await expect(page.locator('[data-testid="booking-card"]')).toBeVisible();
    await expect(page.locator('text=' + testService.title)).toBeVisible();
    await expect(page.locator('text=Confirmed')).toBeVisible();
  });

  test('should handle booking with invalid payment card', async ({ page }) => {
    // Set up booking flow
    await page.goto(`/services/${testService.id}`);
    await authUtils.signIn(testClient.email);
    
    await page.click('[data-testid="book-now-button"]');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await uiUtils.fillBookingForm({
      date: tomorrow.toISOString().split('T')[0],
      startTime: '14:00',
      location: 'Studio Tokyo'
    });
    
    await page.click('[data-testid="proceed-to-payment"]');

    // Use invalid card
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await stripeFrame.locator('[placeholder="Card number"]').fill('4000000000000002'); // Declined card
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('12/34');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    await stripeFrame.locator('[placeholder="ZIP"]').fill('12345');

    await page.click('[data-testid="complete-payment"]');

    // Verify error handling
    await uiUtils.waitForToast('Payment failed');
    await expect(page.locator('text=declined')).toBeVisible();
  });

  test('should prevent booking on unavailable dates', async ({ page }) => {
    // Create conflicting booking
    const conflictingBooking = TestDataFactory.createTestBooking(
      'other-client',
      testProvider.uid,
      { date: '2025-07-15', startTime: '14:00', status: 'confirmed' }
    );
    await firestoreUtils.createTestBooking(conflictingBooking);

    await page.goto(`/services/${testService.id}`);
    await authUtils.signIn(testClient.email);
    
    await page.click('[data-testid="book-now-button"]');
    
    // Try to book same slot
    await uiUtils.fillBookingForm({
      date: '2025-07-15',
      startTime: '14:00',
      location: 'Studio Tokyo'
    });

    await page.click('[data-testid="proceed-to-payment"]');

    // Verify conflict detection
    await uiUtils.waitForToast('Time slot unavailable');
    await expect(page.locator('text=already booked')).toBeVisible();
  });

  test('should handle booking form validation', async ({ page }) => {
    await page.goto(`/services/${testService.id}`);
    await authUtils.signIn(testClient.email);
    
    await page.click('[data-testid="book-now-button"]');

    // Try to submit empty form
    await page.click('[data-testid="proceed-to-payment"]');

    // Verify validation errors
    await expect(page.locator('text=Date is required')).toBeVisible();
    await expect(page.locator('text=Time is required')).toBeVisible();

    // Try past date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await uiUtils.fillBookingForm({
      date: yesterday.toISOString().split('T')[0],
      startTime: '14:00'
    });

    await page.click('[data-testid="proceed-to-payment"]');
    await expect(page.locator('text=cannot be in the past')).toBeVisible();
  });

  test('should show provider availability correctly', async ({ page }) => {
    // Create provider availability
    await page.goto(`/services/${testService.id}`);
    
    // Check calendar component
    await expect(page.locator('[data-testid="availability-calendar"]')).toBeVisible();
    
    // Available dates should be clickable
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    
    await expect(page.locator(`[data-date="${tomorrowDate}"]`)).not.toHaveClass(/disabled/);
    
    // Past dates should be disabled
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    
    await expect(page.locator(`[data-date="${yesterdayDate}"]`)).toHaveClass(/disabled/);
  });

  test('should send booking request to provider', async ({ page }) => {
    // Complete booking
    await page.goto(`/services/${testService.id}`);
    await authUtils.signIn(testClient.email);
    
    await page.click('[data-testid="book-now-button"]');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await uiUtils.fillBookingForm({
      date: tomorrow.toISOString().split('T')[0],
      startTime: '14:00',
      location: 'Studio Tokyo'
    });
    
    await page.click('[data-testid="proceed-to-payment"]');
    await stripeUtils.completePayment();

    // Sign out and sign in as provider
    await authUtils.signOut();
    await authUtils.signIn(testProvider.email);

    // Check provider dashboard
    await page.goto('/dashboard/bookings');
    await expect(page.locator('[data-testid="booking-request"]')).toBeVisible();
    await expect(page.locator('text=' + testClient.displayName)).toBeVisible();
    await expect(page.locator('text=New Booking')).toBeVisible();

    // Provider can view booking details
    await page.click('[data-testid="view-booking-details"]');
    await expect(page.locator('text=' + testService.title)).toBeVisible();
    await expect(page.locator('text=Studio Tokyo')).toBeVisible();
  });
});
