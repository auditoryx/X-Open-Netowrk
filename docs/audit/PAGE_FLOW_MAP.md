# Page Flow Map

This document maps user flow journeys across the AuditoryX platform.

Generated on: 2025-07-19T06:15:00.450Z

## Overview

The AuditoryX platform uses both Next.js App Router (`src/app`) and Pages Router (`pages`) patterns.

---

## Page Structure Analysis

### App Router Pages (src/app/)

#### `/(dashboard)/dashboard/artist`
- **page**: `(dashboard)/dashboard/artist/page.tsx`

#### `/(dashboard)/dashboard/engineer`
- **page**: `(dashboard)/dashboard/engineer/page.tsx`

#### `/(dashboard)/dashboard/producer`
- **page**: `(dashboard)/dashboard/producer/page.tsx`

#### `/(dashboard)/dashboard/studio`
- **page**: `(dashboard)/dashboard/studio/page.tsx`

#### `/(dashboard)/dashboard/studio/availability`
- **page**: `(dashboard)/dashboard/studio/availability/page.tsx`
  - Navigates to: /sample-availability.csv
  - API calls: /api/availability/import

#### `/(dashboard)/dashboard/videographer`
- **page**: `(dashboard)/dashboard/videographer/page.tsx`

#### `/(dashboard)/layout`
- **layout**: `(dashboard)/layout/layout.tsx`
  - Navigates to: /dashboard/bookings, /dashboard/purchases

#### `/about`
- **page**: `about/page.tsx`

#### `/admin`
- **layout**: `admin/layout.tsx`

#### `/admin/applications`
- **page**: `admin/applications/page.tsx`
  - API calls: /api/promote-user

#### `/admin/components/AdminNavbar.tsx`
- **AdminNavbar**: `admin/components/AdminNavbar.tsx`
  - Navigates to: /auth
  - API calls: /api/logout

#### `/admin/components/ModerationPanel.tsx`
- **ModerationPanel**: `admin/components/ModerationPanel.tsx`

#### `/admin/dashboard`
- **page**: `admin/dashboard/page.tsx`

#### `/admin/disputes`
- **page**: `admin/disputes/page.tsx`

#### `/admin/listings`
- **page**: `admin/listings/page.tsx`

#### `/admin/logout`
- **page**: `admin/logout/page.tsx`
  - Navigates to: /auth

#### `/admin/reports`
- **page**: `admin/reports/page.tsx`

#### `/admin/users`
- **page**: `admin/users/page.tsx`
  - API calls: /api/promote-user, /api/ban-user

#### `/admin/users/:uid`
- **page**: `admin/users/[uid]/page.tsx`

#### `/admin/verifications`
- **page**: `admin/verifications/page.tsx`

#### `/api/_utils/withAuth.ts`
- **withAuth**: `api/_utils/withAuth.ts`

#### `/api/admin/disputes/route.ts`
- **route**: `api/admin/disputes/route.ts`

#### `/api/admin/earnings/route.ts`
- **route**: `api/admin/earnings/route.ts`

#### `/api/agree-contract/route.ts`
- **route**: `api/agree-contract/route.ts`

#### `/api/artist-services/route.ts`
- **route**: `api/artist-services/route.ts`

#### `/api/assign-role/route.ts`
- **route**: `api/assign-role/route.ts`

#### `/api/auth/logout/route.ts`
- **route**: `api/auth/logout/route.ts`

#### `/api/auth/register/route.ts`
- **route**: `api/auth/register/route.ts`

#### `/api/auth/session/route.ts`
- **route**: `api/auth/session/route.ts`

#### `/api/auth/verify/route.ts`
- **route**: `api/auth/verify/route.ts`

#### `/api/availability/import/route.ts`
- **route**: `api/availability/import/route.ts`

#### `/api/availability/route.ts`
- **route**: `api/availability/route.ts`

#### `/api/ban-user/route.ts`
- **route**: `api/ban-user/route.ts`

#### `/api/book/route.ts`
- **route**: `api/book/route.ts`

#### `/api/bookings/release/route.ts`
- **route**: `api/bookings/release/route.ts`

#### `/api/bookings/request-revision/route.ts`
- **route**: `api/bookings/request-revision/route.ts`

#### `/api/bookings/route.ts`
- **route**: `api/bookings/route.ts`

#### `/api/cache/get/route.ts`
- **route**: `api/cache/get/route.ts`

#### `/api/cache/set/route.ts`
- **route**: `api/cache/set/route.ts`

#### `/api/calendar/push/route.ts`
- **route**: `api/calendar/push/route.ts`

#### `/api/calendar/sync/route.ts`
- **route**: `api/calendar/sync/route.ts`

#### `/api/cart/checkout/route.ts`
- **route**: `api/cart/checkout/route.ts`

#### `/api/checkout/route.ts`
- **route**: `api/checkout/route.ts`

#### `/api/create-checkout-session/route.ts`
- **route**: `api/create-checkout-session/route.ts`

#### `/api/disputes/open/route.ts`
- **route**: `api/disputes/open/route.ts`

#### `/api/disputes/resolve/route.ts`
- **route**: `api/disputes/resolve/route.ts`

#### `/api/email/capture/route.ts`
- **route**: `api/email/capture/route.ts`
  - API calls: ${request.nextUrl.origin}/api/email/welcome

#### `/api/email/welcome/route.ts`
- **route**: `api/email/welcome/route.ts`
  - Navigates to: ${baseUrl}/explore?utm_source=welcome_email&utm_medium=email&utm_campaign=onboarding, ${baseUrl}/unsubscribe, ${baseUrl}

#### `/api/engineer-services/route.ts`
- **route**: `api/engineer-services/route.ts`

#### `/api/healthz/route.ts`
- **route**: `api/healthz/route.ts`

#### `/api/logout/route.ts`
- **route**: `api/logout/route.ts`

#### `/api/media/portfolio/item/:mediaId/route.ts`
- **route**: `api/media/portfolio/item/[mediaId]/route.ts`

#### `/api/media/portfolio/user/:userId/route.ts`
- **route**: `api/media/portfolio/user/[userId]/route.ts`

#### `/api/media/upload/route.ts`
- **route**: `api/media/upload/route.ts`

#### `/api/monitoring/api-performance/route.ts`
- **route**: `api/monitoring/api-performance/route.ts`

#### `/api/monitoring/errors/route.ts`
- **route**: `api/monitoring/errors/route.ts`

#### `/api/monitoring/interactions/route.ts`
- **route**: `api/monitoring/interactions/route.ts`

#### `/api/monitoring/metrics/route.ts`
- **route**: `api/monitoring/metrics/route.ts`
  - Navigates to: recent_metrics

#### `/api/notifications/route.ts`
- **route**: `api/notifications/route.ts`

#### `/api/payments/create-checkout-session/route.ts`
- **route**: `api/payments/create-checkout-session/route.ts`

#### `/api/producer-services/route.ts`
- **route**: `api/producer-services/route.ts`

#### `/api/profile/availability/route.ts`
- **route**: `api/profile/availability/route.ts`

#### `/api/promote-user/route.ts`
- **route**: `api/promote-user/route.ts`

#### `/api/referrals/route.ts`
- **route**: `api/referrals/route.ts`

#### `/api/reviews/route.ts`
- **route**: `api/reviews/route.ts`

#### `/api/search/route.ts`
- **route**: `api/search/route.ts`

#### `/api/send-booking-confirmation/route.ts`
- **route**: `api/send-booking-confirmation/route.ts`

#### `/api/services/route.ts`
- **route**: `api/services/route.ts`

#### `/api/set-role/route.ts`
- **route**: `api/set-role/route.ts`

#### `/api/stripe/connect/route.ts`
- **route**: `api/stripe/connect/route.ts`

#### `/api/stripe/escrow/route.ts`
- **route**: `api/stripe/escrow/route.ts`

#### `/api/stripe/subscribe/route.ts`
- **route**: `api/stripe/subscribe/route.ts`

#### `/api/stripe/webhook/route.ts`
- **route**: `api/stripe/webhook/route.ts`

#### `/api/studio-availability/route.ts`
- **route**: `api/studio-availability/route.ts`

#### `/api/studio-services/route.ts`
- **route**: `api/studio-services/route.ts`

#### `/api/users/:uid/route.ts`
- **route**: `api/users/[uid]/route.ts`

#### `/api/verify/:uid/route.ts`
- **route**: `api/verify/[uid]/route.ts`

#### `/api/videographer-services/route.ts`
- **route**: `api/videographer-services/route.ts`

#### `/api/webhooks/stripe/route.ts`
- **route**: `api/webhooks/stripe/route.ts`

#### `/apply`
- **page**: `apply/page.tsx`

#### `/apply/:role`
- **page**: `apply/[role]/page.tsx`
  - Navigates to: /login?redirect=/apply/${role}, /dashboard

#### `/artists`
- **page**: `artists/page.jsx`

#### `/auth`
- **page**: `auth/page.tsx`
  - Navigates to: /admin/applications, /dashboard/${token.claims.role}, /
  - API calls: /api/users/${uid}

#### `/availability`
- **page**: `availability/page.tsx`

#### `/beats`
- **page**: `beats/page.tsx`

#### `/book/:uid`
- **page**: `book/[uid]/page.tsx`
  - Navigates to: /success?time=${selectedTime}&location=${encodeURIComponent(providerLocation)}&fee=${platformFee}
  - API calls: /api/send-booking-confirmation, /api/notifications

#### `/booking`
- **page**: `booking/page.tsx`

#### `/booking/:bookingId`
- **page**: `booking/[bookingId]/page.tsx`
  - Navigates to: /booking/preview/${bookingId}, /booking/${bookingId}/chat

#### `/booking/:bookingId/chat`
- **page**: `booking/[bookingId]/chat/page.tsx`
  - Navigates to: /login

#### `/booking/preview/:bookingId`
- **page**: `booking/preview/[bookingId]/page.tsx`
  - Navigates to: /login, /dashboard/bookings
  - API calls: /api/create-checkout-session

#### `/cancel`
- **page**: `cancel/page.tsx`

#### `/cart`
- **page**: `cart/page.tsx`
  - API calls: /api/cart/checkout

#### `/components/AuthModal.tsx`
- **AuthModal**: `components/AuthModal.tsx`

#### `/components/AvailabilityForm.tsx`
- **AvailabilityForm**: `components/AvailabilityForm.tsx`
  - API calls: /api/availability

#### `/components/BackgroundAnimation.tsx`
- **BackgroundAnimation**: `components/BackgroundAnimation.tsx`

#### `/components/BookingHistory.tsx`
- **BookingHistory**: `components/BookingHistory.tsx`

#### `/components/BookingRequestForm.jsx`
- **BookingRequestForm**: `components/BookingRequestForm.jsx`
  - API calls: /api/bookings

#### `/components/BookingRequestForm.tsx`
- **BookingRequestForm**: `components/BookingRequestForm.tsx`

#### `/components/BookingsViewer.tsx`
- **BookingsViewer**: `components/BookingsViewer.tsx`

#### `/components/ClientBookings.tsx`
- **ClientBookings**: `components/ClientBookings.tsx`

#### `/components/CreativeDropdown.tsx`
- **CreativeDropdown**: `components/CreativeDropdown.tsx`
  - Navigates to: /apply/creative?role=producer, /apply/creative?role=engineer, /apply/creative?role=videographer, /apply/creative?role=designer

#### `/components/DarkModeToggle.tsx`
- **DarkModeToggle**: `components/DarkModeToggle.tsx`

#### `/components/EditServicesForm.tsx`
- **EditServicesForm**: `components/EditServicesForm.tsx`

#### `/components/FloatingCTA.tsx`
- **FloatingCTA**: `components/FloatingCTA.tsx`
  - Navigates to: /apply

#### `/components/Footer.tsx`
- **Footer**: `components/Footer.tsx`
  - Navigates to: https://instagram.com/auditoryx, https://twitter.com/auditoryx, /apply, /creator-guidelines, /dashboard, /success-stories, /explore, /search, /about, /contact, /terms-of-service, /privacy-policy, /legal/escrow

#### `/components/Inbox.tsx`
- **Inbox**: `components/Inbox.tsx`

#### `/components/LogoutButton.tsx`
- **LogoutButton**: `components/LogoutButton.tsx`
  - Navigates to: /login

#### `/components/MessageCenter.tsx`
- **MessageCenter**: `components/MessageCenter.tsx`

#### `/components/Notifications.tsx`
- **Notifications**: `components/Notifications.tsx`

#### `/components/PayButton.tsx`
- **PayButton**: `components/PayButton.tsx`
  - API calls: /api/payments/create-checkout-session

#### `/components/ProviderBookings.tsx`
- **ProviderBookings**: `components/ProviderBookings.tsx`

#### `/components/ServiceManager.tsx`
- **ServiceManager**: `components/ServiceManager.tsx`

#### `/components/dashboard/AvailabilityEditor.tsx`
- **AvailabilityEditor**: `components/dashboard/AvailabilityEditor.tsx`
  - Navigates to: https://calendar.google.com
  - API calls: /api/calendar/sync, /api/calendar/push

#### `/components/dashboard/AvailabilitySummary.tsx`
- **AvailabilitySummary**: `components/dashboard/AvailabilitySummary.tsx`

#### `/components/dashboard/SlotSelectorGrid.tsx`
- **SlotSelectorGrid**: `components/dashboard/SlotSelectorGrid.tsx`

#### `/components/dashboard/SyncStatusBadge.tsx`
- **SyncStatusBadge**: `components/dashboard/SyncStatusBadge.tsx`

#### `/contact`
- **page**: `contact/page.tsx`
  - Navigates to: mailto:support@auditoryx.com, https://instagram.com/auditory.x

#### `/create-profile`
- **page**: `create-profile/page.tsx`
  - Navigates to: /waitlist, /signin

#### `/creator-guidelines`
- **page**: `creator-guidelines/page.tsx`
  - Navigates to: /contact, /apply

#### `/creators`
- **page**: `creators/page.jsx`

#### `/dashboard`
- **page**: `dashboard/page.tsx`
  - Navigates to: /dashboard/home

#### `/dashboard/:role`
- **page**: `dashboard/[role]/page.tsx`
  - Navigates to: /login, /dashboard/home

#### `/dashboard/admin`
- **page**: `dashboard/admin/page.tsx`
  - API calls: /api/notifications

#### `/dashboard/admin/challenge-management`
- **page**: `dashboard/admin/challenge-management/page.tsx`

#### `/dashboard/admin/earnings`
- **page**: `dashboard/admin/earnings/page.tsx`

#### `/dashboard/admin/reports`
- **page**: `dashboard/admin/reports/page.tsx`

#### `/dashboard/admin/signature-invite`
- **page**: `dashboard/admin/signature-invite/page.tsx`

#### `/dashboard/admin/support`
- **page**: `dashboard/admin/support/page.tsx`

#### `/dashboard/admin/support/:id`
- **page**: `dashboard/admin/support/[id]/page.tsx`
  - Navigates to: /dashboard/admin/support

#### `/dashboard/admin/verification-management`
- **page**: `dashboard/admin/verification-management/page.tsx`

#### `/dashboard/admin/verification-requests`
- **page**: `dashboard/admin/verification-requests/page.tsx`

#### `/dashboard/admin/verifications`
- **page**: `dashboard/admin/verifications/page.tsx`

#### `/dashboard/admin/xp-management`
- **page**: `dashboard/admin/xp-management/page.tsx`

#### `/dashboard/analytics`
- **page**: `dashboard/analytics/page.tsx`

#### `/dashboard/availability`
- **page**: `dashboard/availability/page.tsx`

#### `/dashboard/bookings`
- **page**: `dashboard/bookings/page.tsx`
  - Navigates to: /explore
  - API calls: /api/bookings, /api/agree-contract

#### `/dashboard/bookings/:bookingId`
- **page**: `dashboard/bookings/[bookingId]/page.tsx`
  - API calls: /api/agree-contract

#### `/dashboard/bookings/DisputeButton.tsx`
- **DisputeButton**: `dashboard/bookings/DisputeButton.tsx`
  - API calls: /api/disputes/open

#### `/dashboard/bookings/page.bak.tsx`
- **page.bak**: `dashboard/bookings/page.bak.tsx`
  - API calls: /api/bookings, /api/agree-contract

#### `/dashboard/business-intelligence`
- **page**: `dashboard/business-intelligence/page.tsx`

#### `/dashboard/case-studies`
- **page**: `dashboard/case-studies/page.tsx`
  - Navigates to: /dashboard/case-studies/${caseStudyId}/edit

#### `/dashboard/case-studies/:id/edit`
- **page**: `dashboard/case-studies/[id]/edit/page.tsx`
  - Navigates to: /dashboard/case-studies

#### `/dashboard/challenges`
- **page**: `dashboard/challenges/page.tsx`

#### `/dashboard/collabs`
- **page**: `dashboard/collabs/page.tsx`

#### `/dashboard/collabs/:bookingId`
- **page**: `dashboard/collabs/[bookingId]/page.tsx`
  - Navigates to: /dashboard/collabs

#### `/dashboard/creator-showcase`
- **page**: `dashboard/creator-showcase/page.tsx`

#### `/dashboard/creator-tools`
- **page**: `dashboard/creator-tools/page.tsx`

#### `/dashboard/earnings`
- **page**: `dashboard/earnings/page.tsx`

#### `/dashboard/edit`
- **page**: `dashboard/edit/page.tsx`

#### `/dashboard/enhanced-portfolio`
- **page**: `dashboard/enhanced-portfolio/page.tsx`

#### `/dashboard/enhanced-profile`
- **page**: `dashboard/enhanced-profile/page.tsx`

#### `/dashboard/enterprise/label-dashboard`
- **page**: `dashboard/enterprise/label-dashboard/page.tsx`

#### `/dashboard/favorites`
- **page**: `dashboard/favorites/page.tsx`
  - Navigates to: /profile/${c.id}

#### `/dashboard/finances`
- **page**: `dashboard/finances/page.tsx`

#### `/dashboard/home`
- **page**: `dashboard/home/page.tsx`
  - Navigates to: /login, /dashboard/verification, /dashboard/profile, /dashboard/inbox, /dashboard/notifications, /dashboard/bookings, /dashboard/collabs, /dashboard/settings, /dashboard/admin/verifications

#### `/dashboard/inbox`
- **page**: `dashboard/inbox/page.tsx`

#### `/dashboard/leaderboard`
- **page**: `dashboard/leaderboard/page.tsx`
  - Navigates to: /dashboard/verification, /dashboard/profile, /dashboard/bookings

#### `/dashboard/messages`
- **page**: `dashboard/messages/page.tsx`
  - Navigates to: /explore

#### `/dashboard/messages/:threadId`
- **page**: `dashboard/messages/[threadId]/page.tsx`
  - Navigates to: /dashboard/messages

#### `/dashboard/notifications`
- **page**: `dashboard/notifications/page.tsx`
  - Navigates to: /dashboard/bookings/${notification.data.bookingId}, /dashboard/messages/${notification.data.messageThreadId}, /profile/${notification.data.userId}

#### `/dashboard/orders`
- **page**: `dashboard/orders/page.tsx`
  - Navigates to: /login, /dashboard

#### `/dashboard/portfolio`
- **page**: `dashboard/portfolio/page.tsx`

#### `/dashboard/profile`
- **page**: `dashboard/profile/page.tsx`
  - Navigates to: /dashboard/edit, /dashboard/verification

#### `/dashboard/purchases`
- **page**: `dashboard/purchases/page.tsx`
  - Navigates to: /login, /explore

#### `/dashboard/purchases/:bookingId`
- **page**: `dashboard/purchases/[bookingId]/page.tsx`

#### `/dashboard/reviews`
- **page**: `dashboard/reviews/page.tsx`

#### `/dashboard/services`
- **page**: `dashboard/services/page.tsx`
  - Navigates to: /apply

#### `/dashboard/settings`
- **page**: `dashboard/settings/page.tsx`
  - API calls: /api/stripe/connect

#### `/dashboard/testimonials`
- **page**: `dashboard/testimonials/page.tsx`

#### `/dashboard/upcoming`
- **page**: `dashboard/upcoming/page.tsx`

#### `/dashboard/verification`
- **page**: `dashboard/verification/page.tsx`
  - Navigates to: /dashboard/profile, /services/create, /dashboard/portfolio

#### `/engineers`
- **page**: `engineers/page.jsx`

#### `/explore`
- **page**: `explore/page.tsx`
  - Navigates to: ?${params.toString()}, /explore?

#### `/explore/:role`
- **page**: `explore/[role]/page.tsx`
  - Navigates to: /profile/${creator.id}

#### `/firebase/index.ts`
- **index**: `firebase/index.ts`

#### `/layout.tsx`
- **layout**: `layout.tsx`

#### `/leaderboard`
- **page**: `leaderboard/page.tsx`

#### `/leaderboards/:city/:role`
- **page**: `leaderboards/[city]/[role]/page.tsx`

#### `/legal/escrow`
- **page**: `legal/escrow/page.tsx`

#### `/lib/firestoreHelpers.ts`
- **firestoreHelpers**: `lib/firestoreHelpers.ts`

#### `/lib/messageHelpers.ts`
- **messageHelpers**: `lib/messageHelpers.ts`

#### `/lib/profileHelpers.ts`
- **profileHelpers**: `lib/profileHelpers.ts`

#### `/loading.tsx`
- **loading**: `loading.tsx`

#### `/login`
- **page**: `login/page.tsx`

#### `/map`
- **page**: `map/page.tsx`

#### `/not-found`
- **page**: `not-found/page.tsx`
  - Navigates to: /

#### `/not-found.tsx`
- **not-found**: `not-found.tsx`
  - Navigates to: /, /search, /dashboard, /booking, /explore, /help

#### `/offline`
- **page**: `offline/page.tsx`
  - Navigates to: /
  - API calls: /api/health

#### `/onboarding`
- **page**: `onboarding/page.tsx`
  - Navigates to: /auth/signin?callbackUrl=/onboarding

#### `/page.tsx`
- **page**: `page.tsx`
  - Navigates to: /explore, /apply, /profile/oogie-mane, /profile/thouxanbanfauni, /profile/unotheactivist, /profile/cole-bennett

#### `/privacy-policy`
- **page**: `privacy-policy/page.tsx`
  - Navigates to: /contact

#### `/producers`
- **page**: `producers/page.jsx`

#### `/profile/:uid`
- **page**: `profile/[uid]/page.tsx`

#### `/profile/edit`
- **page**: `profile/edit/page.tsx`
  - Navigates to: /login, /profile/${user.uid}

#### `/saved`
- **page**: `saved/page.tsx`

#### `/search`
- **page**: `search/page.tsx`
  - Navigates to: /dashboard/messages?new=${creatorId}, /creators/${creatorId}/book
  - API calls: /api/search/trending, /api/search/categories, /api/user/saved-creators

#### `/services`
- **page**: `services/page.tsx`
  - Navigates to: /apply, /explore

#### `/services/:id`
- **page**: `services/[id]/page.tsx`
  - Navigates to: /profile/${service.creatorId}

#### `/services/add`
- **page**: `services/add/page.tsx`
  - Navigates to: /dashboard/services

#### `/services/authService.ts`
- **authService**: `services/authService.ts`
  - API calls: /api/auth/session, /api/auth/register, /api/auth/logout

#### `/services/edit/:id`
- **page**: `services/edit/[id]/page.tsx`

#### `/services/manage`
- **page**: `services/manage/page.tsx`

#### `/set-role`
- **page**: `set-role/page.tsx`
  - Navigates to: /dashboard/${role}

#### `/signup`
- **page**: `signup/page.tsx`

#### `/signup/getRedirectAfterSignup.ts`
- **getRedirectAfterSignup**: `signup/getRedirectAfterSignup.ts`

#### `/start`
- **page**: `start/page.tsx`
  - Navigates to: /create-profile, /signup?redirect=/create-profile, /dashboard

#### `/studios`
- **page**: `studios/page.jsx`

#### `/success`
- **page**: `success/page.tsx`
  - Navigates to: /dashboard/bookings, /success, /signup, /explore

#### `/terms-of-service`
- **page**: `terms-of-service/page.tsx`
  - Navigates to: /contact

#### `/test-admin-verification`
- **page**: `test-admin-verification/page.tsx`
  - Navigates to: /dashboard/admin/verifications, /test-verification, /dashboard/home

#### `/test-booking`
- **page**: `test-booking/page.tsx`

#### `/test-components`
- **page**: `test-components/page.tsx`
  - Navigates to: /dashboard/inbox, /dashboard/notifications, /dashboard/home

#### `/test-verification`
- **page**: `test-verification/page.tsx`
  - Navigates to: /profile/edit, /dashboard/home

#### `/test/badge-display`
- **page**: `test/badge-display/page.tsx`

#### `/test/ranking-components`
- **page**: `test/ranking-components/page.tsx`

#### `/test/verification-components`
- **page**: `test/verification-components/page.tsx`

#### `/test/xp-display`
- **page**: `test/xp-display/page.tsx`

#### `/top-creators`
- **page**: `top-creators/page.tsx`

#### `/utils/sendWelcomeMessage.ts`
- **sendWelcomeMessage**: `utils/sendWelcomeMessage.ts`

#### `/utils/withAuth.tsx`
- **withAuth**: `utils/withAuth.tsx`
  - Navigates to: /login

#### `/utils/withRoleProtection.tsx`
- **withRoleProtection**: `utils/withRoleProtection.tsx`
  - Navigates to: /

#### `/verify-info`
- **page**: `verify-info/page.tsx`

#### `/videographers`
- **page**: `videographers/page.jsx`


### Legacy Pages Router (pages/)

#### `/admin-validation`
- **File**: `admin-validation.tsx`

#### `/api/booking/confirm`
- **File**: `api/booking/confirm.ts`

#### `/api/events/confirm`
- **File**: `api/events/confirm.ts`

#### `/api/stripe/create-checkout-session`
- **File**: `api/stripe/create-checkout-session.ts`

#### `/banned`
- **File**: `banned.tsx`
- **Navigates to**: /dashboard, /login, /

#### `/events/:eventId`
- **File**: `events/[eventId].tsx`
- **Navigates to**: /dashboard
- **API calls**: /api/events/confirm

#### `/mentorships`
- **File**: `mentorships/index.tsx`

#### `/mentorships/create`
- **File**: `mentorships/create.tsx`

#### `/portfolio-uploader-demo`
- **File**: `portfolio-uploader-demo.tsx`
- **Navigates to**: /


---

## User Journey Flows

### Core User Journeys

#### Authentication Flow
1. **Entry**: `/` → Landing page
2. **Sign Up**: `/signup` → User registration
3. **Login**: `/login` → User authentication  
4. **Verification**: `/verify-info` → Account verification
5. **Role Selection**: `/set-role` → Define user type
6. **Onboarding**: `/onboarding` → Initial setup

#### Creator Journey
1. **Profile Creation**: `/create-profile` → Build creator profile
2. **Dashboard**: `/dashboard` → Creator control center
3. **Service Management**: Service creation and editing
4. **Booking Management**: Handle client bookings
5. **Portfolio**: Showcase work and achievements

#### Client Journey  
1. **Discovery**: `/explore` → Find creators and services
2. **Search**: Advanced filtering and search
3. **Booking**: Service booking and payment
4. **Communication**: Chat with creators
5. **Review**: Post-service feedback

#### Booking Flow
1. **Service Discovery**: `/explore`, `/search`
2. **Creator Profile**: View creator details
3. **Booking Form**: `/book` → Service selection
4. **Payment**: Stripe integration
5. **Confirmation**: Booking success
6. **Communication**: Chat thread
7. **Completion**: Service delivery
8. **Review**: Feedback submission

### Administrative Flows

#### Admin Dashboard
- User management
- Platform analytics
- Content moderation
- System monitoring

---

## API Endpoint Analysis

### Authentication APIs
- `/api/auth/*` - NextAuth.js endpoints
- `/api/user/*` - User management
- `/api/profile/*` - Profile operations

### Core Business APIs  
- `/api/services/*` - Service CRUD operations
- `/api/bookings/*` - Booking management
- `/api/payments/*` - Payment processing
- `/api/chat/*` - Messaging system

### Platform APIs
- `/api/admin/*` - Administrative functions
- `/api/analytics/*` - Platform metrics
- `/api/notifications/*` - User notifications

---

## Navigation Patterns

### Common Navigation Components
- **Navbar**: Global navigation across all pages
- **Dashboard Sidebar**: Creator/client dashboard navigation
- **Breadcrumbs**: Hierarchical navigation
- **Back Buttons**: Context-specific return navigation

### Route Protection
- **Public Routes**: Landing, signup, login
- **Protected Routes**: Dashboard, profile, bookings
- **Role-based Routes**: Admin pages, creator tools
- **Dynamic Routes**: User profiles, service pages

---

## Analysis Notes

This flow map is based on:
- Static analysis of page files and routing structures
- Navigation pattern detection in code
- API endpoint mapping
- Common user journey assumptions

**Methodology**:
- Scanned all page files for navigation patterns
- Extracted router.push, Link href, and form actions
- Mapped API endpoints and their usage
- Identified common user flow sequences

Generated by: AuditoryX System Integration Audit
