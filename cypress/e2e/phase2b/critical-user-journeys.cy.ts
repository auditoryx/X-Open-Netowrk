/**
 * Phase 2B: Critical User Journey E2E Tests
 * 
 * Comprehensive end-to-end testing to achieve 90% critical path coverage
 * Target: Complete user registration to first booking flow
 */

describe('Phase 2B: Critical User Journeys', () => {
  beforeEach(() => {
    // Clear application state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  describe('User Registration and Onboarding Flow', () => {
    it('should complete the full user registration journey', () => {
      // Visit landing page
      cy.visit('/');
      cy.wait(1000); // Allow for lazy loading
      
      // Track performance
      cy.window().then((win) => {
        expect(win.performance.now()).to.be.greaterThan(0);
      });

      // Start registration
      cy.get('[data-testid="get-started-button"]').should('be.visible').click();
      
      // Fill registration form
      cy.get('[data-testid="email-input"]').type('testuser@example.com');
      cy.get('[data-testid="password-input"]').type('SecurePassword123!');
      cy.get('[data-testid="confirm-password-input"]').type('SecurePassword123!');
      cy.get('[data-testid="terms-checkbox"]').check();
      cy.get('[data-testid="submit-registration"]').click();

      // Verify email verification step
      cy.url().should('include', '/verify-email');
      cy.get('[data-testid="verification-message"]').should('contain', 'check your email');

      // Mock email verification (in real test, would check email service)
      cy.window().then((win) => {
        // Simulate email verification
        win.localStorage.setItem('emailVerified', 'true');
      });

      // Continue to role selection
      cy.visit('/onboarding/role-selection');
      cy.get('[data-testid="role-creator"]').click();
      cy.get('[data-testid="continue-button"]').click();

      // Complete profile setup
      cy.url().should('include', '/onboarding/profile-setup');
      cy.get('[data-testid="display-name-input"]').type('Test Creator');
      cy.get('[data-testid="bio-textarea"]').type('I am a test creator for e2e testing');
      cy.get('[data-testid="save-profile"]').click();

      // Verify dashboard access
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="dashboard-header"]').should('contain', 'Welcome');
    });

    it('should handle registration errors gracefully', () => {
      cy.visit('/auth/register');
      
      // Test validation errors
      cy.get('[data-testid="submit-registration"]').click();
      cy.get('[data-testid="email-error"]').should('be.visible');
      cy.get('[data-testid="password-error"]').should('be.visible');

      // Test duplicate email
      cy.get('[data-testid="email-input"]').type('existing@example.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="terms-checkbox"]').check();
      cy.get('[data-testid="submit-registration"]').click();

      // Should show user-friendly error
      cy.get('[data-testid="error-message"]').should('contain', 'already exists');
    });
  });

  describe('Booking Creation Flow', () => {
    beforeEach(() => {
      // Login as a client user
      cy.login('client@example.com', 'Password123!');
      cy.visit('/dashboard');
    });

    it('should complete end-to-end booking with payment', () => {
      // Navigate to booking creation
      cy.get('[data-testid="create-booking-button"]').click();
      cy.url().should('include', '/booking/create');

      // Fill booking details
      cy.get('[data-testid="service-type-select"]').select('music-production');
      cy.get('[data-testid="project-title-input"]').type('Test Music Project');
      cy.get('[data-testid="project-description"]').type('This is a test booking for e2e testing');
      
      // Set budget and timeline
      cy.get('[data-testid="budget-input"]').type('500');
      cy.get('[data-testid="deadline-input"]').type('2024-12-31');
      
      // Upload test file (mock)
      cy.get('[data-testid="file-upload"]').should('be.visible');
      // cy.get('[data-testid="file-upload"]').selectFile('cypress/fixtures/test-audio.mp3');

      // Continue to creator selection
      cy.get('[data-testid="continue-to-creators"]').click();
      cy.url().should('include', '/booking/select-creator');

      // Search and select a creator
      cy.get('[data-testid="creator-search"]').type('test creator');
      cy.get('[data-testid="search-button"]').click();
      cy.get('[data-testid="creator-card"]').first().click();
      cy.get('[data-testid="select-creator-button"]').click();

      // Review booking details
      cy.url().should('include', '/booking/review');
      cy.get('[data-testid="booking-summary"]').should('be.visible');
      cy.get('[data-testid="total-amount"]').should('contain', '$500');
      
      // Proceed to payment
      cy.get('[data-testid="proceed-to-payment"]').click();
      cy.url().should('include', '/booking/payment');

      // Fill payment information (using Stripe test card)
      cy.get('[data-testid="card-number"]').type('4242424242424242');
      cy.get('[data-testid="card-expiry"]').type('12/25');
      cy.get('[data-testid="card-cvc"]').type('123');
      cy.get('[data-testid="billing-name"]').type('Test User');

      // Complete payment
      cy.get('[data-testid="complete-payment"]').click();
      
      // Verify success
      cy.url().should('include', '/booking/success');
      cy.get('[data-testid="success-message"]').should('contain', 'successfully created');
      cy.get('[data-testid="booking-id"]').should('be.visible');
    });

    it('should handle payment failures gracefully', () => {
      // Create booking up to payment step
      cy.visit('/booking/create');
      cy.fillBasicBookingDetails();
      cy.selectCreator();
      cy.proceedToPayment();

      // Use declined test card
      cy.get('[data-testid="card-number"]').type('4000000000000002');
      cy.get('[data-testid="card-expiry"]').type('12/25');
      cy.get('[data-testid="card-cvc"]').type('123');
      cy.get('[data-testid="billing-name"]').type('Test User');

      cy.get('[data-testid="complete-payment"]').click();

      // Should show user-friendly error
      cy.get('[data-testid="payment-error"]').should('contain', 'declined');
      cy.get('[data-testid="try-again-button"]').should('be.visible');
    });
  });

  describe('Creator Profile Management', () => {
    beforeEach(() => {
      cy.login('creator@example.com', 'Password123!');
    });

    it('should complete creator profile setup', () => {
      cy.visit('/profile/setup');

      // Basic information
      cy.get('[data-testid="artist-name"]').type('Test Artist');
      cy.get('[data-testid="genre-select"]').select('Hip Hop');
      cy.get('[data-testid="experience-select"]').select('5+ years');
      
      // Portfolio upload
      cy.get('[data-testid="portfolio-upload"]').should('be.visible');
      // Mock portfolio files
      cy.window().then((win) => {
        win.localStorage.setItem('portfolioUploaded', 'true');
      });

      // Pricing setup
      cy.get('[data-testid="hourly-rate"]').type('75');
      cy.get('[data-testid="project-rate"]').type('500');
      
      // Availability
      cy.get('[data-testid="monday-checkbox"]').check();
      cy.get('[data-testid="tuesday-checkbox"]').check();
      cy.get('[data-testid="wednesday-checkbox"]').check();

      // Save profile
      cy.get('[data-testid="save-profile"]').click();
      
      // Verify profile completion
      cy.get('[data-testid="profile-complete-message"]').should('be.visible');
      cy.url().should('include', '/dashboard');
    });

    it('should manage portfolio items', () => {
      cy.visit('/profile/portfolio');

      // Add new portfolio item
      cy.get('[data-testid="add-portfolio-item"]').click();
      cy.get('[data-testid="portfolio-title"]').type('Test Beat 1');
      cy.get('[data-testid="portfolio-description"]').type('A test beat for portfolio');
      cy.get('[data-testid="portfolio-genre"]').select('Trap');
      
      // Mock file upload
      cy.get('[data-testid="audio-upload"]').should('be.visible');
      
      cy.get('[data-testid="save-portfolio-item"]').click();
      
      // Verify item appears in list
      cy.get('[data-testid="portfolio-list"]').should('contain', 'Test Beat 1');
    });
  });

  describe('Search and Discovery', () => {
    it('should search creators with filters', () => {
      cy.visit('/search');

      // Basic search
      cy.get('[data-testid="search-input"]').type('music producer');
      cy.get('[data-testid="search-button"]').click();

      // Verify results load
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="result-count"]').should('contain', 'results');

      // Apply filters
      cy.get('[data-testid="genre-filter"]').select('Hip Hop');
      cy.get('[data-testid="price-range-min"]').type('50');
      cy.get('[data-testid="price-range-max"]').type('200');
      cy.get('[data-testid="rating-filter"]').select('4+');
      
      // Apply filters
      cy.get('[data-testid="apply-filters"]').click();

      // Verify filtered results
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.url().should('include', 'genre=hip-hop');
    });

    it('should view creator profiles from search', () => {
      cy.visit('/search?q=music+producer');
      
      // Click on first result
      cy.get('[data-testid="creator-result"]').first().click();
      
      // Verify profile page loads
      cy.url().should('include', '/profile/');
      cy.get('[data-testid="creator-name"]').should('be.visible');
      cy.get('[data-testid="creator-portfolio"]').should('be.visible');
      cy.get('[data-testid="contact-creator"]').should('be.visible');
    });
  });

  describe('Dashboard Navigation', () => {
    beforeEach(() => {
      cy.login('testuser@example.com', 'Password123!');
    });

    it('should navigate all dashboard sections', () => {
      cy.visit('/dashboard');

      // Test main dashboard
      cy.get('[data-testid="dashboard-overview"]').should('be.visible');
      cy.get('[data-testid="recent-activity"]').should('be.visible');

      // Navigate to bookings
      cy.get('[data-testid="nav-bookings"]').click();
      cy.url().should('include', '/dashboard/bookings');
      cy.get('[data-testid="bookings-list"]').should('be.visible');

      // Navigate to messages
      cy.get('[data-testid="nav-messages"]').click();
      cy.url().should('include', '/dashboard/messages');
      cy.get('[data-testid="messages-inbox"]').should('be.visible');

      // Navigate to profile
      cy.get('[data-testid="nav-profile"]').click();
      cy.url().should('include', '/dashboard/profile');
      cy.get('[data-testid="profile-settings"]').should('be.visible');

      // Navigate to settings
      cy.get('[data-testid="nav-settings"]').click();
      cy.url().should('include', '/dashboard/settings');
      cy.get('[data-testid="account-settings"]').should('be.visible');
    });
  });

  describe('Performance Validation', () => {
    it('should meet performance targets', () => {
      cy.visit('/');
      
      // Measure page load performance
      cy.window().then((win) => {
        const performance = win.performance;
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        // Time to First Byte should be < 600ms
        const ttfb = navigation.responseStart - navigation.requestStart;
        expect(ttfb).to.be.lessThan(600);
        
        // Load event should fire within reasonable time
        const loadTime = navigation.loadEventEnd - navigation.navigationStart;
        expect(loadTime).to.be.lessThan(3000);
      });

      // Check Core Web Vitals via performance API
      cy.window().then((win) => {
        if (win.performanceMonitor) {
          // LCP should be tracked
          expect(win.performanceMonitor.getMetrics()).to.have.property('largestContentfulPaint');
        }
      });
    });

    it('should load lazy components efficiently', () => {
      cy.visit('/dashboard');
      
      // Track lazy component loading
      cy.window().then((win) => {
        const observer = new win.PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name.includes('lazy') || entry.name.includes('chunk')) {
              const loadTime = entry.responseEnd - entry.requestStart;
              expect(loadTime).to.be.lessThan(1000); // Lazy chunks should load < 1s
            }
          });
        });
        observer.observe({ entryTypes: ['resource'] });
      });

      // Navigate to trigger lazy loading
      cy.get('[data-testid="nav-analytics"]').click();
      cy.wait(2000); // Allow time for lazy loading
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network failures gracefully', () => {
      // Simulate network failure
      cy.intercept('GET', '/api/**', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/dashboard');
      
      // Should show error state
      cy.get('[data-testid="error-boundary"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
      
      // Restore network and retry
      cy.intercept('GET', '/api/**').as('networkRestored');
      cy.get('[data-testid="retry-button"]').click();
      
      // Should recover and show content
      cy.get('[data-testid="dashboard-content"]').should('be.visible');
    });

    it('should handle API errors with user-friendly messages', () => {
      // Mock API error response
      cy.intercept('POST', '/api/bookings', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('bookingError');
      
      cy.login('client@example.com', 'Password123!');
      cy.visit('/booking/create');
      cy.fillBasicBookingDetails();
      cy.get('[data-testid="submit-booking"]').click();
      
      // Should show user-friendly error
      cy.get('[data-testid="error-message"]').should('contain', 'Something went wrong');
      cy.get('[data-testid="error-message"]').should('not.contain', 'Internal server error');
    });
  });
});

// Helper commands for common actions
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/auth/login');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});

Cypress.Commands.add('fillBasicBookingDetails', () => {
  cy.get('[data-testid="service-type-select"]').select('music-production');
  cy.get('[data-testid="project-title-input"]').type('Test Project');
  cy.get('[data-testid="project-description"]').type('Test description');
  cy.get('[data-testid="budget-input"]').type('500');
  cy.get('[data-testid="deadline-input"]').type('2024-12-31');
});

Cypress.Commands.add('selectCreator', () => {
  cy.get('[data-testid="continue-to-creators"]').click();
  cy.get('[data-testid="creator-card"]').first().click();
  cy.get('[data-testid="select-creator-button"]').click();
});

Cypress.Commands.add('proceedToPayment', () => {
  cy.get('[data-testid="proceed-to-payment"]').click();
});

// TypeScript declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      fillBasicBookingDetails(): Chainable<void>;
      selectCreator(): Chainable<void>;
      proceedToPayment(): Chainable<void>;
    }
  }
}