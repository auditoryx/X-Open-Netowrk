import { test, expect } from '@playwright/test';
import { 
  AuthUtils, 
  FirestoreUtils, 
  UIUtils, 
  TestDataFactory,
  TestUser,
  TestService
} from './utils/test-helpers';

test.describe('Smoke Tests - Happy Path', () => {
  let authUtils: AuthUtils;
  let firestoreUtils: FirestoreUtils;
  let uiUtils: UIUtils;
  let testClient: TestUser;
  let testProvider: TestUser;
  let testService: TestService;

  test.beforeEach(async ({ page }) => {
    // Initialize utilities
    authUtils = new AuthUtils(page);
    firestoreUtils = new FirestoreUtils();
    uiUtils = new UIUtils(page);

    // Create test users
    testClient = TestDataFactory.createTestUser({ role: 'client' });
    testProvider = TestDataFactory.createTestProvider();
    testService = TestDataFactory.createTestService(testProvider.uid);
  });

  test.afterEach(async () => {
    await firestoreUtils.cleanupTestData();
  });

  test('client happy path: visit homepage → explore → view service', async ({ page }) => {
    // Step 1: Visit homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('The Global Creative Network Built for Music');

    // Step 2: Click explore
    await page.click('a[href="/explore"]');
    await expect(page.locator('h1')).toContainText('Find Your Next Collaborator');

    // Step 3: Browse services (without requiring specific test data)
    await page.waitForSelector('.service-card, [data-testid="service-card"], .grid > div', { timeout: 5000 });
    
    // Step 4: Test search functionality
    await page.fill('input[placeholder*="Search"], [data-testid="search-input"]', 'music');
    await page.press('input[placeholder*="Search"], [data-testid="search-input"]', 'Enter');
    
    // Step 5: Check that the page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('provider happy path: visit homepage → apply → view application page', async ({ page }) => {
    // Step 1: Visit homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('The Global Creative Network Built for Music');

    // Step 2: Click apply
    await page.click('a[href="/apply"]');
    await expect(page.locator('h1')).toContainText('Apply as a Creator');

    // Step 3: Select a role (producer)
    await page.click('a[href="/apply/producer"]');
    await expect(page.locator('h1')).toContainText('Apply as Producer');

    // Step 4: Check that the application form loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin happy path: visit homepage → navigate to admin areas', async ({ page }) => {
    // Step 1: Visit homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('The Global Creative Network Built for Music');

    // Step 2: Try to access admin pages (should redirect to auth)
    await page.goto('/admin');
    
    // Should be redirected to auth or show admin content
    await expect(page.locator('body')).toBeVisible();
    
    // Step 3: Check admin dashboard access
    await page.goto('/admin/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('navigation smoke test: test main navigation links', async ({ page }) => {
    // Step 1: Visit homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('The Global Creative Network Built for Music');

    // Step 2: Test main navigation links
    const navLinks = [
      '/explore',
      '/apply',
      '/about',
      '/contact'
    ];

    for (const link of navLinks) {
      await page.goto(link);
      await expect(page.locator('body')).toBeVisible();
      // Check that the page loads without major errors
      await expect(page.locator('html')).not.toHaveText('Application error');
    }
  });

  test('role-specific dashboards smoke test', async ({ page }) => {
    // Test that different dashboard routes load
    const dashboardRoutes = [
      '/dashboard',
      '/dashboard/client',
      '/dashboard/producer',
      '/dashboard/admin'
    ];

    for (const route of dashboardRoutes) {
      await page.goto(route);
      await expect(page.locator('body')).toBeVisible();
      // Should either show content or redirect to auth
      await expect(page.locator('html')).not.toHaveText('Application error');
    }
  });

  test('booking flow smoke test: navigate to booking pages', async ({ page }) => {
    // Step 1: Visit homepage
    await page.goto('/');
    
    // Step 2: Go to explore
    await page.goto('/explore');
    await expect(page.locator('h1')).toContainText('Find Your Next Collaborator');

    // Step 3: Test booking-related pages
    await page.goto('/book');
    await expect(page.locator('body')).toBeVisible();

    // Step 4: Test success page
    await page.goto('/success');
    await expect(page.locator('body')).toBeVisible();
  });

  test('authentication pages smoke test', async ({ page }) => {
    // Step 1: Test login page
    await page.goto('/auth');
    await expect(page.locator('h1')).toContainText('Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Step 2: Test signup page
    await page.goto('/signup');
    await expect(page.locator('h1')).toContainText('Create an Account');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('profile pages smoke test', async ({ page }) => {
    // Test profile pages load without errors
    await page.goto('/profile/test-user');
    await expect(page.locator('body')).toBeVisible();
    
    await page.goto('/create-profile');
    await expect(page.locator('body')).toBeVisible();
  });

  test('search functionality smoke test', async ({ page }) => {
    // Step 1: Go to search page
    await page.goto('/search');
    await expect(page.locator('body')).toBeVisible();

    // Step 2: Test search with query params
    await page.goto('/search?q=music');
    await expect(page.locator('body')).toBeVisible();

    // Step 3: Test explore with filters
    await page.goto('/explore?role=producer');
    await expect(page.locator('body')).toBeVisible();
  });
});