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

test.describe('Admin Role Smoke Test', () => {
  let authUtils: AuthUtils;
  let firestoreUtils: FirestoreUtils;
  let uiUtils: UIUtils;
  let stripeUtils: StripeUtils;
  let testAdmin: TestUser;
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
    testAdmin = TestDataFactory.createTestAdmin();
    testProvider = TestDataFactory.createTestProvider();
    testClient = TestDataFactory.createTestUser({ role: 'client' });
    testService = TestDataFactory.createTestService(testProvider.uid);

    // Set up test data
    await firestoreUtils.createTestUser(testAdmin);
    await firestoreUtils.createTestUser(testProvider);
    await firestoreUtils.createTestUser(testClient);
    await firestoreUtils.createTestService(testService);
  });

  test.afterEach(async () => {
    await firestoreUtils.cleanupTestData();
  });

  test('admin smoke test: sign-up → verify users → manage platform → view analytics', async ({ page }) => {
    // Step 1: Sign in as admin
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', testAdmin.email);
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="signin-button"]');

    // Should redirect to admin dashboard
    await page.waitForURL('**/admin/**', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Admin Dashboard');

    // Step 2: Review user applications
    await page.click('[data-testid="nav-applications"]');
    await expect(page.locator('h1')).toContainText('User Applications');

    // Create pending application
    const pendingProvider = TestDataFactory.createTestProvider({
      verified: false,
      approved: false
    });
    await firestoreUtils.createTestUser(pendingProvider);

    await page.reload();
    await expect(page.locator(`[data-testid="application-${pendingProvider.uid}"]`)).toBeVisible();

    // Step 3: Review application details
    await page.click(`[data-testid="review-application-${pendingProvider.uid}"]`);
    await expect(page.locator('h1')).toContainText('Review Application');
    await expect(page.locator('text=' + pendingProvider.displayName)).toBeVisible();
    await expect(page.locator('text=' + pendingProvider.email)).toBeVisible();

    // Check portfolio links
    await expect(page.locator('[data-testid="portfolio-links"]')).toBeVisible();
    await expect(page.locator('[data-testid="bio-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="genre-tags"]')).toBeVisible();

    // Step 4: Approve application
    await page.fill('[data-testid="admin-notes"]', 'Good portfolio, approved for platform');
    await page.click('[data-testid="approve-application"]');
    await expect(page.locator('text=Application approved')).toBeVisible();

    // Step 5: Verify user status updated
    await page.goto('/admin/users');
    await expect(page.locator('text=' + pendingProvider.displayName)).toBeVisible();
    await expect(page.locator('text=Approved')).toBeVisible();

    // Step 6: Manage platform settings
    await page.click('[data-testid="nav-settings"]');
    await expect(page.locator('h1')).toContainText('Platform Settings');

    // Update commission rates
    await page.fill('[data-testid="commission-rate"]', '10');
    await page.fill('[data-testid="payment-processing-fee"]', '2.9');
    await page.click('[data-testid="save-settings"]');
    await uiUtils.waitForToast('Settings updated successfully');

    // Step 7: View platform analytics
    await page.click('[data-testid="nav-analytics"]');
    await expect(page.locator('h1')).toContainText('Platform Analytics');

    // Check key metrics
    await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-bookings"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-services"]')).toBeVisible();

    // Check analytics charts
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-growth-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-trend-chart"]')).toBeVisible();

    // Step 8: Export analytics data
    await page.click('[data-testid="export-analytics"]');
    await expect(page.locator('text=Analytics exported')).toBeVisible();

    // Step 9: View earnings dashboard
    await page.click('[data-testid="nav-earnings"]');
    await expect(page.locator('h1')).toContainText('Admin Earnings');

    // Check earnings summary
    await expect(page.locator('[data-testid="total-commission"]')).toBeVisible();
    await expect(page.locator('[data-testid="monthly-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="top-earners"]')).toBeVisible();

    // Toggle between weekly and monthly views
    await page.click('[data-testid="monthly-view"]');
    await expect(page.locator('[data-testid="monthly-chart"]')).toBeVisible();

    await page.click('[data-testid="weekly-view"]');
    await expect(page.locator('[data-testid="weekly-chart"]')).toBeVisible();
  });

  test('admin smoke test: user management and moderation', async ({ page }) => {
    // Sign in as admin
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', testAdmin.email);
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="signin-button"]');

    // Navigate to user management
    await page.goto('/admin/users');
    await expect(page.locator('h1')).toContainText('User Management');

    // Search for specific user
    await page.fill('[data-testid="user-search"]', testProvider.email);
    await page.click('[data-testid="search-users"]');
    await expect(page.locator('text=' + testProvider.displayName)).toBeVisible();

    // View user details
    await page.click(`[data-testid="view-user-${testProvider.uid}"]`);
    await expect(page.locator('h1')).toContainText('User Details');
    await expect(page.locator('text=' + testProvider.email)).toBeVisible();

    // Check user activity
    await expect(page.locator('[data-testid="user-bookings"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-services"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-reviews"]')).toBeVisible();

    // Test user actions
    await page.click('[data-testid="user-actions-menu"]');
    await expect(page.locator('[data-testid="suspend-user"]')).toBeVisible();
    await expect(page.locator('[data-testid="ban-user"]')).toBeVisible();
    await expect(page.locator('[data-testid="reset-password"]')).toBeVisible();

    // Suspend user temporarily
    await page.click('[data-testid="suspend-user"]');
    await page.fill('[data-testid="suspension-reason"]', 'Violation of terms of service');
    await page.fill('[data-testid="suspension-duration"]', '7');
    await page.click('[data-testid="confirm-suspension"]');
    await uiUtils.waitForToast('User suspended successfully');

    // Verify suspension appears in activity log
    await page.goto('/admin/activity-log');
    await expect(page.locator('text=User suspended')).toBeVisible();
    await expect(page.locator('text=' + testProvider.displayName)).toBeVisible();

    // Test unsuspend
    await page.goto(`/admin/users/${testProvider.uid}`);
    await page.click('[data-testid="unsuspend-user"]');
    await page.fill('[data-testid="unsuspension-reason"]', 'Issue resolved');
    await page.click('[data-testid="confirm-unsuspension"]');
    await uiUtils.waitForToast('User unsuspended successfully');
  });

  test('admin smoke test: content moderation and service management', async ({ page }) => {
    // Sign in as admin
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', testAdmin.email);
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="signin-button"]');

    // Navigate to content moderation
    await page.goto('/admin/moderation');
    await expect(page.locator('h1')).toContainText('Content Moderation');

    // Check reported content
    await page.click('[data-testid="reported-services"]');
    await expect(page.locator('[data-testid="reported-content-list"]')).toBeVisible();

    // Create a reported service for testing
    const reportedService = TestDataFactory.createTestService(testProvider.uid, {
      title: 'Potentially Inappropriate Service',
      description: 'This service might violate platform guidelines'
    });
    await firestoreUtils.createTestService(reportedService);

    // Simulate report
    await page.goto(`/admin/moderation/service/${reportedService.id}`);
    await expect(page.locator('h1')).toContainText('Review Service');
    await expect(page.locator('text=' + reportedService.title)).toBeVisible();

    // Review service content
    await expect(page.locator('[data-testid="service-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="service-images"]')).toBeVisible();
    await expect(page.locator('[data-testid="service-samples"]')).toBeVisible();

    // Take moderation action
    await page.click('[data-testid="service-actions"]');
    await page.click('[data-testid="flag-inappropriate"]');
    await page.fill('[data-testid="moderation-notes"]', 'Service title needs to be more professional');
    await page.click('[data-testid="request-revision"]');
    await uiUtils.waitForToast('Revision requested');

    // Check service management
    await page.goto('/admin/services');
    await expect(page.locator('h1')).toContainText('Service Management');

    // Filter services
    await page.selectOption('[data-testid="status-filter"]', 'flagged');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('text=' + reportedService.title)).toBeVisible();

    // Bulk actions
    await page.click(`[data-testid="select-service-${reportedService.id}"]`);
    await page.click('[data-testid="bulk-actions"]');
    await page.click('[data-testid="bulk-approve"]');
    await uiUtils.waitForToast('Services approved');
  });

  test('admin smoke test: financial management and payouts', async ({ page }) => {
    // Create booking with completed status for financial data
    const completedBooking = TestDataFactory.createTestBooking(testClient.uid, testProvider.uid, {
      status: 'completed',
      totalAmount: 25000
    });
    await firestoreUtils.createTestBooking(completedBooking);

    // Sign in as admin
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', testAdmin.email);
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="signin-button"]');

    // Navigate to financial management
    await page.goto('/admin/finance');
    await expect(page.locator('h1')).toContainText('Financial Management');

    // Check pending payouts
    await page.click('[data-testid="pending-payouts"]');
    await expect(page.locator('[data-testid="payout-list"]')).toBeVisible();
    await expect(page.locator('text=' + testProvider.displayName)).toBeVisible();

    // Process payout
    await page.click(`[data-testid="process-payout-${testProvider.uid}"]`);
    await expect(page.locator('h1')).toContainText('Process Payout');
    await expect(page.locator('text=¥25,000')).toBeVisible();

    // Verify payout details
    await page.click('[data-testid="confirm-payout"]');
    await page.fill('[data-testid="payout-notes"]', 'Weekly payout processed');
    await page.click('[data-testid="process-payout-button"]');
    await uiUtils.waitForToast('Payout processed successfully');

    // Check transaction history
    await page.goto('/admin/finance/transactions');
    await expect(page.locator('h1')).toContainText('Transaction History');
    await expect(page.locator('text=Payout processed')).toBeVisible();

    // View financial reports
    await page.click('[data-testid="financial-reports"]');
    await expect(page.locator('h1')).toContainText('Financial Reports');

    // Generate monthly report
    await page.click('[data-testid="generate-monthly-report"]');
    await page.selectOption('[data-testid="report-month"]', new Date().toISOString().slice(0, 7));
    await page.click('[data-testid="generate-report"]');
    await expect(page.locator('text=Report generated')).toBeVisible();

    // Check revenue breakdown
    await expect(page.locator('[data-testid="gross-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="net-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="commission-earned"]')).toBeVisible();
    await expect(page.locator('[data-testid="processing-fees"]')).toBeVisible();

    // Export financial data
    await page.click('[data-testid="export-financial-data"]');
    await page.selectOption('[data-testid="export-format"]', 'csv');
    await page.click('[data-testid="export-button"]');
    await expect(page.locator('text=Export completed')).toBeVisible();
  });

  test('admin smoke test: system monitoring and health checks', async ({ page }) => {
    // Sign in as admin
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', testAdmin.email);
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="signin-button"]');

    // Navigate to system monitoring
    await page.goto('/admin/system');
    await expect(page.locator('h1')).toContainText('System Monitoring');

    // Check system health
    await expect(page.locator('[data-testid="system-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="database-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-system-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-system-status"]')).toBeVisible();

    // Check performance metrics
    await page.click('[data-testid="performance-metrics"]');
    await expect(page.locator('[data-testid="response-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="uptime"]')).toBeVisible();

    // View system logs
    await page.click('[data-testid="system-logs"]');
    await expect(page.locator('h1')).toContainText('System Logs');
    await expect(page.locator('[data-testid="log-entries"]')).toBeVisible();

    // Filter logs
    await page.selectOption('[data-testid="log-level"]', 'error');
    await page.click('[data-testid="apply-log-filter"]');
    await expect(page.locator('[data-testid="filtered-logs"]')).toBeVisible();

    // Check error notifications
    await page.goto('/admin/notifications');
    await expect(page.locator('h1')).toContainText('System Notifications');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();

    // Configure alerts
    await page.click('[data-testid="configure-alerts"]');
    await expect(page.locator('h1')).toContainText('Alert Configuration');
    
    await page.fill('[data-testid="error-threshold"]', '5');
    await page.fill('[data-testid="response-time-threshold"]', '2000');
    await page.click('[data-testid="save-alert-config"]');
    await uiUtils.waitForToast('Alert configuration saved');
  });
});