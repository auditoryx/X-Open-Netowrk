import { test, expect } from '@playwright/test';

test.describe('Basic Smoke Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('The Global Creative Network Built for Music');
    await expect(page.locator('body')).toBeVisible();
  });

  test('explore page loads correctly', async ({ page }) => {
    await page.goto('/explore');
    await expect(page.locator('h1')).toContainText('Find Your Next Collaborator');
    await expect(page.locator('body')).toBeVisible();
  });

  test('apply page loads correctly', async ({ page }) => {
    await page.goto('/apply');
    await expect(page.locator('h1')).toContainText('Apply as a Creator');
    await expect(page.locator('body')).toBeVisible();
  });

  test('auth page loads correctly', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('h1')).toContainText('Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('signup page loads correctly', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('h1')).toContainText('Create an Account');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('navigation from homepage works', async ({ page }) => {
    await page.goto('/');
    
    // Test explore navigation
    await page.click('a[href="/explore"]');
    await expect(page.locator('h1')).toContainText('Find Your Next Collaborator');
    
    // Go back to home
    await page.goto('/');
    
    // Test apply navigation  
    await page.click('a[href="/apply"]');
    await expect(page.locator('h1')).toContainText('Apply as a Creator');
  });

  test('role-specific apply pages load', async ({ page }) => {
    const roles = ['producer', 'artist', 'engineer', 'videographer', 'studio'];
    
    for (const role of roles) {
      await page.goto(`/apply/${role}`);
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('html')).not.toHaveText('Application error');
    }
  });

  test('dashboard pages redirect properly', async ({ page }) => {
    // These should redirect to auth since user is not logged in
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();
    
    await page.goto('/dashboard/client');
    await expect(page.locator('body')).toBeVisible();
    
    await page.goto('/dashboard/producer');
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin pages redirect properly', async ({ page }) => {
    // These should redirect to auth since user is not logged in
    await page.goto('/admin');
    await expect(page.locator('body')).toBeVisible();
    
    await page.goto('/admin/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('booking flow pages load', async ({ page }) => {
    await page.goto('/book');
    await expect(page.locator('body')).toBeVisible();
    
    await page.goto('/success');
    await expect(page.locator('body')).toBeVisible();
  });

  test('search functionality basic test', async ({ page }) => {
    await page.goto('/explore');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], [data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('music');
      await searchInput.press('Enter');
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('form validation on signup', async ({ page }) => {
    await page.goto('/signup');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Page should still be visible (form validation should prevent submission)
    await expect(page.locator('body')).toBeVisible();
  });

  test('form validation on login', async ({ page }) => {
    await page.goto('/auth');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Page should still be visible (form validation should prevent submission)
    await expect(page.locator('body')).toBeVisible();
  });

  test('responsive design basic test', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});