import { test, expect } from '@playwright/test';

const TEST_ROUTES = [
  '/',
  '/explore', 
  '/about',
  '/login',
  '/dashboard',
  '/apply',
  '/contact',
  '/search',
  '/privacy-policy',
  '/terms-of-service',
  '/not-found'
];

test.describe('Page Navigation Audit', () => {
  TEST_ROUTES.forEach((route) => {
    test(`Route ${route} should load without crashing`, async ({ page }) => {
      // Navigate to the route
      await page.goto(route);
      
      // Check that we don't have a global error boundary active
      const globalErrorHeading = page.locator('h1:has-text("Application Error")');
      await expect(globalErrorHeading).toHaveCount(0);
      
      // Check that the page has a title
      await expect(page).toHaveTitle(/AuditoryX/);
      
      // If there's a smoke test button, click it
      const smokeTestButton = page.locator('[data-testid="smoke"]');
      const smokeTestCount = await smokeTestButton.count();
      
      if (smokeTestCount > 0) {
        await smokeTestButton.click();
        test.info().log(`✅ Smoke test clicked for ${route}`);
      } else {
        test.info().log(`⚠️ No smoke test found for ${route}`);
      }
    });
  });
});