# Logic Dependency Graph

This document shows which hooks, lib functions, and services are imported per page and component.

Generated on: 2025-07-19T06:15:00.528Z

## Overview

This analysis maps the logical dependencies across the AuditoryX platform, showing how business logic, utilities, and state management are distributed.

---

## Dependency Categories

- **🪝 Hooks**: Custom React hooks for state and logic
- **⚙️ Services**: Business logic and API services  
- **🛠️ Utils**: Utility functions and helpers
- **📡 Context**: React context providers and consumers
- **📋 Types**: TypeScript type definitions

---

## Page Dependencies

### App Router Pages (src/app/)

#### `/(dashboard)/dashboard/artist`

**page**: `(dashboard)/dashboard/artist/page.tsx`

- 📋 **Types**: @/types/user
- 🪝 **Hook Usage**: useEffect, useState

#### `/(dashboard)/dashboard/engineer`

**page**: `(dashboard)/dashboard/engineer/page.tsx`

- 🛠️ **Utils**: @/lib/utils/withRoleProtection
- 📋 **Types**: @/types/user
- 🪝 **Hook Usage**: useEffect, useState

#### `/(dashboard)/dashboard/producer`

**page**: `(dashboard)/dashboard/producer/page.tsx`

- 🛠️ **Utils**: @/lib/utils/withRoleProtection
- 📋 **Types**: @/types/user
- 🪝 **Hook Usage**: useEffect, useState

#### `/(dashboard)/dashboard/studio`

**page**: `(dashboard)/dashboard/studio/page.tsx`

- 🛠️ **Utils**: @/lib/utils/withRoleProtection
- 📋 **Types**: @/types/user
- 🪝 **Hook Usage**: useEffect, useState

#### `/(dashboard)/dashboard/studio/availability`

**page**: `(dashboard)/dashboard/studio/availability/page.tsx`

- 🛠️ **Utils**: @/lib/utils/withRoleProtection
- 🪝 **Hook Usage**: useState

#### `/(dashboard)/dashboard/videographer`

**page**: `(dashboard)/dashboard/videographer/page.tsx`

- 🛠️ **Utils**: @/lib/utils/withRoleProtection
- 📋 **Types**: @/types/user
- 🪝 **Hook Usage**: useEffect, useState

#### `/(dashboard)/layout`

**layout**: `(dashboard)/layout/layout.tsx`

- 🪝 **Hooks**: @/hooks/useSidebarToggle, @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useSidebarToggle, usePathname, useAuth

#### `/admin/applications`

**page**: `admin/applications/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/admin/components/AdminNavbar.tsx`

**AdminNavbar**: `admin/components/AdminNavbar.tsx`

- 🪝 **Hook Usage**: useRouter, usePathname

#### `/admin/components/ModerationPanel.tsx`

**ModerationPanel**: `admin/components/ModerationPanel.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/admin/dashboard`

**page**: `admin/dashboard/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/admin/listings`

**page**: `admin/listings/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/admin/logout`

**page**: `admin/logout/page.tsx`

- 🪝 **Hook Usage**: useEffect, useRouter

#### `/admin/reports`

**page**: `admin/reports/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/admin/users`

**page**: `admin/users/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/admin/users/:uid`

**page**: `admin/users/[uid]/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState, useParams

#### `/admin/verifications`

**page**: `admin/verifications/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/apply`

**page**: `apply/page.tsx`

- 🛠️ **Utils**: @/utils/roles

#### `/apply/:role`

**page**: `apply/[role]/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useState, useRouter, useParams, useAuth

#### `/auth`

**page**: `auth/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState, useRouter

#### `/book/:uid`

**page**: `book/[uid]/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useRouter, useState, useEffect, useAuth

#### `/booking`

**page**: `booking/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/booking/:bookingId`

**page**: `booking/[bookingId]/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState, useParams, useRouter

#### `/booking/:bookingId/chat`

**page**: `booking/[bookingId]/chat/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useState, useParams, useRouter, useAuth

#### `/booking/preview/:bookingId`

**page**: `booking/preview/[bookingId]/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useState, useParams, useRouter, useAuth

#### `/cart`

**page**: `cart/page.tsx`

- 📡 **Context**: @/context/CartContext
- 🪝 **Hook Usage**: useState, useCart

#### `/components/AuthModal.tsx`

**AuthModal**: `components/AuthModal.tsx`

- ⚙️ **Services**: ../services/authService
- 🪝 **Hook Usage**: useState

#### `/components/AvailabilityForm.tsx`

**AvailabilityForm**: `components/AvailabilityForm.tsx`

- 🪝 **Hook Usage**: useState

#### `/components/BookingHistory.tsx`

**BookingHistory**: `components/BookingHistory.tsx`

- 🪝 **Hook Usage**: useState, useEffect, useCallback

#### `/components/BookingRequestForm.jsx`

**BookingRequestForm**: `components/BookingRequestForm.jsx`

- 🪝 **Hook Usage**: useState

#### `/components/BookingRequestForm.tsx`

**BookingRequestForm**: `components/BookingRequestForm.tsx`

- 🪝 **Hook Usage**: useState

#### `/components/BookingsViewer.tsx`

**BookingsViewer**: `components/BookingsViewer.tsx`

- 🪝 **Hook Usage**: useEffect, useState, useCallback

#### `/components/ClientBookings.tsx`

**ClientBookings**: `components/ClientBookings.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/components/CreativeDropdown.tsx`

**CreativeDropdown**: `components/CreativeDropdown.tsx`

- 🪝 **Hook Usage**: useState

#### `/components/DarkModeToggle.tsx`

**DarkModeToggle**: `components/DarkModeToggle.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/components/EditServicesForm.tsx`

**EditServicesForm**: `components/EditServicesForm.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/components/Inbox.tsx`

**Inbox**: `components/Inbox.tsx`

- 🪝 **Hook Usage**: useState, useEffect

#### `/components/LogoutButton.tsx`

**LogoutButton**: `components/LogoutButton.tsx`

- 🪝 **Hook Usage**: useRouter

#### `/components/MessageCenter.tsx`

**MessageCenter**: `components/MessageCenter.tsx`

- 🪝 **Hook Usage**: useEffect, useRef, useState

#### `/components/PayButton.tsx`

**PayButton**: `components/PayButton.tsx`

- 🪝 **Hook Usage**: useRouter, useState

#### `/components/ProviderBookings.tsx`

**ProviderBookings**: `components/ProviderBookings.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/components/ServiceManager.tsx`

**ServiceManager**: `components/ServiceManager.tsx`

- 🪝 **Hook Usage**: useState, useEffect

#### `/components/dashboard/AvailabilityEditor.tsx`

**AvailabilityEditor**: `components/dashboard/AvailabilityEditor.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAvailability
- 🪝 **Hook Usage**: useEffect, useAvailability, useSession

#### `/components/dashboard/SlotSelectorGrid.tsx`

**SlotSelectorGrid**: `components/dashboard/SlotSelectorGrid.tsx`

- 🪝 **Hook Usage**: useRef

#### `/create-profile`

**page**: `create-profile/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState, useRouter, useSession

#### `/dashboard`

**page**: `dashboard/page.tsx`

- 🪝 **Hook Usage**: useEffect, useRouter

#### `/dashboard/:role`

**page**: `dashboard/[role]/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useState, useParams, useRouter, useAuth

#### `/dashboard/admin`

**page**: `dashboard/admin/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useState, useAuth

#### `/dashboard/admin/challenge-management`

**page**: `dashboard/admin/challenge-management/page.tsx`

- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `/dashboard/admin/earnings`

**page**: `dashboard/admin/earnings/page.tsx`

- 🪝 **Hooks**: ../../../../hooks/useEarningsData
- 🛠️ **Utils**: ../../../../lib/utils/formatCurrency
- 🪝 **Hook Usage**: useState, useEarningsData

#### `/dashboard/admin/reports`

**page**: `dashboard/admin/reports/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useState, useAuth

#### `/dashboard/admin/signature-invite`

**page**: `dashboard/admin/signature-invite/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/dashboard/admin/support`

**page**: `dashboard/admin/support/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/dashboard/admin/support/:id`

**page**: `dashboard/admin/support/[id]/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState, useParams

#### `/dashboard/admin/verification-management`

**page**: `dashboard/admin/verification-management/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useAuth

#### `/dashboard/admin/verification-requests`

**page**: `dashboard/admin/verification-requests/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/dashboard/admin/verifications`

**page**: `dashboard/admin/verifications/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `/dashboard/admin/xp-management`

**page**: `dashboard/admin/xp-management/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/adminXPService
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `/dashboard/analytics`

**page**: `dashboard/analytics/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/creatorAnalyticsService
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `/dashboard/bookings`

**page**: `dashboard/bookings/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useRef, useState, useSearchParams, useAuth

#### `/dashboard/bookings/:bookingId`

**page**: `dashboard/bookings/[bookingId]/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useParams, useSearchParams, useEffect, useState, useAuth

#### `/dashboard/bookings/DisputeButton.tsx`

**DisputeButton**: `dashboard/bookings/DisputeButton.tsx`

- 🪝 **Hook Usage**: useState

#### `/dashboard/bookings/page.bak.tsx`

**page.bak**: `dashboard/bookings/page.bak.tsx`

- 🪝 **Hook Usage**: useEffect, useRef, useState, useSearchParams

#### `/dashboard/business-intelligence`

**page**: `dashboard/business-intelligence/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/revenueOptimizationService
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `/dashboard/case-studies`

**page**: `dashboard/case-studies/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/caseStudyService
- 🪝 **Hook Usage**: useState, useEffect, useAuth, useMemo

#### `/dashboard/case-studies/:id/edit`

**page**: `dashboard/case-studies/[id]/edit/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/caseStudyService, @/lib/services/portfolioService
- 🪝 **Hook Usage**: useState, useEffect, useAuth, useRouter

#### `/dashboard/challenges`

**page**: `dashboard/challenges/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useChallengeData
- 🪝 **Hook Usage**: useState, useChallengeData, useAuth

#### `/dashboard/collabs`

**page**: `dashboard/collabs/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useAuth

#### `/dashboard/collabs/:bookingId`

**page**: `dashboard/collabs/[bookingId]/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 📋 **Types**: @/lib/types/CollabPackage
- 🪝 **Hook Usage**: useState, useEffect, useParams, useAuth

#### `/dashboard/creator-showcase`

**page**: `dashboard/creator-showcase/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/testimonialService, @/lib/services/socialProofService, @/lib/services/portfolioThemeService
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `/dashboard/creator-tools`

**page**: `dashboard/creator-tools/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/creatorAnalyticsService
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `/dashboard/earnings`

**page**: `dashboard/earnings/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/dashboard/edit`

**page**: `dashboard/edit/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useState, useAuth

#### `/dashboard/enhanced-portfolio`

**page**: `dashboard/enhanced-portfolio/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/enhancedPortfolioService
- 🪝 **Hook Usage**: useState, useEffect, useCallback, useAuth, useMemo

#### `/dashboard/enhanced-profile`

**page**: `dashboard/enhanced-profile/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/skillsBadgeService
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `/dashboard/enterprise/label-dashboard`

**page**: `dashboard/enterprise/label-dashboard/page.tsx`

- 🪝 **Hook Usage**: useState, useEffect

#### `/dashboard/favorites`

**page**: `dashboard/favorites/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useState, useAuth, useRouter

#### `/dashboard/finances`

**page**: `dashboard/finances/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState

#### `/dashboard/home`

**page**: `dashboard/home/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth, @/lib/hooks/useBadgeData, @/lib/hooks/useVerificationData
- 🪝 **Hook Usage**: useEffect, useState, useRouter, useAuth, useBadgeData, useVerificationData

#### `/dashboard/leaderboard`

**page**: `dashboard/leaderboard/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useAuth

#### `/dashboard/messages`

**page**: `dashboard/messages/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/messageService
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `/dashboard/messages/:threadId`

**page**: `dashboard/messages/[threadId]/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/messageService
- 🪝 **Hook Usage**: useState, useEffect, useRef, useParams, useRouter, useAuth

#### `/dashboard/notifications`

**page**: `dashboard/notifications/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `/dashboard/orders`

**page**: `dashboard/orders/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState, useRouter

#### `/dashboard/portfolio`

**page**: `dashboard/portfolio/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/portfolioService, @/lib/services/creatorAnalyticsService
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `/dashboard/profile`

**page**: `dashboard/profile/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth, @/lib/hooks/useBadgeData, @/lib/hooks/useVerificationData
- 🪝 **Hook Usage**: useAuth, useBadgeData, useVerificationData

#### `/dashboard/purchases`

**page**: `dashboard/purchases/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState, useRouter, useSearchParams

#### `/dashboard/purchases/:bookingId`

**page**: `dashboard/purchases/[bookingId]/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState, useParams, useSearchParams

#### `/dashboard/reviews`

**page**: `dashboard/reviews/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useState, useAuth

#### `/dashboard/settings`

**page**: `dashboard/settings/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `/dashboard/upcoming`

**page**: `dashboard/upcoming/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useState, useAuth

#### `/dashboard/verification`

**page**: `dashboard/verification/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useVerificationData, @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useRouter, useVerificationData, useAuth

#### `/explore`

**page**: `explore/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth, @/hooks/useRankedCreators
- 🪝 **Hook Usage**: useEffect, useState, useSearchParams, useRouter, useProgressiveOnboarding, useAuth, useRankedCreators

#### `/explore/:role`

**page**: `explore/[role]/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth, @/lib/hooks/useFeatureFlag
- 🪝 **Hook Usage**: useEffect, useState, useRouter, useParams, useAuth, useFeatureFlag

#### `/layout.tsx`

**layout**: `layout.tsx`

- 📡 **Context**: @/context/AuthContext, @/context/LanguageContext, @/context/CartContext, @/providers/QueryProvider, @/providers/VerificationProvider

#### `/leaderboard`

**page**: `leaderboard/page.tsx`

- 🪝 **Hook Usage**: useState

#### `/leaderboards/:city/:role`

**page**: `leaderboards/[city]/[role]/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState, useParams

#### `/login`

**page**: `login/page.tsx`

- 🪝 **Hook Usage**: useState, useRouter, useSearchParams

#### `/map`

**page**: `map/page.tsx`

- 🛠️ **Utils**: @/lib/utils/cityToCoords
- 🪝 **Hook Usage**: useState, useEffect, useRef

#### `/not-found.tsx`

**not-found**: `not-found.tsx`

- 🪝 **Hook Usage**: useState, useEffect, useRouter

#### `/offline`

**page**: `offline/page.tsx`

- ⚙️ **Services**: @/lib/services/pwaService
- 🪝 **Hook Usage**: useEffect, useState

#### `/onboarding`

**page**: `onboarding/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useRouter, useAuth

#### `/profile/:uid`

**page**: `profile/[uid]/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useState, useParams, useAuth, useProgressiveOnboarding

#### `/profile/edit`

**page**: `profile/edit/page.tsx`

- 📋 **Types**: @/types/user
- 🪝 **Hook Usage**: useEffect, useState, useRouter

#### `/search`

**page**: `search/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/advancedSearchService, @/lib/services/monitoringService, @/lib/services/cachingService
- 🪝 **Hook Usage**: useState, useEffect, useSearchParams, useRouter, useAuth

#### `/services/:id`

**page**: `services/[id]/page.tsx`

- 📡 **Context**: @/context/CartContext
- 🪝 **Hook Usage**: useEffect, useState, useParams, useRouter, useCart

#### `/services/add`

**page**: `services/add/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useAuth, useRouter

#### `/services/authService.ts`

**authService**: `services/authService.ts`

- 🪝 **Hook Usage**: useAuthState

#### `/services/edit/:id`

**page**: `services/edit/[id]/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState, useParams

#### `/set-role`

**page**: `set-role/page.tsx`

- 🪝 **Hook Usage**: useEffect, useState, useRouter

#### `/signup`

**page**: `signup/page.tsx`

- 🪝 **Hook Usage**: useRouter, useSearchParams, useState

#### `/start`

**page**: `start/page.tsx`

- 🪝 **Hook Usage**: useRouter, useSession

#### `/success`

**page**: `success/page.tsx`

- 🪝 **Hook Usage**: useSearchParams, useRouter

#### `/test-admin-verification`

**page**: `test-admin-verification/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useAuth

#### `/test-components`

**page**: `test-components/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useAuth

#### `/test-verification`

**page**: `test-verification/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useAuth, useEffect

#### `/test/badge-display`

**page**: `test/badge-display/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useBadgeData
- 🪝 **Hook Usage**: useState, useBadgeData

#### `/test/ranking-components`

**page**: `test/ranking-components/page.tsx`

- 🛠️ **Utils**: @/lib/utils/rankingDataSeeder

#### `/test/verification-components`

**page**: `test/verification-components/page.tsx`

- 🪝 **Hook Usage**: useState

#### `/test/xp-display`

**page**: `test/xp-display/page.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth, @/lib/hooks/useXPData
- ⚙️ **Services**: @/lib/services/xpServiceWithNotifications, @/lib/services/xpService
- 📡 **Context**: @/providers/XPNotificationProvider
- 🪝 **Hook Usage**: useState, useAuth, useXPData, useXPServiceWithNotifications, useXPNotificationContext

#### `/utils/withAuth.tsx`

**withAuth**: `utils/withAuth.tsx`

- 🪝 **Hook Usage**: useEffect, useState, useRouter

#### `/utils/withRoleProtection.tsx`

**withRoleProtection**: `utils/withRoleProtection.tsx`

- 🪝 **Hook Usage**: useEffect, useRouter


### Legacy Pages Router (pages/)

#### `/banned`
**File**: `banned.tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useState, useRouter, useAuth

#### `/events/:eventId`
**File**: `events/[eventId].tsx`

- 🪝 **Hooks**: @/lib/hooks/useAuth
- 📋 **Types**: @/lib/types/EventBooking
- 🪝 **Hook Usage**: useRouter, useState, useEffect, useAuth

#### `/mentorships`
**File**: `mentorships/index.tsx`

- 🛠️ **Utils**: @/lib/utils/formatCurrency
- 📋 **Types**: @/lib/types/Mentorship
- 🪝 **Hook Usage**: useState, useEffect, useRouter

#### `/portfolio-uploader-demo`
**File**: `portfolio-uploader-demo.tsx`

- 🪝 **Hook Usage**: useSession


---

## Component Dependencies Analysis

### High-Impact Components
*Components with the most logic dependencies*


#### `components/search/AdvancedSearchInterface.tsx` (10 dependencies)
- 🪝 **Hooks**: @/hooks/useDebounce, @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/advancedSearchService
- 🪝 **Hook Usage**: useState, useEffect, useRef, useCallback, useDebounce, useAuth, useEvent

#### `components/dashboard/SplitBookingsList.tsx` (8 dependencies)
- 🪝 **Hooks**: @/src/lib/hooks/useSplitBookingUpdates, @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useEffect, useSplitBookingsForUser, useSplitBookingUpdates, useAuth

#### `components/explore/DiscoveryMap.tsx` (7 dependencies)
- 🛠️ **Utils**: @/lib/utils/cityToCoords
- 📡 **Context**: @/context/LanguageContext
- 🪝 **Hook Usage**: useEffect, useRef, useMemo, useInfiniteQuery, useLanguage

#### `components/onboarding/OnboardingManager.tsx` (7 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useState, useProgressiveOnboarding, useAuth, useLeave, useEvent

#### `components/onboarding/ProgressiveOnboarding.tsx` (7 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/emailService
- 🪝 **Hook Usage**: useContext, useState, useEffect, useAuth, useProgressiveOnboarding

#### `components/BookingChatThread.tsx` (6 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useEffect, useRef, useState, useAuth, useChatMessages

#### `components/booking/BookingForm.tsx` (6 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth, @/lib/hooks/useProviderAvailability
- 🪝 **Hook Usage**: useState, useAuth, useProgressiveOnboarding, useProviderAvailability

#### `components/booking/TalentRequestModal.tsx` (6 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useEffect, useAuth, useEvent

#### `components/chat/EnhancedChatThread.tsx` (6 dependencies)
- 🪝 **Hooks**: @/hooks/useEnhancedChat
- 🪝 **Hook Usage**: useState, useEffect, useRef, useSession, useEnhancedChat

#### `components/media/MediaUpload.tsx` (6 dependencies)
- 🛠️ **Utils**: @/lib/utils/imageCompression
- 🪝 **Hook Usage**: useCallback, useState, useRef, useDropzone, useSession

#### `components/profile/ContactModal.tsx` (6 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/messageService
- 🪝 **Hook Usage**: useState, useAuth, useProgressiveOnboarding, useRouter

#### `components/ui/NotificationBell.tsx` (6 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useEffect, useRef, useAuth, useEvent

#### `components/verification/AdminVerificationDashboard.tsx` (6 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/verificationService
- 🛠️ **Utils**: @/lib/utils
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `components/booking/BookingChat.tsx` (5 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useEffect, useRef, useAuth

#### `components/booking/studio/StudioBookingForm.tsx` (5 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth, @/lib/hooks/useProviderAvailability
- 🪝 **Hook Usage**: useState, useAuth, useProviderAvailability

#### `components/collab/CreateCollabPackageForm.tsx` (5 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `components/dashboard/MessagesPreview.tsx` (5 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth
- ⚙️ **Services**: @/lib/services/messageService
- 🪝 **Hook Usage**: useEffect, useState, useAuth

#### `components/dashboard/collab/MyCollabBookings.tsx` (5 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `components/dashboard/collab/MyCollabPackages.tsx` (5 dependencies)
- 🪝 **Hooks**: @/lib/hooks/useAuth
- 🪝 **Hook Usage**: useState, useEffect, useAuth

#### `components/explore/LocationAutocomplete.tsx` (5 dependencies)
- 🪝 **Hook Usage**: useEffect, useRef, useState, useEvent, useDown


---

## Summary Statistics

### Dependency Distribution
- **Pages with dependencies**: 126
- **Components with dependencies**: 144
- **Average dependencies per page**: 3.6

### Most Used Logic Categories
- 🪝 **hooks**: 121 imports
- ⚙️ **services**: 39 imports
- 🛠️ **utils**: 33 imports
- 📋 **types**: 23 imports
- 📡 **context**: 12 imports


---

## Analysis Notes

This dependency graph is based on:
- Static analysis of import statements
- Pattern matching for hooks, services, utils, context, and types
- Hook usage detection in component code

**Key Insights**:
- High dependency counts may indicate components that could benefit from refactoring
- Centralized services show good separation of concerns
- Hook usage patterns reveal state management strategies

Generated by: AuditoryX System Integration Audit
