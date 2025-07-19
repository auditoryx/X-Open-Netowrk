# Gamification Implementation Tasks

This document outlines the phased tasks required to implement the three-tier gamification system.

## Phase 1 – XP & Streak Models
- ✅ **Create gamification helpers** in `src/lib/gamification.ts` for logging XP events and enforcing a daily 100 XP cap.
- ✅ Add Firestore fields `points`, `streakCount`, `lastActivityAt` to each user document and create `/users/{uid}/activities` subcollections for event logs.
- ✅ **Add Jest tests** under `__tests__/gamification.test.ts` verifying XP accumulation, cap enforcement, and streak rollover.

## Phase 2 – Referral Codes
- ✅ Build `src/lib/referrals.ts` to generate and redeem codes stored in a `referralCodes` collection.
- ✅ Award 500 XP when a new user redeems a valid code and log it as an activity.
- ✅ Expose UI or API routes for users to view/generate their code and redeem one.
- ✅ **Tests** for valid/invalid referrals ensuring XP is granted once.

## Phase 3 – Tier Promotion Logic
- ✅ Update admin verification so a user is promoted to `proTier: 'verified'` only if `verificationStatus` is approved and they have at least 500 XP.
- ✅ Keep the existing admin toggle for the `signature` tier.
- ✅ Display XP progress toward Verified status on user profiles.
- ✅ **Tests** checking Verified promotion requires both conditions.

## Phase 4 – Leaderboards & UI Widgets
- ✅ Scheduled function to aggregate weekly/monthly leaderboards into a `leaderboards` collection.
- ✅ Create UI displaying top users by XP.
- ✅ **Tests** for leaderboard generation and rendering.

## Phase 5 – Abuse & Monitoring
- ✅ Implement validation to prevent XP from fake bookings, duplicate reviews, or message spam.
- ✅ Add audit logging for suspicious activity and optional monitoring scripts.

## Dev‑Experience Hooks
- Update `AGENTS.md` with instructions to run the streak reset cron and gamification tests:
  ```bash
  firebase emulators:exec 'node cron/streakReset.js'
  pnpm test gamification
  ```
