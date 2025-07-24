# Phase 2: Role System Integration QA Guide

This document explains how to use the comprehensive QA testing infrastructure for validating the role system integration in X-Open-Network.

## Overview

The QA infrastructure validates the complete user journey for all roles (Artist, Producer, Studio, Engineer, Videographer):

1. **Registration → Application → Approval → Profile completion**
2. **Discovery and visibility in explore pages**  
3. **Booking system end-to-end functionality**
4. **Review submission and rating updates**

## QA Test Infrastructure Components

### 1. Firebase Integration Tests (`scripts/role-system-qa.js`)

Comprehensive Firebase-focused tests that validate:
- User onboarding flow with Firestore document creation
- Application approval workflow
- Profile completion and data persistence
- Role discovery with proper querying
- End-to-end booking system with status tracking
- Review system with rating calculations

**Usage:**
```bash
npm run phase2:qa
```

### 2. Browser E2E Tests (`tests/role-system-integration.spec.ts`)

Playwright-based tests that validate:
- UI interactions for application flows
- Form submissions and validations
- Page navigation and routing
- Visual elements and user experience
- Cross-browser compatibility

**Usage:**
```bash
npm run phase2:qa:e2e
npm run phase2:qa:e2e -- --headed  # Run with browser visible
npm run phase2:qa:e2e -- --ui       # Run with Playwright UI
```

### 3. Infrastructure Validation (`scripts/validate-qa-infrastructure.js`)

Validates that the QA infrastructure itself is properly set up:
- Code structure and file existence
- SCHEMA_FIELDS configuration
- Component integration
- Test coverage completeness

**Usage:**
```bash
npm run phase2:qa:validate
```

## Complete QA Test Suite

Run all tests together:
```bash
npm run phase2:qa:full
```

## Test Scenarios Covered

### JJ-01: Onboarding Flow Validation
- ✅ Test user registration for each role
- ✅ Application submission via `/apply/[role]`
- ✅ Firestore document creation under `applications/`
- ✅ Admin approval workflow

### JJ-02: Profile Completion
- ✅ Profile form completion after approval
- ✅ Data persistence to `users/{uid}`
- ✅ Profile page rendering for each role

### JJ-03: Role Discovery
- ✅ Profile visibility in `/explore/[role]` pages
- ✅ Search grid functionality
- ✅ Rating and location sorting

### JJ-04: Booking System
- ✅ Client-provider booking flow
- ✅ Dashboard integration
- ✅ Firestore booking persistence
- ✅ Status tracking and updates

### JJ-05: Review System
- ✅ Review submission for completed bookings
- ✅ Rating calculation and updates
- ✅ Profile average rating display

## Environment Setup

### Required Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Firebase Configuration (required for Firebase tests)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# ... other Firebase config

# Base URL for E2E tests
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Firebase Setup

1. Ensure Firestore is configured with proper collections:
   - `users/` - User profiles
   - `applications/` - Role applications
   - `bookingRequests/` - Booking requests
   - `bookings/` - Confirmed bookings
   - `reviews/` - User reviews

2. Set up Firestore security rules to allow test operations

3. Configure authentication if testing with real auth

## Running Tests in Development

### Local Development Testing

1. Start the development server:
```bash
npm run dev
```

2. In another terminal, run QA tests:
```bash
npm run phase2:qa:validate  # Verify infrastructure
npm run phase2:qa:full      # Run complete test suite
```

### Production/Staging Testing

1. Deploy to staging environment
2. Update `NEXT_PUBLIC_BASE_URL` in environment
3. Run browser tests against staging:
```bash
npm run phase2:qa:e2e
```

## Test Data Management

### Automated Test Data

The Firebase QA script automatically:
- Creates test users for each role
- Generates realistic application data
- Cleans up test data after completion (optional)

### Manual Test Data

For manual testing, use the admin interface:
1. Navigate to `/admin/applications`
2. Review and approve test applications
3. Monitor booking and review flows

## Interpreting Results

### Success Criteria

All tests should pass for production readiness:
- ✅ All 5 roles complete onboarding successfully
- ✅ Profile completion works for all roles
- ✅ Discovery pages show approved users
- ✅ Booking system creates proper records
- ✅ Review system updates ratings correctly

### Common Issues

#### SCHEMA_FIELDS Errors
If you see circular reference errors:
- Check `src/lib/schema-fields.ts` for proper field definitions
- Run `npm run phase2:qa:validate` to verify structure

#### Firebase Connection Issues
If Firebase tests fail:
- Verify environment variables are set
- Check Firestore security rules
- Ensure project permissions are correct

#### Browser Test Failures
If E2E tests fail:
- Check if development server is running
- Verify base URL configuration
- Review authentication requirements

## Test Maintenance

### Adding New Role Types

1. Update `testRoles` array in `scripts/role-system-qa.js`
2. Add role-specific steps in E2E test helper functions
3. Update onboarding configuration in `src/constants/onboardingByRole.ts`

### Extending Test Coverage

1. Add new test functions to Firebase QA script
2. Create additional Playwright test scenarios
3. Update validation checks in infrastructure validator

## Continuous Integration

### GitHub Actions Integration

Add to `.github/workflows/main.yml`:

```yaml
- name: Run Role System QA
  run: |
    npm run phase2:qa:validate
    # npm run phase2:qa  # Requires Firebase config
```

### Pre-deployment Checklist

Before deploying to production:
- [ ] Run `npm run phase2:qa:validate` - should pass 100%
- [ ] Run complete QA suite in staging environment
- [ ] Manually verify all 5 role types can complete full journey
- [ ] Test admin approval workflow
- [ ] Verify booking and review systems work end-to-end

## Troubleshooting

### Debug Mode

Enable verbose logging:
```bash
DEBUG=true npm run phase2:qa
```

### Selective Testing

Test specific components:
```bash
# Test only onboarding
node scripts/role-system-qa.js --suite=onboarding

# Test specific role
npm run phase2:qa:e2e -- --grep="artist"
```

### Manual Verification

If automated tests pass but manual testing fails:
1. Check browser console for JavaScript errors
2. Verify Firestore data matches expected structure
3. Test with different user roles and permissions
4. Review network requests in developer tools

## Support

For issues with the QA infrastructure:
1. Check the validation output: `npm run phase2:qa:validate`
2. Review test logs for specific error messages
3. Verify environment configuration
4. Test components individually to isolate issues

---

**Ready for Beta Deployment:** All QA tests pass and manual verification confirms the role system works end-to-end for all user types.