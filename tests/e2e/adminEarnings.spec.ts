import { test, expect } from '@playwright/test';
import { 
  AuthUtils, 
  FirestoreUtils, 
  TestDataFactory,
  TestUser,
  TestBooking
} from './utils/test-helpers';

test.describe('Admin Earnings Dashboard E2E', () => {
  let authUtils: AuthUtils;
  let firestoreUtils: FirestoreUtils;
  let testAdmin: TestUser;
  let testBookings: TestBooking[];

  test.beforeEach(async ({ page }) => {
    // Initialize utilities
    authUtils = new AuthUtils(page);
    firestoreUtils = new FirestoreUtils();

    // Create test admin
    testAdmin = TestDataFactory.createTestAdmin();
    await firestoreUtils.createTestUser(testAdmin);

    // Create test users for bookings
    const client1 = TestDataFactory.createTestUser({ role: 'client', displayName: 'Client One' });
    const client2 = TestDataFactory.createTestUser({ role: 'client', displayName: 'Client Two' });
    const provider1 = TestDataFactory.createTestProvider({ displayName: 'Producer Tokyo' });
    const provider2 = TestDataFactory.createTestProvider({ displayName: 'Mixer Osaka' });

    await firestoreUtils.createTestUser(client1);
    await firestoreUtils.createTestUser(client2);
    await firestoreUtils.createTestUser(provider1);
    await firestoreUtils.createTestUser(provider2);

    // Create test bookings with different dates and amounts
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    testBookings = [
      // This week's bookings
      TestDataFactory.createTestBooking(client1.uid, provider1.uid, {
        status: 'completed',
        totalAmount: 15000,
        date: today.toISOString().split('T')[0],
        serviceName: 'Music Production'
      }),
      TestDataFactory.createTestBooking(client2.uid, provider1.uid, {
        status: 'completed',
        totalAmount: 25000,
        date: today.toISOString().split('T')[0],
        serviceName: 'Mixing & Mastering'
      }),
      
      // Last week's bookings
      TestDataFactory.createTestBooking(client1.uid, provider2.uid, {
        status: 'completed',
        totalAmount: 20000,
        date: lastWeek.toISOString().split('T')[0],
        serviceName: 'Audio Engineering'
      }),
      
      // Last month's bookings
      TestDataFactory.createTestBooking(client2.uid, provider2.uid, {
        status: 'completed',
        totalAmount: 30000,
        date: lastMonth.toISOString().split('T')[0],
        serviceName: 'Studio Recording'
      }),
      
      // Pending booking (should not count in earnings)
      TestDataFactory.createTestBooking(client1.uid, provider1.uid, {
        status: 'pending',
        totalAmount: 10000,
        date: today.toISOString().split('T')[0],
        serviceName: 'Consultation'
      })
    ];

    // Create all test bookings
    for (const booking of testBookings) {
      await firestoreUtils.createTestBooking(booking);
    }
  });

  test.afterEach(async () => {
    // Clean up test data
    await firestoreUtils.cleanupTestData();
  });

  test('should display admin earnings dashboard with correct totals', async ({ page }) => {
    // Sign in as admin
    await authUtils.signIn(testAdmin.email);

    // Navigate to admin earnings dashboard
    await page.goto('/dashboard/admin/earnings');

    // Verify page loads and shows admin content
    await expect(page.locator('h1')).toContainText('Admin Earnings Dashboard');
    await expect(page.locator('text=Platform revenue overview')).toBeVisible();

    // Verify summary cards are visible
    await expect(page.locator('[data-testid="total-revenue-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="platform-commission-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-bookings-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="commission-rate-card"]')).toBeVisible();

    // Calculate expected totals (only completed bookings)
    const completedBookings = testBookings.filter(b => b.status === 'completed');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const platformCommission = totalRevenue * 0.2; // 20% commission
    const totalBookingsCount = completedBookings.length;

    // Verify total revenue
    await expect(page.locator('[data-testid="total-revenue-card"]')).toContainText('¥90,000');

    // Verify platform commission (20%)
    await expect(page.locator('[data-testid="platform-commission-card"]')).toContainText('¥18,000');

    // Verify total bookings count
    await expect(page.locator('[data-testid="total-bookings-card"]')).toContainText('4');

    // Verify commission rate
    await expect(page.locator('[data-testid="commission-rate-card"]')).toContainText('20.0%');
  });

  test('should toggle between weekly and monthly views', async ({ page }) => {
    await authUtils.signIn(testAdmin.email);
    await page.goto('/dashboard/admin/earnings');

    // Default should be monthly view
    await expect(page.locator('[data-testid="monthly-toggle"]')).toHaveClass(/active|selected/);

    // Switch to weekly view
    await page.click('[data-testid="weekly-toggle"]');
    await expect(page.locator('[data-testid="weekly-toggle"]')).toHaveClass(/active|selected/);

    // Verify chart updates
    await expect(page.locator('[data-testid="earnings-chart"]')).toBeVisible();
    await expect(page.locator('text=Weekly')).toBeVisible();

    // Switch back to monthly view
    await page.click('[data-testid="monthly-toggle"]');
    await expect(page.locator('[data-testid="monthly-toggle"]')).toHaveClass(/active|selected/);
    await expect(page.locator('text=Monthly')).toBeVisible();
  });

  test('should display top roles and cities analytics', async ({ page }) => {
    await authUtils.signIn(testAdmin.email);
    await page.goto('/dashboard/admin/earnings');

    // Verify top roles card is visible
    await expect(page.locator('[data-testid="top-roles-card"]')).toBeVisible();
    await expect(page.locator('text=Top Roles by Revenue')).toBeVisible();

    // Should show different service types
    await expect(page.locator('text=Music Production')).toBeVisible();
    await expect(page.locator('text=Mixing & Mastering')).toBeVisible();

    // Verify top cities card is visible
    await expect(page.locator('[data-testid="top-cities-card"]')).toBeVisible();
    await expect(page.locator('text=Top Cities by Bookings')).toBeVisible();

    // Should show booking locations
    await expect(page.locator('[data-testid="city-item"]')).toBeVisible();
  });

  test('should refresh data when refresh button is clicked', async ({ page }) => {
    await authUtils.signIn(testAdmin.email);
    await page.goto('/dashboard/admin/earnings');

    // Click refresh button
    await page.click('[data-testid="refresh-button"]');

    // Verify loading state
    await expect(page.locator('text=Refreshing...')).toBeVisible();

    // Wait for data to reload
    await expect(page.locator('text=Refreshing...')).not.toBeVisible();
    await expect(page.locator('[data-testid="total-revenue-card"]')).toBeVisible();
  });

  test('should prevent non-admin access', async ({ page }) => {
    // Create non-admin user
    const regularUser = TestDataFactory.createTestUser({ role: 'client' });
    await firestoreUtils.createTestUser(regularUser);

    // Sign in as regular user
    await authUtils.signIn(regularUser.email);

    // Try to access admin earnings
    await page.goto('/dashboard/admin/earnings');

    // Should be redirected to regular dashboard
    await page.waitForURL('/dashboard');
    await expect(page.url()).not.toContain('/admin/earnings');
  });

  test('should handle empty earnings data gracefully', async ({ page }) => {
    // Clean up all bookings to test empty state
    await firestoreUtils.cleanupTestData();

    await authUtils.signIn(testAdmin.email);
    await page.goto('/dashboard/admin/earnings');

    // Verify empty state
    await expect(page.locator('text=No earnings data available')).toBeVisible();
    await expect(page.locator('text=no completed bookings')).toBeVisible();

    // Verify zero values in cards
    await expect(page.locator('[data-testid="total-revenue-card"]')).toContainText('¥0');
    await expect(page.locator('[data-testid="total-bookings-card"]')).toContainText('0');
  });

  test('should display earnings chart with correct data', async ({ page }) => {
    await authUtils.signIn(testAdmin.email);
    await page.goto('/dashboard/admin/earnings');

    // Verify chart container is visible
    await expect(page.locator('[data-testid="earnings-chart"]')).toBeVisible();

    // Check for chart elements (bars, axes, labels)
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();

    // Switch to weekly view and verify chart updates
    await page.click('[data-testid="weekly-toggle"]');
    await page.waitForTimeout(1000); // Wait for chart animation

    // Verify weekly chart shows different data
    await expect(page.locator('[data-testid="earnings-chart"]')).toBeVisible();
  });

  test('should show correct commission calculations', async ({ page }) => {
    await authUtils.signIn(testAdmin.email);
    await page.goto('/dashboard/admin/earnings');

    // Calculate expected values
    const completedBookings = testBookings.filter(b => b.status === 'completed');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const expectedCommission = totalRevenue * 0.2;

    // Verify commission calculation is correct
    await expect(page.locator('[data-testid="platform-commission-card"]')).toContainText(`¥${expectedCommission.toLocaleString()}`);

    // Commission rate should be 20%
    await expect(page.locator('[data-testid="commission-rate-card"]')).toContainText('20.0%');

    // Total revenue should include provider earnings + commission
    await expect(page.locator('[data-testid="total-revenue-card"]')).toContainText(`¥${totalRevenue.toLocaleString()}`);
  });

  test('should handle error states appropriately', async ({ page }) => {
    await authUtils.signIn(testAdmin.email);

    // Simulate network error by going offline
    await page.context().setOffline(true);
    await page.goto('/dashboard/admin/earnings');

    // Should show error state
    await expect(page.locator('text=Error Loading Earnings Data')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

    // Go back online and retry
    await page.context().setOffline(false);
    await page.click('[data-testid="retry-button"]');

    // Should load successfully
    await expect(page.locator('h1')).toContainText('Admin Earnings Dashboard');
  });

  test('should export earnings data', async ({ page }) => {
    await authUtils.signIn(testAdmin.email);
    await page.goto('/dashboard/admin/earnings');

    // Look for export functionality (if implemented)
    if (await page.locator('[data-testid="export-button"]').isVisible()) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download');
      
      await page.click('[data-testid="export-button"]');
      
      const download = await downloadPromise;
      
      // Verify download occurred
      expect(download.suggestedFilename()).toContain('earnings');
      expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|json)$/);
    }
  });

  test('should filter earnings by date range', async ({ page }) => {
    await authUtils.signIn(testAdmin.email);
    await page.goto('/dashboard/admin/earnings');

    // If date range filters exist
    if (await page.locator('[data-testid="date-from-input"]').isVisible()) {
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Set date range to last week only
      await page.fill('[data-testid="date-from-input"]', lastWeek.toISOString().split('T')[0]);
      await page.fill('[data-testid="date-to-input"]', lastWeek.toISOString().split('T')[0]);
      
      await page.click('[data-testid="apply-filter"]');
      
      // Should show only last week's earnings
      await expect(page.locator('[data-testid="total-revenue-card"]')).toContainText('¥20,000');
      await expect(page.locator('[data-testid="total-bookings-card"]')).toContainText('1');
    }
  });
});
