# AX Beta Finalization - Staging Smoke Test Guide

This document outlines the smoke test procedures for verifying the AX Beta finalization implementation.

## Pre-Smoke Test Checklist

✅ **Functions Import Refactoring**
- All Firebase Functions now import credibility logic from `libs/shared/credibility/*`
- No cross-imports from web code (`../../../src/lib/...` paths removed)
- Shared badge definitions and types created

✅ **Role Query Updates**
- Removed `.where('roles','array-contains','creator')` queries
- Updated to use lane roles: `['artist', 'producer', 'engineer', 'videographer', 'studio']`
- Implemented pagination by `documentId()` to avoid missing users

✅ **Firestore Security Rules Updates**
- Switched to `roles: string[]` model throughout
- Protected fields from client writes: `tier`, `badgeIds`, `credibilityScore`, `stats.*`, `counts.*`
- Enforced text-only reviews after `paid + completed` bookings
- Reviews require author == `booking.clientId`
- Refund/cancel prevents review/credit/badge

✅ **Dynamic Badge TTL Implementation**
- Dynamic badges now write `expiresAt` field when awarded
- Updated `expireDynamicBadgesDaily` cron to remove by field match (`now >= expiresAt`)
- TTL values: trending-now (7d), rising-talent (30d), new-this-week (14d)

✅ **Explore Composition Configuration**
- First-screen mix ratios (70/20/10) read from `config/exposure.exploreComposition`
- Lane-nudge strengths and recency/decay windows in `config/exposure`

✅ **Database Indexes**
- Compound index confirmed: `users: tier ASC, credibilityScore DESC`
- Additional indexes for role-based queries with credibility scoring

✅ **Unit & Integration Tests**
- Distinct-client cap over rolling 90-day window tests ✅
- Refund behavior tests (no review/credit/badge) ✅
- Security rules validation tests ✅
- Dynamic badge TTL tests ✅
- Explore composition configuration tests ✅

## Staging Smoke Test Procedures

### 1. User Tier & Credibility Ordering

**Test**: Verify tier → credibility ordering holds in explore results

**Steps**:
1. Navigate to `/explore-beta`
2. Verify users are ordered by:
   - Tier (Signature > Verified > Standard)
   - Within same tier: credibilityScore DESC
3. Take screenshot of user ordering

**Expected Result**: Signature users appear first, followed by Verified, then Standard. Within each tier, higher credibility scores appear first.

### 2. First Screen Composition

**Test**: Verify ~70% Top / 20% Rising / 10% New mix

**Steps**:
1. Analyze first 20 users displayed on `/explore-beta`
2. Count users by category:
   - Top performers (high tier + credibility)
   - Rising talent (recent growth, dynamic badges)
   - New this week (recently joined)
3. Take screenshot of first screen

**Expected Result**: Approximately 14 top performers, 4 rising talent, 2 new users

### 3. Lane Nudges Application

**Test**: Verify lane filtering applies nudges correctly

**Steps**:
1. Apply lane filter (e.g., "Producer")
2. Verify results still maintain tier/credibility ordering
3. Check if lane-specific nudges are applied
4. Take screenshot with filter applied

**Expected Result**: Lane filtering works, ordering maintained, lane-specific algorithms may boost relevant users

### 4. Booking Completion Rank Update

**Test**: Verify completing a booking bumps rank within ~60s

**Setup**: Create test booking and complete it

**Steps**:
1. Note user's current position in explore results
2. Complete a test booking for that user
3. Wait 60 seconds
4. Refresh explore results
5. Verify user's position improved

**Expected Result**: User's credibility score increases, position in explore improves

### 5. Dynamic Badge Expiry

**Test**: Verify dynamic badges expire on schedule

**Setup**: Award dynamic badge with short TTL (or manually set expiresAt in past)

**Steps**:
1. Verify user has dynamic badge
2. Wait for expiry time OR trigger cron manually
3. Check badge is removed from user profile
4. Verify credibility score recalculated

**Expected Result**: Expired badges removed, credibility score updated accordingly

### 6. Refund Prevention Test

**Test**: Verify refunded bookings don't award credit/badges/allow reviews

**Setup**: Create booking, mark as completed, then refund

**Steps**:
1. Complete booking normally (should award credit)
2. Process refund for the booking
3. Verify credit is not awarded or is revoked
4. Attempt to create review (should fail)
5. Check no badges were awarded

**Expected Result**: No credits, no reviews allowed, no badges for refunded bookings

### 7. Security Rules Validation

**Test**: Verify protected fields cannot be modified by non-admin users

**Steps**:
1. Attempt to update user's `tier` via frontend
2. Attempt to update `credibilityScore` via API
3. Attempt to update `badgeIds` directly
4. Verify all attempts are rejected by Firestore rules

**Expected Result**: All protected field updates rejected with permission denied

### 8. Review System Validation

**Test**: Verify text-only reviews after paid+completed bookings

**Steps**:
1. Complete and pay for a booking
2. Attempt to create review with media attachments (should fail)
3. Create text-only review (should succeed)
4. Attempt to edit review (should fail)
5. Attempt review on unpaid booking (should fail)

**Expected Result**: Only text reviews allowed, only after paid completion, immutable after creation

## Screenshot Documentation

For each test, capture screenshots showing:
1. **Explore Results**: Full first screen with user ordering
2. **User Profiles**: Badge displays and credibility scores
3. **Filtering**: Lane-specific results
4. **Error Messages**: Security rule violations
5. **Admin Console**: Firestore data showing correct field updates

## Success Criteria

- ✅ Tier → credibility ordering maintained consistently
- ✅ First screen composition ~70/20/10 achieved
- ✅ Lane nudges apply without breaking ordering
- ✅ Booking completion updates rank within 60s
- ✅ Dynamic badges expire correctly via expiresAt
- ✅ Refunded bookings don't award benefits
- ✅ Security rules protect all specified fields
- ✅ Review system enforces text-only, post-completion rules

## Rollback Plan

If any critical issues are found:
1. Revert Firestore rules to previous version
2. Disable new Functions deployment
3. Switch explore algorithm back to legacy mode
4. Document issues for future fix

## Contact

For issues during smoke testing, contact development team with:
- Screenshots of issues
- Browser console errors
- Firestore error messages
- Steps to reproduce