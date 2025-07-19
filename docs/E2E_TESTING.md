# Playwright E2E Tests

This document explains how to run the end-to-end tests for the X-Open Network platform.

## Overview

The platform now includes comprehensive E2E tests using Playwright that cover:

- **Booking Flow** (`tests/e2e/bookingFlow.spec.ts`): Full user journey from search to booking confirmation
- **Review Submission** (`tests/e2e/reviewSubmission.spec.ts`): Review creation, validation, and display  
- **Admin Earnings** (`tests/e2e/adminEarnings.spec.ts`): Admin dashboard analytics and revenue tracking

## Test Structure

Each test suite includes:
- ✅ Happy path scenarios (successful flows)
- ✅ Edge cases and error handling
- ✅ Form validation testing
- ✅ Access control verification
- ✅ UI interaction validation

## Running Tests Locally

### Prerequisites

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Start Firebase emulators:
```bash
firebase emulators:start --only firestore,auth --project demo-test
```

4. In another terminal, start the Next.js app:
```bash
npm run dev
```

### Run E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e tests/e2e/bookingFlow.spec.ts

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific browser
npm run test:e2e -- --project=firefox
```

## CI Integration

The E2E tests automatically run in GitHub Actions on every push to `main` or `develop` branches and on pull requests.

### CI Workflow (`.github/workflows/playwright.yml`)

The CI pipeline:
1. ✅ Sets up Node.js and installs dependencies
2. ✅ Installs Playwright browsers with system dependencies  
3. ✅ Starts Firebase emulators for testing
4. ✅ Builds the Next.js application
5. ✅ Starts the application server
6. ✅ Runs all E2E tests in parallel
7. ✅ Uploads test reports and artifacts

### Environment Variables

The CI uses test-specific environment variables:
- `NEXTAUTH_SECRET`: Test authentication secret
- `NEXT_PUBLIC_FIREBASE_*`: Firebase emulator configuration
- `STRIPE_*`: Mock Stripe keys for payment testing
- `SENDGRID_API_KEY`: Test email service key

## Test Coverage

### Booking Flow Tests (6 tests)
- Complete booking flow from search to confirmation
- Payment validation and error handling
- Availability checking and date restrictions
- Form validation and user input errors
- Provider availability display
- Booking request processing

### Review Submission Tests (8 tests)  
- Review creation for completed bookings
- Form validation (rating, text requirements)
- Duplicate review prevention
- Review editing within time limits
- Review display on provider profiles
- Low rating explanation requirements
- Provider notification system
- Review filtering and sorting

### Admin Earnings Tests (12 tests)
- Earnings dashboard data display
- Weekly/monthly view toggling  
- Top roles and cities analytics
- Data refresh functionality
- Admin access control
- Empty data state handling
- Earnings chart visualization
- Commission calculation accuracy
- Error state management
- Data export functionality
- Date range filtering

## Test Utilities

### Test Helpers (`tests/e2e/utils/test-helpers.ts`)

- `AuthUtils`: User authentication and session management
- `FirestoreUtils`: Database operations and test data setup
- `UIUtils`: Common UI interactions and element waiting
- `StripeUtils`: Payment flow testing and mock card handling
- `TestDataFactory`: Generate consistent test data

### Global Setup/Teardown

- `global-setup.ts`: Firebase emulator initialization and test data seeding
- `global-teardown.ts`: Cleanup and emulator shutdown

## Test Data

Tests use isolated test data that's automatically:
- ✅ Created before each test run
- ✅ Cleaned up after test completion  
- ✅ Consistent across test runs
- ✅ Independent between test files

## Debugging Failed Tests

### View Test Results
```bash
# Open HTML report
npx playwright show-report

# View test artifacts
ls test-results/
```

### Debug Mode
```bash
# Run with Playwright Inspector
npm run test:e2e -- --debug

# Run specific test with debug
npm run test:e2e tests/e2e/bookingFlow.spec.ts --debug
```

### CI Artifacts

When tests fail in CI, check the uploaded artifacts:
- **playwright-report**: Detailed HTML test report with screenshots
- **test-results**: Raw test results and failure details

## Best Practices

1. **Test Independence**: Each test can run in isolation
2. **Realistic Data**: Tests use data similar to production
3. **Error Scenarios**: Include both success and failure cases
4. **Performance**: Tests complete within reasonable timeframes
5. **Maintainability**: Well-structured with reusable utilities

## Adding New Tests

1. Create test file in `tests/e2e/`
2. Use existing test helpers and patterns
3. Include both positive and negative test cases
4. Add appropriate data cleanup
5. Update this documentation

## Platform Integration

The E2E tests verify the complete integration of:
- ✅ Next.js frontend application
- ✅ Firebase Firestore database  
- ✅ Firebase Authentication
- ✅ Stripe payment processing
- ✅ SendGrid email notifications
- ✅ Admin role-based access control
- ✅ Real-time features and messaging

This ensures that core user journeys (booking → review → earnings) remain stable across deployments.
