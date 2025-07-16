import { test, expect } from '@playwright/test';
import { 
  AuthUtils, 
  FirestoreUtils, 
  UIUtils, 
  TestDataFactory,
  TestUser
} from './utils/test-helpers';

test.describe('Verification System E2E', () => {
  let authUtils: AuthUtils;
  let firestoreUtils: FirestoreUtils;
  let uiUtils: UIUtils;
  let testUser: TestUser;
  let testAdmin: TestUser;

  test.beforeEach(async ({ page }) => {
    // Initialize utilities
    authUtils = new AuthUtils(page);
    firestoreUtils = new FirestoreUtils();
    uiUtils = new UIUtils(page);

    // Create test users
    testUser = TestDataFactory.createTestUser({ 
      role: 'creator',
      name: 'Test Creator',
      verified: false,
      points: 1000,
      profileCompleteness: 95
    });
    testAdmin = TestDataFactory.createTestUser({ 
      role: 'admin',
      name: 'Test Admin',
      verified: true
    });

    // Set up test data
    await firestoreUtils.createTestUser(testUser);
    await firestoreUtils.createTestUser(testAdmin);
  });

  test.afterEach(async () => {
    // Clean up test data
    await firestoreUtils.cleanupTestData();
  });

  test('should complete verification flow: user requests → admin approves → badge visible', async ({ page }) => {
    // Step 1: User requests verification
    await authUtils.loginAs(testUser);
    await page.goto(`/profile/${testUser.uid}`);
    
    // Verify user is not verified initially
    await expect(page.locator('[data-testid="verified-badge"]')).not.toBeVisible();
    
    // Find and click verification request button
    await page.click('[data-testid="apply-verification-button"]');
    
    // Fill verification form if present
    if (await page.locator('[data-testid="verification-form"]').isVisible()) {
      await page.fill('[data-testid="verification-reason"]', 'I am a professional creator with substantial experience');
      await page.click('[data-testid="submit-verification"]');
    }
    
    // Verify success message
    await expect(page.locator('text=Verification request submitted')).toBeVisible();
    
    // Step 2: Admin approves verification
    await authUtils.loginAs(testAdmin);
    await page.goto('/dashboard/admin/verifications');
    
    // Verify admin dashboard loads
    await expect(page.locator('text=Verification Applications')).toBeVisible();
    
    // Find the pending application
    const applicationCard = page.locator(`[data-testid="application-${testUser.uid}"]`);
    await expect(applicationCard).toBeVisible();
    
    // Click approve button
    await applicationCard.locator('[data-testid="approve-button"]').click();
    
    // Add review notes if prompted
    if (await page.locator('[data-testid="review-notes"]').isVisible()) {
      await page.fill('[data-testid="review-notes"]', 'Approved - profile meets all criteria');
      await page.click('[data-testid="confirm-approve"]');
    }
    
    // Verify success message
    await expect(page.locator('text=User verified successfully')).toBeVisible();
    
    // Step 3: Verify badge is visible on profile
    await page.goto(`/profile/${testUser.uid}`);
    await expect(page.locator('[data-testid="verified-badge"]')).toBeVisible();
    
    // Step 4: Verify badge is visible on explore page
    await page.goto('/explore');
    
    // Search for our test user
    await page.fill('[data-testid="search-input"]', testUser.name);
    await page.click('[data-testid="search-button"]');
    
    // Verify badge appears in search results
    const userCard = page.locator(`[data-testid="creator-card-${testUser.uid}"]`);
    await expect(userCard.locator('[data-testid="verified-badge"]')).toBeVisible();
    
    // Step 5: Verify badge persists on page refresh
    await page.reload();
    await expect(page.locator('[data-testid="verified-badge"]')).toBeVisible();
  });

  test('should handle verification rejection properly', async ({ page }) => {
    // Step 1: User requests verification
    await authUtils.loginAs(testUser);
    await page.goto(`/profile/${testUser.uid}`);
    await page.click('[data-testid="apply-verification-button"]');
    
    // Step 2: Admin rejects verification
    await authUtils.loginAs(testAdmin);
    await page.goto('/dashboard/admin/verifications');
    
    const applicationCard = page.locator(`[data-testid="application-${testUser.uid}"]`);
    await applicationCard.locator('[data-testid="reject-button"]').click();
    
    // Add rejection notes
    if (await page.locator('[data-testid="review-notes"]').isVisible()) {
      await page.fill('[data-testid="review-notes"]', 'Profile does not meet minimum criteria');
      await page.click('[data-testid="confirm-reject"]');
    }
    
    // Verify rejection message
    await expect(page.locator('text=User verification removed')).toBeVisible();
    
    // Step 3: Verify badge is NOT visible
    await page.goto(`/profile/${testUser.uid}`);
    await expect(page.locator('[data-testid="verified-badge"]')).not.toBeVisible();
  });

  test('should prevent non-admin users from accessing verification API', async ({ page }) => {
    // Try to access verification API as non-admin user
    await authUtils.loginAs(testUser);
    
    const response = await page.request.post(`/api/verify/${testUser.uid}`, {
      data: { verified: true, reviewNotes: 'Unauthorized attempt' }
    });
    
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toContain('Insufficient permissions');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await authUtils.loginAs(testAdmin);
    
    // Try to verify non-existent user
    const response = await page.request.post(`/api/verify/nonexistent-uid`, {
      data: { verified: true }
    });
    
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('User not found');
  });

  test('should display verification badge with correct styling', async ({ page }) => {
    // Set user as verified directly for styling test
    await firestoreUtils.updateUser(testUser.uid, { verified: true });
    
    await page.goto(`/profile/${testUser.uid}`);
    
    const badge = page.locator('[data-testid="verified-badge"]');
    await expect(badge).toBeVisible();
    
    // Check badge styling
    await expect(badge).toHaveClass(/bg-gradient-to-r/);
    await expect(badge).toHaveClass(/from-blue-500/);
    await expect(badge).toHaveClass(/text-white/);
    
    // Check badge text content
    await expect(badge).toContainText('Verified');
    
    // Check badge has proper accessibility
    await expect(badge).toHaveAttribute('title');
    await expect(badge).toHaveAttribute('aria-label');
  });
});