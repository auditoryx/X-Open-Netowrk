# 📲 Step-by-Step User Experience Flow

## 🟢 1. Signup
- User arrives at the signup page (`/signup`).
- User sees multiple signup options:
  - **OAuth providers**: Google, Apple, LINE, Kakao (duplicate Google button visible)
  - **Email/password form**: Traditional signup method
- After submitting:
  - User document created in Firestore with email and createdAt timestamp
  - Verification email automatically sent via `/api/auth/send-verification` endpoint
  - "Account Created Successfully!" confirmation screen shown
  - Success screen displays verification prompt with user's email address
  - Two action buttons provided:
    - "Manage Email Verification" → routes to `/verify-email`
    - "Continue →" → routes to `/select-intent`

## 📨 2. Post-Signup Success Screen
- Success screen displays account creation confirmation with green checkmark icon
- Shows verification email notification: "We've sent a verification email to [email]"
- "Continue →" button routes user to `/select-intent` (allows proceeding without email verification)
- Additional "Manage Email Verification" button for verification management

## 📌 3. User Intent Selection (`/select-intent`)
- User sees the prompt: "Welcome! How do you plan to use AuditoryX?"
- Three radio button intent options:
  - ✅ "Book Services (Client)"
  - ✅ "Offer Services (Provider)" 
  - ✅ "Both"
- Selected intent stored in Firestore using `setUserIntent()` function under `users/{uid}` with `userIntent` field
- "Continue" button disabled until intent selected
- Redirects immediately to `/dashboard` after submission
- XP Progress bar at bottom shows current XP (0) with target "Apply for Verification" milestone (50 XP target)

## 🚀 4. Dashboard View (`/dashboard`)
- Main dashboard redirects to `/dashboard/home` automatically
- Depending on chosen intent, dashboard displays:
  - **Universal features**: XP widgets, verification status, gamification elements
  - **Quick Action Cards**: Booking Inbox, Notifications, Bookings, Collaborations, Settings
  - **Progress tracking**: XP widget with history, badge progress, verification status widget
  - **Leaderboard widget**: Global rankings with top 5 entries
  - **Admin Panel**: Visible only for users with admin/moderator roles
- **Client focus**: Explore, book, and manage services through quick action cards
- **Provider focus**: Prompted to complete provider profile and apply for verification through verification status widget
- **Both**: Dashboard displays all available options for dual-role functionality

## 🎯 5. Role Toggle Feature
- Dashboard includes accessible `RoleToggle` component for intent updates
- Component provides dropdown selection for client/provider/both roles
- Users can seamlessly update roles anytime using "Set Role" button
- Changes immediately reflected in Firestore via same `setUserIntent()` function
- No page refresh required for role changes

## 📑 6. Verification & Tier Advancement
- **Provider/Both users** guided to verification through dashboard widgets
- **Apply flow** (`/apply`): Shows role selection cards for different creator types
- **Verification dashboard** (`/dashboard/verification`): Comprehensive verification center
  - Profile completion requirements tracking
  - XP requirements (minimum thresholds)
  - Booking completion metrics
  - Average rating requirements
  - Real-time eligibility checking
- **Application submission**: "Apply for Verification" button submits verification request
- **Storage**: Verification applications stored under `/verifications/{userId}` collection
- **Admin approval**: Applications require admin review and approval
- **Tier progression**: Approved users advance from "Standard" to "Verified" tier
- **Benefits unlocked**: Trust badges, higher search visibility, split payments, extended portfolio limits
- **XP milestones**: Clear XP requirements (e.g., 50 XP initial milestone, higher thresholds for verification)

## 🎖️ 7. Gamification Reinforcement
- **XP tracking**: Users earn XP from profile completion, bookings, reviews, platform interactions
- **Visual progress**: XP progress bars show current/target XP with completion percentages
- **Badge system**: Achievement badges for various milestones with progress tracking
- **Leaderboard**: Global rankings displayed in dashboard widget
- **Multiple categories**: XP progress tracked for daily goals, tier advancement, and achievement unlocks
- **Notifications**: Progress updates and milestone completions communicated through dashboard notifications

## 🌟 8. Signature Tier (Invite-only)
- **Exclusive access**: "Signature" tier managed exclusively through admin invitation
- **Manual selection**: Reserved for premium, hand-selected providers
- **Admin controls**: Higher-tier features and privileges managed through admin panel
- **Advanced benefits**: Premium features, priority support, enhanced visibility

---

## 🔍 Implementation Notes

### Technical Implementation Details:
- **Authentication**: Firebase Auth with multiple OAuth providers
- **Data storage**: Firestore for user profiles, intents, and verification applications
- **State management**: React hooks for user authentication and data fetching
- **Progress tracking**: Real-time XP and verification status updates
- **Role management**: Seamless role switching with immediate Firestore updates

### Current Discrepancies Identified:
1. **Signup page UX**: Duplicate Google signup button creates potential user confusion
2. **Email verification**: Users can proceed without verifying email (optional verification)
3. **Role selection**: Apply page shows creator role cards instead of direct verification application
4. **Dashboard navigation**: Main dashboard immediately redirects rather than showing overview

### Flow Accuracy:
The implemented flow **closely matches** the intended user experience with robust gamification, clear tier progression, and comprehensive verification tracking. The system successfully guides users through onboarding while providing flexibility for role changes and clear progression paths toward verification and tier advancement.