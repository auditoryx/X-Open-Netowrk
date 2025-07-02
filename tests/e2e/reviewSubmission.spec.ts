import { test, expect } from '@playwright/test';
import { 
  AuthUtils, 
  FirestoreUtils, 
  UIUtils, 
  TestDataFactory,
  TestUser,
  TestBooking
} from './utils/test-helpers';

test.describe('Review Submission E2E', () => {
  let authUtils: AuthUtils;
  let firestoreUtils: FirestoreUtils;
  let uiUtils: UIUtils;
  let testClient: TestUser;
  let testProvider: TestUser;
  let completedBooking: TestBooking;

  test.beforeEach(async ({ page }) => {
    // Initialize utilities
    authUtils = new AuthUtils(page);
    firestoreUtils = new FirestoreUtils();
    uiUtils = new UIUtils(page);

    // Create test users
    testClient = TestDataFactory.createTestUser({ role: 'client' });
    testProvider = TestDataFactory.createTestProvider();
    
    // Create completed booking
    completedBooking = TestDataFactory.createTestBooking(
      testClient.uid,
      testProvider.uid,
      { status: 'completed' }
    );

    // Set up test data
    await firestoreUtils.createTestUser(testClient);
    await firestoreUtils.createTestUser(testProvider);
    await firestoreUtils.createTestBooking(completedBooking);
  });

  test.afterEach(async () => {
    // Clean up test data
    await firestoreUtils.cleanupTestData();
  });

  test('should submit review for completed booking', async ({ page }) => {
    // Sign in as client
    await authUtils.signIn(testClient.email);

    // Navigate to completed bookings
    await page.goto('/dashboard/bookings');
    await page.click('[data-testid="completed-tab"]');

    // Verify completed booking is visible
    await expect(page.locator('[data-testid="booking-card"]')).toBeVisible();
    await expect(page.locator('text=' + testProvider.displayName)).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();

    // Click review button
    await page.click('[data-testid="leave-review-button"]');

    // Verify review form opens
    await expect(page.locator('h2')).toContainText('Leave a Review');
    await expect(page.locator('text=' + testProvider.displayName)).toBeVisible();

    // Submit 5-star review
    await uiUtils.submitReview(5, 'Amazing session! Professional, creative, and delivered exactly what I was looking for. Highly recommended!');

    // Verify success
    await uiUtils.waitForToast('Review submitted successfully');
    await expect(page.locator('text=Thank you for your feedback')).toBeVisible();

    // Verify review appears in booking history
    await page.goto('/dashboard/bookings');
    await page.click('[data-testid="completed-tab"]');
    await expect(page.locator('text=Review submitted')).toBeVisible();
    await expect(page.locator('[data-testid="review-stars"]')).toBeVisible();
  });

  test('should validate review form fields', async ({ page }) => {
    await authUtils.signIn(testClient.email);
    await page.goto('/dashboard/bookings');
    await page.click('[data-testid="completed-tab"]');
    await page.click('[data-testid="leave-review-button"]');

    // Try to submit without rating
    await page.fill('[data-testid="review-comment"]', 'Great session!');
    await page.click('[data-testid="submit-review"]');

    // Verify validation error
    await expect(page.locator('text=Please select a rating')).toBeVisible();

    // Try to submit without comment
    await page.click('[data-testid="star-5"]');
    await page.fill('[data-testid="review-comment"]', '');
    await page.click('[data-testid="submit-review"]');

    // Verify validation error
    await expect(page.locator('text=Please write a comment')).toBeVisible();

    // Try comment that's too short
    await page.fill('[data-testid="review-comment"]', 'Ok');
    await page.click('[data-testid="submit-review"]');

    // Verify validation error
    await expect(page.locator('text=Comment must be at least 10 characters')).toBeVisible();
  });

  test('should prevent duplicate reviews', async ({ page }) => {
    // Create existing review
    await firestoreUtils.db.collection('reviews').add({
      bookingId: completedBooking.id,
      clientId: testClient.uid,
      providerId: testProvider.uid,
      rating: 4,
      comment: 'Previous review',
      createdAt: new Date().toISOString()
    });

    await authUtils.signIn(testClient.email);
    await page.goto('/dashboard/bookings');
    await page.click('[data-testid="completed-tab"]');

    // Review button should be disabled or hidden
    await expect(page.locator('[data-testid="leave-review-button"]')).not.toBeVisible();
    await expect(page.locator('text=Review submitted')).toBeVisible();

    // Verify existing review is shown
    await expect(page.locator('[data-testid="existing-review"]')).toBeVisible();
    await expect(page.locator('text=Previous review')).toBeVisible();
  });

  test('should allow editing review within time limit', async ({ page }) => {
    // Create recent review (within edit window)
    const recentReview = {
      id: 'test-review-123',
      bookingId: completedBooking.id,
      clientId: testClient.uid,
      providerId: testProvider.uid,
      rating: 3,
      comment: 'Initial review to be edited',
      createdAt: new Date().toISOString(),
      canEdit: true
    };

    await firestoreUtils.db.collection('reviews').doc(recentReview.id).set(recentReview);

    await authUtils.signIn(testClient.email);
    await page.goto('/dashboard/bookings');
    await page.click('[data-testid="completed-tab"]');

    // Edit button should be visible
    await expect(page.locator('[data-testid="edit-review-button"]')).toBeVisible();
    await page.click('[data-testid="edit-review-button"]');

    // Update review
    await page.click('[data-testid="star-5"]');
    await page.fill('[data-testid="review-comment"]', 'Updated review with much more detail and positive feedback!');
    await page.click('[data-testid="update-review"]');

    // Verify update success
    await uiUtils.waitForToast('Review updated successfully');
    await expect(page.locator('text=Updated review')).toBeVisible();
  });

  test('should show review on provider profile', async ({ page }) => {
    // Submit review first
    await authUtils.signIn(testClient.email);
    await page.goto('/dashboard/bookings');
    await page.click('[data-testid="completed-tab"]');
    await page.click('[data-testid="leave-review-button"]');
    
    await uiUtils.submitReview(5, 'Fantastic producer! Great communication and amazing results.');

    // Sign out and view provider profile
    await authUtils.signOut();
    await page.goto(`/profile/${testProvider.uid}`);

    // Verify review appears on profile
    await expect(page.locator('[data-testid="review-card"]')).toBeVisible();
    await expect(page.locator('text=Fantastic producer')).toBeVisible();
    await expect(page.locator('[data-testid="review-rating"]')).toContainText('5');
    await expect(page.locator('text=' + testClient.displayName)).toBeVisible();

    // Verify rating aggregation
    await expect(page.locator('[data-testid="average-rating"]')).toContainText('5.0');
    await expect(page.locator('[data-testid="review-count"]')).toContainText('1 review');
  });

  test('should handle low rating with required explanation', async ({ page }) => {
    await authUtils.signIn(testClient.email);
    await page.goto('/dashboard/bookings');
    await page.click('[data-testid="completed-tab"]');
    await page.click('[data-testid="leave-review-button"]');

    // Select low rating (1-2 stars)
    await page.click('[data-testid="star-2"]');
    
    // Try to submit with short comment
    await page.fill('[data-testid="review-comment"]', 'Not good');
    await page.click('[data-testid="submit-review"]');

    // Should require detailed explanation for low ratings
    await expect(page.locator('text=Please provide detailed feedback for ratings below 3 stars')).toBeVisible();

    // Provide detailed feedback
    await page.fill('[data-testid="review-comment"]', 'The session did not meet expectations. The producer was late, equipment had issues, and the final output quality was below industry standards. Communication was poor throughout the process.');
    await page.click('[data-testid="submit-review"]');

    // Should succeed with detailed feedback
    await uiUtils.waitForToast('Review submitted successfully');
  });

  test('should notify provider of new review', async ({ page }) => {
    // Submit review as client
    await authUtils.signIn(testClient.email);
    await page.goto('/dashboard/bookings');
    await page.click('[data-testid="completed-tab"]');
    await page.click('[data-testid="leave-review-button"]');
    
    await uiUtils.submitReview(4, 'Great session with professional results!');

    // Sign out and sign in as provider
    await authUtils.signOut();
    await authUtils.signIn(testProvider.email);

    // Check notifications
    await page.goto('/dashboard/notifications');
    await expect(page.locator('[data-testid="notification-card"]')).toBeVisible();
    await expect(page.locator('text=New review received')).toBeVisible();
    await expect(page.locator('text=' + testClient.displayName)).toBeVisible();

    // Click notification to view review
    await page.click('[data-testid="review-notification"]');
    await expect(page.locator('text=Great session')).toBeVisible();
    await expect(page.locator('[data-testid="review-rating"]')).toContainText('4');
  });

  test('should filter and sort reviews', async ({ page }) => {
    // Create multiple reviews with different ratings
    const reviews = [
      { rating: 5, comment: 'Excellent work!', clientName: 'Client A' },
      { rating: 3, comment: 'Average session', clientName: 'Client B' },
      { rating: 4, comment: 'Good experience', clientName: 'Client C' },
      { rating: 2, comment: 'Below expectations', clientName: 'Client D' }
    ];

    for (const review of reviews) {
      const clientUser = TestDataFactory.createTestUser({ 
        displayName: review.clientName 
      });
      const booking = TestDataFactory.createTestBooking(
        clientUser.uid,
        testProvider.uid,
        { status: 'completed' }
      );
      
      await firestoreUtils.createTestUser(clientUser);
      await firestoreUtils.createTestBooking(booking);
      
      await firestoreUtils.db.collection('reviews').add({
        bookingId: booking.id,
        clientId: clientUser.uid,
        providerId: testProvider.uid,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date().toISOString()
      });
    }

    // View provider profile
    await page.goto(`/profile/${testProvider.uid}`);

    // Test rating filter
    await page.selectOption('[data-testid="rating-filter"]', '5');
    await expect(page.locator('[data-testid="review-card"]')).toHaveCount(1);
    await expect(page.locator('text=Excellent work')).toBeVisible();

    // Test sorting
    await page.selectOption('[data-testid="rating-filter"]', 'all');
    await page.selectOption('[data-testid="sort-reviews"]', 'rating-desc');
    
    const reviewCards = page.locator('[data-testid="review-card"]');
    await expect(reviewCards.first()).toContainText('5');
    
    await page.selectOption('[data-testid="sort-reviews"]', 'rating-asc');
    await expect(reviewCards.first()).toContainText('2');
  });

  test('should handle review reporting', async ({ page }) => {
    // Create inappropriate review
    await firestoreUtils.db.collection('reviews').add({
      bookingId: completedBooking.id,
      clientId: 'other-client',
      providerId: testProvider.uid,
      rating: 1,
      comment: 'This review contains inappropriate content that should be reported',
      createdAt: new Date().toISOString()
    });

    await page.goto(`/profile/${testProvider.uid}`);

    // Report review
    await page.click('[data-testid="review-menu"]');
    await page.click('[data-testid="report-review"]');

    // Fill report form
    await page.selectOption('[data-testid="report-reason"]', 'inappropriate');
    await page.fill('[data-testid="report-details"]', 'Contains offensive language and false claims');
    await page.click('[data-testid="submit-report"]');

    // Verify report submitted
    await uiUtils.waitForToast('Review reported successfully');
    await expect(page.locator('text=Thank you for your report')).toBeVisible();
  });
});
