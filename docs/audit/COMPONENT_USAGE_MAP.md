# Component Usage Map

This document maps all components in the AuditoryX codebase and their usage across pages.

Generated on: 2025-07-19T06:15:00.370Z

## Legend
- 🟢 **Global**: Used across multiple pages/components (5+ usages)
- 🟡 **Specific**: Used in specific contexts only (2-4 usages)
- 🟠 **Limited**: Used in only one place (1 usage)
- 🔴 **Unused**: Not found in any imports (0 usages)

---

## Component Usage Analysis

### Summary Statistics
- **Total Components**: 401
- **Total Import Paths Tracked**: 514

### 🟢 Global Components (40)
*Used across multiple pages/components (5+ usages)*

#### function
- **Defined in**: src/components/BannedModal.tsx, src/components/BannedNotice.tsx, src/components/CaseStudyCard.tsx, src/components/Navbar.tsx, src/components/PortfolioUploader.tsx, src/components/RoleToggle.tsx, src/components/SEOMeta.tsx, src/components/admin/AdminVerificationRequests.tsx, src/components/admin/AssignRoleForm.tsx, src/components/admin/EarningsChart.tsx, src/components/admin/TopRolesCard.tsx, src/components/badges/SignatureBadge.tsx, src/components/book/BookingSidebar.tsx, src/components/booking/BookingCalendar.tsx, src/components/booking/BookingChat.tsx, src/components/booking/BookingChatTopBar.tsx, src/components/booking/BookingForm.tsx, src/components/booking/BookingStatusCard.tsx, src/components/booking/BookingSummarySidebar.tsx, src/components/booking/ReleaseFundsButton.tsx, src/components/booking/ReviewForm.tsx, src/components/booking/TrustBadges.tsx, src/components/booking/studio/QuoteCalculator.tsx, src/components/booking/studio/StudioBookingForm.tsx, src/components/bookings/BookingsList.tsx, src/components/calendar/CalendarSync.tsx, src/components/cards/CreatorCard.tsx, src/components/cart/FloatingCartButton.tsx, src/components/chat/EnhancedChatThread.tsx, src/components/chat/PresenceIndicator.tsx, src/components/chat/TypingIndicator.tsx, src/components/checkout/StripeWrapper.tsx, src/components/contract/ContractViewer.tsx, src/components/dashboard/BookingsPreview.tsx, src/components/dashboard/BottomNav.tsx, src/components/dashboard/DashboardRoleOverview.tsx, src/components/dashboard/EarningsDashboard.tsx, src/components/dashboard/MessagesPreview.tsx, src/components/dashboard/MyServicesPreview.tsx, src/components/dashboard/NotificationsPanel.tsx, src/components/dashboard/ProfileCompletionMeter.tsx, src/components/dashboard/ReviewPrompt.tsx, src/components/dashboard/RoleDashboardLayout.tsx, src/components/dashboard/RoleOverview.tsx, src/components/dashboard/RoleSwitcher.tsx, src/components/dashboard/Sidebar.tsx, src/components/dashboard/collab/CollabDashboard.tsx, src/components/dashboard/collab/CollabStatsWidget.tsx, src/components/dashboard/collab/MyCollabBookings.tsx, src/components/dashboard/collab/MyCollabPackages.tsx, src/components/disputes/DisputeButton.tsx, src/components/disputes/DisputeForm.tsx, src/components/event/EventBookingForm.tsx, src/components/explore/DiscoveryGrid.tsx, src/components/explore/DiscoveryMap.tsx, src/components/explore/FilterPanel.tsx, src/components/explore/GenreBadges.tsx, src/components/explore/LocationAutocomplete.tsx, src/components/explore/NewExploreGrid.tsx, src/components/explore/SavedFilters.tsx, src/components/explore/SearchBar.tsx, src/components/forms/CreateMentorshipForm.tsx, src/components/forms/MentorshipBookingForm.tsx, src/components/gamification/BadgeCard.tsx, src/components/gamification/BadgeGrid.tsx, src/components/gamification/BadgeNotification.tsx, src/components/gamification/BadgeProgress.tsx, src/components/leaderboard/LeaderboardList.tsx, src/components/media/MediaUpload.tsx, src/components/media/PortfolioGallery.tsx, src/components/onboarding/CompletionNotice.tsx, src/components/onboarding/EmailCaptureModal.tsx, src/components/onboarding/OnboardingManager.tsx, src/components/onboarding/OnboardingStepHeader.tsx, src/components/onboarding/OnboardingWizard.tsx, src/components/onboarding/RoleSelectCard.tsx, src/components/onboarding/SignupPromptModal.tsx, src/components/onboarding/TourTooltip.tsx, src/components/pay/PayButton.tsx, src/components/portfolio/themes/PortfolioThemeSelector.tsx, src/components/profile/AvailabilitySelector.tsx, src/components/profile/ContactModal.tsx, src/components/profile/CreatorNotificationButton.tsx, src/components/profile/EnhancedMediaGallery.tsx, src/components/profile/IDVerificationForm/IDVerificationForm.tsx, src/components/profile/IDVerificationForm.tsx, src/components/profile/MediaCarousel.tsx, src/components/profile/ProfileActionBar.tsx, src/components/profile/ProfileForm.tsx, src/components/profile/ProfileReviewList.tsx, src/components/profile/RatingBarChart.tsx, src/components/rankings/Leaderboard.tsx, src/components/rankings/LeaderboardWidget.tsx, src/components/roles/ArtistDashboard.tsx, src/components/roles/DefaultDashboard.tsx, src/components/roles/EngineerDashboard.tsx, src/components/roles/ProducerDashboard.tsx, src/components/roles/StudioDashboard.tsx, src/components/roles/VideographerDashboard.tsx, src/components/settings/SubscriptionSettings.tsx, src/components/social-proof/SocialProofWidgets.tsx, src/components/testimonials/TestimonialManager.tsx, src/components/ui/AvatarRing.tsx, src/components/ui/LanguageSwitcher.tsx, src/components/ui/SidebarItem.tsx, src/components/ui/StarRating.tsx, src/components/ui/VerifiedBadge.tsx, src/components/ui/WalkthroughOverlay.tsx, src/components/verification/VerificationGuide.tsx, src/components/verification/VerificationNotificationManager.tsx
- **Usage count**: 43
- **Used in**:
  - `components/ClientBookings.tsx`
  - `components/ProviderBookings.tsx`
  - `src/app/dashboard/bookings/[bookingId]/page.tsx`
  - `src/app/dashboard/bookings/page.bak.tsx`
  - `src/app/dashboard/bookings/page.tsx`
  - `pages/banned.tsx`
  - `pages/portfolio-uploader-demo.tsx`
  - `src/app/(dashboard)/dashboard/artist/page.tsx`
  - `src/app/(dashboard)/dashboard/engineer/page.tsx`
  - `src/app/(dashboard)/dashboard/producer/page.tsx`
  - ... and 33 more files

#### Button
- **Defined in**: src/components/ui/Button.tsx, src/components/ui/button.tsx
- **Usage count**: 17
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/admin/xp-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/dashboard/leaderboard/page.tsx`
  - `src/app/dashboard/verification/page.tsx`
  - `src/app/page.tsx`
  - `src/app/test/ranking-components/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/challenges/ChallengeCard.tsx`
  - `src/components/challenges/ChallengeGrid.tsx`
  - ... and 7 more files

#### Button 
- **Defined in**: src/components/ui/Button.tsx
- **Usage count**: 17
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/admin/xp-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/dashboard/leaderboard/page.tsx`
  - `src/app/dashboard/verification/page.tsx`
  - `src/app/page.tsx`
  - `src/app/test/ranking-components/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/challenges/ChallengeCard.tsx`
  - `src/components/challenges/ChallengeGrid.tsx`
  - ... and 7 more files

#### Card
- **Defined in**: src/components/ui/Card.tsx, src/components/ui/card.tsx
- **Usage count**: 17
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/admin/xp-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/dashboard/leaderboard/page.tsx`
  - `src/app/dashboard/verification/page.tsx`
  - `src/app/test/ranking-components/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/admin/TopRolesCard.tsx`
  - `src/components/challenges/ChallengeCard.tsx`
  - `src/components/challenges/ChallengeGrid.tsx`
  - ... and 7 more files

#### CardContent
- **Defined in**: src/components/ui/card.tsx
- **Usage count**: 17
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/admin/xp-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/dashboard/leaderboard/page.tsx`
  - `src/app/dashboard/verification/page.tsx`
  - `src/app/test/ranking-components/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/admin/TopRolesCard.tsx`
  - `src/components/challenges/ChallengeCard.tsx`
  - `src/components/challenges/ChallengeGrid.tsx`
  - ... and 7 more files

#### CardDescription
- **Defined in**: src/components/ui/card.tsx
- **Usage count**: 17
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/admin/xp-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/dashboard/leaderboard/page.tsx`
  - `src/app/dashboard/verification/page.tsx`
  - `src/app/test/ranking-components/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/admin/TopRolesCard.tsx`
  - `src/components/challenges/ChallengeCard.tsx`
  - `src/components/challenges/ChallengeGrid.tsx`
  - ... and 7 more files

#### CardFooter
- **Defined in**: src/components/ui/Card.tsx, src/components/ui/card.tsx
- **Usage count**: 17
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/admin/xp-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/dashboard/leaderboard/page.tsx`
  - `src/app/dashboard/verification/page.tsx`
  - `src/app/test/ranking-components/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/admin/TopRolesCard.tsx`
  - `src/components/challenges/ChallengeCard.tsx`
  - `src/components/challenges/ChallengeGrid.tsx`
  - ... and 7 more files

#### CardHeader
- **Defined in**: src/components/ui/Card.tsx, src/components/ui/card.tsx
- **Usage count**: 17
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/admin/xp-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/dashboard/leaderboard/page.tsx`
  - `src/app/dashboard/verification/page.tsx`
  - `src/app/test/ranking-components/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/admin/TopRolesCard.tsx`
  - `src/components/challenges/ChallengeCard.tsx`
  - `src/components/challenges/ChallengeGrid.tsx`
  - ... and 7 more files

#### CardTitle
- **Defined in**: src/components/ui/card.tsx
- **Usage count**: 17
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/admin/xp-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/dashboard/leaderboard/page.tsx`
  - `src/app/dashboard/verification/page.tsx`
  - `src/app/test/ranking-components/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/admin/TopRolesCard.tsx`
  - `src/components/challenges/ChallengeCard.tsx`
  - `src/components/challenges/ChallengeGrid.tsx`
  - ... and 7 more files

#### Badge
- **Defined in**: src/components/ui/Badge.tsx, src/components/ui/badge.tsx
- **Usage count**: 16
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/admin/xp-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/dashboard/leaderboard/page.tsx`
  - `src/app/dashboard/verification/page.tsx`
  - `src/app/test/ranking-components/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/challenges/ChallengeCard.tsx`
  - `src/components/challenges/ChallengeGrid.tsx`
  - `src/components/challenges/ChallengeLeaderboard.tsx`
  - ... and 6 more files

#### badgeVariants
- **Defined in**: src/components/ui/badge.tsx
- **Usage count**: 16
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/admin/xp-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/dashboard/leaderboard/page.tsx`
  - `src/app/dashboard/verification/page.tsx`
  - `src/app/test/ranking-components/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/challenges/ChallengeCard.tsx`
  - `src/components/challenges/ChallengeGrid.tsx`
  - `src/components/challenges/ChallengeLeaderboard.tsx`
  - ... and 6 more files

#### getStatusIcon
- **Defined in**: src/components/admin/VerificationReviewCard.tsx, src/components/dashboard/MyServicesPreview.tsx, src/components/dashboard/collab/MyCollabBookings.tsx, src/components/profile/ApplyVerificationButton.tsx, src/components/testimonials/TestimonialManager.tsx
- **Usage count**: 8
- **Used in**:
  - `src/app/dashboard/[role]/page.tsx`
  - `src/app/dashboard/admin/verifications/page.tsx`
  - `src/app/test-admin-verification/page.tsx`
  - `src/app/dashboard/creator-showcase/page.tsx`
  - `src/app/profile/[uid]/page.tsx`
  - `src/app/profile/edit/page.tsx`
  - `src/app/test-verification/page.tsx`
  - `src/components/dashboard/collab/CollabDashboard.tsx`

#### ProgressiveOnboardingProvider
- **Defined in**: src/components/onboarding/ProgressiveOnboarding.tsx
- **Usage count**: 8
- **Used in**:
  - `src/app/explore/page.tsx`
  - `src/app/layout.tsx`
  - `src/app/profile/[uid]/page.tsx`
  - `src/components/booking/BookingForm.tsx`
  - `src/components/profile/ContactModal.tsx`
  - `src/components/profile/CreatorNotificationButton.tsx`
  - `src/components/profile/SaveButton.tsx`
  - `src/hooks/useEmailCapture.ts`

#### shouldShowEmailCapture
- **Defined in**: src/components/onboarding/ProgressiveOnboarding.tsx
- **Usage count**: 8
- **Used in**:
  - `src/app/explore/page.tsx`
  - `src/app/layout.tsx`
  - `src/app/profile/[uid]/page.tsx`
  - `src/components/booking/BookingForm.tsx`
  - `src/components/profile/ContactModal.tsx`
  - `src/components/profile/CreatorNotificationButton.tsx`
  - `src/components/profile/SaveButton.tsx`
  - `src/hooks/useEmailCapture.ts`

#### shouldShowExitIntent
- **Defined in**: src/components/onboarding/ProgressiveOnboarding.tsx
- **Usage count**: 8
- **Used in**:
  - `src/app/explore/page.tsx`
  - `src/app/layout.tsx`
  - `src/app/profile/[uid]/page.tsx`
  - `src/components/booking/BookingForm.tsx`
  - `src/components/profile/ContactModal.tsx`
  - `src/components/profile/CreatorNotificationButton.tsx`
  - `src/components/profile/SaveButton.tsx`
  - `src/hooks/useEmailCapture.ts`

#### shouldShowSignupPrompt
- **Defined in**: src/components/onboarding/ProgressiveOnboarding.tsx
- **Usage count**: 8
- **Used in**:
  - `src/app/explore/page.tsx`
  - `src/app/layout.tsx`
  - `src/app/profile/[uid]/page.tsx`
  - `src/components/booking/BookingForm.tsx`
  - `src/components/profile/ContactModal.tsx`
  - `src/components/profile/CreatorNotificationButton.tsx`
  - `src/components/profile/SaveButton.tsx`
  - `src/hooks/useEmailCapture.ts`

#### trackAction
- **Defined in**: src/components/onboarding/ProgressiveOnboarding.tsx
- **Usage count**: 8
- **Used in**:
  - `src/app/explore/page.tsx`
  - `src/app/layout.tsx`
  - `src/app/profile/[uid]/page.tsx`
  - `src/components/booking/BookingForm.tsx`
  - `src/components/profile/ContactModal.tsx`
  - `src/components/profile/CreatorNotificationButton.tsx`
  - `src/components/profile/SaveButton.tsx`
  - `src/hooks/useEmailCapture.ts`

#### updateState
- **Defined in**: src/components/onboarding/ProgressiveOnboarding.tsx
- **Usage count**: 8
- **Used in**:
  - `src/app/explore/page.tsx`
  - `src/app/layout.tsx`
  - `src/app/profile/[uid]/page.tsx`
  - `src/components/booking/BookingForm.tsx`
  - `src/components/profile/ContactModal.tsx`
  - `src/components/profile/CreatorNotificationButton.tsx`
  - `src/components/profile/SaveButton.tsx`
  - `src/hooks/useEmailCapture.ts`

#### useProgressiveOnboarding
- **Defined in**: src/components/onboarding/ProgressiveOnboarding.tsx
- **Usage count**: 8
- **Used in**:
  - `src/app/explore/page.tsx`
  - `src/app/layout.tsx`
  - `src/app/profile/[uid]/page.tsx`
  - `src/components/booking/BookingForm.tsx`
  - `src/components/profile/ContactModal.tsx`
  - `src/components/profile/CreatorNotificationButton.tsx`
  - `src/components/profile/SaveButton.tsx`
  - `src/hooks/useEmailCapture.ts`

#### ProfileCompletionMeter
- **Defined in**: src/components/dashboard/ProfileCompletionMeter.tsx
- **Usage count**: 7
- **Used in**:
  - `src/app/(dashboard)/dashboard/artist/page.tsx`
  - `src/app/(dashboard)/dashboard/engineer/page.tsx`
  - `src/app/(dashboard)/dashboard/producer/page.tsx`
  - `src/app/(dashboard)/dashboard/studio/page.tsx`
  - `src/app/(dashboard)/dashboard/videographer/page.tsx`
  - `src/app/dashboard/edit/page.tsx`
  - `src/app/profile/edit/page.tsx`

#### TierBadge
- **Defined in**: src/components/badges/TierBadge.tsx, src/components/ui/TierBadge.tsx
- **Usage count**: 7
- **Used in**:
  - `src/app/profile/[uid]/page.tsx`
  - `src/components/cards/CreatorCard.tsx`
  - `src/components/dashboard/RankProgress.tsx`
  - `src/components/leaderboard/Leaderboard.tsx`
  - `src/components/book/BookingSidebar.tsx`
  - `src/components/booking/BookingSummarySidebar.tsx`
  - `src/components/dashboard/RoleOverview.tsx`

#### ContractViewer
- **Defined in**: src/components/contract/ContractViewer.tsx
- **Usage count**: 5
- **Used in**:
  - `components/ClientBookings.tsx`
  - `components/ProviderBookings.tsx`
  - `src/app/dashboard/bookings/[bookingId]/page.tsx`
  - `src/app/dashboard/bookings/page.bak.tsx`
  - `src/app/dashboard/bookings/page.tsx`

#### DashboardRoleOverview
- **Defined in**: src/components/dashboard/DashboardRoleOverview.tsx
- **Usage count**: 5
- **Used in**:
  - `src/app/(dashboard)/dashboard/artist/page.tsx`
  - `src/app/(dashboard)/dashboard/engineer/page.tsx`
  - `src/app/(dashboard)/dashboard/producer/page.tsx`
  - `src/app/(dashboard)/dashboard/studio/page.tsx`
  - `src/app/(dashboard)/dashboard/videographer/page.tsx`

#### EmptyState
- **Defined in**: src/components/ui/EmptyState.tsx
- **Usage count**: 5
- **Used in**:
  - `components/ClientBookings.tsx`
  - `components/ProviderBookings.tsx`
  - `components/dashboard/ServicesList.tsx`
  - `src/components/leaderboard/Leaderboard.tsx`
  - `src/components/profile/ProfileReviewList.tsx`

#### EmptyState 
- **Defined in**: src/components/ui/EmptyState.tsx
- **Usage count**: 5
- **Used in**:
  - `components/ClientBookings.tsx`
  - `components/ProviderBookings.tsx`
  - `components/dashboard/ServicesList.tsx`
  - `src/components/leaderboard/Leaderboard.tsx`
  - `src/components/profile/ProfileReviewList.tsx`

#### getStatusColor
- **Defined in**: src/components/admin/VerificationReviewCard.tsx, src/components/challenges/ChallengeCard.tsx, src/components/chat/PresenceIndicator.tsx, src/components/dashboard/BookingsPreview.tsx, src/components/dashboard/MyServicesPreview.tsx, src/components/dashboard/collab/MyCollabBookings.tsx, src/components/testimonials/TestimonialManager.tsx
- **Usage count**: 5
- **Used in**:
  - `src/app/dashboard/[role]/page.tsx`
  - `src/app/dashboard/admin/verifications/page.tsx`
  - `src/app/test-admin-verification/page.tsx`
  - `src/app/dashboard/creator-showcase/page.tsx`
  - `src/components/dashboard/collab/CollabDashboard.tsx`

#### NoBookings
- **Defined in**: src/components/ui/EmptyState.tsx
- **Usage count**: 5
- **Used in**:
  - `components/ClientBookings.tsx`
  - `components/ProviderBookings.tsx`
  - `components/dashboard/ServicesList.tsx`
  - `src/components/leaderboard/Leaderboard.tsx`
  - `src/components/profile/ProfileReviewList.tsx`

#### NoCreatorsFound
- **Defined in**: src/components/ui/EmptyState.tsx
- **Usage count**: 5
- **Used in**:
  - `components/ClientBookings.tsx`
  - `components/ProviderBookings.tsx`
  - `components/dashboard/ServicesList.tsx`
  - `src/components/leaderboard/Leaderboard.tsx`
  - `src/components/profile/ProfileReviewList.tsx`

#### NoMessages
- **Defined in**: src/components/ui/EmptyState.tsx
- **Usage count**: 5
- **Used in**:
  - `components/ClientBookings.tsx`
  - `components/ProviderBookings.tsx`
  - `components/dashboard/ServicesList.tsx`
  - `src/components/leaderboard/Leaderboard.tsx`
  - `src/components/profile/ProfileReviewList.tsx`

#### NoReviews
- **Defined in**: src/components/ui/EmptyState.tsx
- **Usage count**: 5
- **Used in**:
  - `components/ClientBookings.tsx`
  - `components/ProviderBookings.tsx`
  - `components/dashboard/ServicesList.tsx`
  - `src/components/leaderboard/Leaderboard.tsx`
  - `src/components/profile/ProfileReviewList.tsx`

#### NoSearchResults
- **Defined in**: src/components/ui/EmptyState.tsx
- **Usage count**: 5
- **Used in**:
  - `components/ClientBookings.tsx`
  - `components/ProviderBookings.tsx`
  - `components/dashboard/ServicesList.tsx`
  - `src/components/leaderboard/Leaderboard.tsx`
  - `src/components/profile/ProfileReviewList.tsx`

#### NoServices
- **Defined in**: src/components/ui/EmptyState.tsx
- **Usage count**: 5
- **Used in**:
  - `components/ClientBookings.tsx`
  - `components/ProviderBookings.tsx`
  - `components/dashboard/ServicesList.tsx`
  - `src/components/leaderboard/Leaderboard.tsx`
  - `src/components/profile/ProfileReviewList.tsx`

#### ReviewForm
- **Defined in**: src/components/ReviewForm.tsx, src/components/booking/ReviewForm.tsx
- **Usage count**: 5
- **Used in**:
  - `src/app/booking/[bookingId]/page.tsx`
  - `src/app/dashboard/bookings/[bookingId]/page.tsx`
  - `src/app/dashboard/bookings/page.bak.tsx`
  - `src/app/dashboard/bookings/page.tsx`
  - `src/components/dashboard/ReviewPrompt.tsx`

#### SaveButton
- **Defined in**: src/components/explore/SaveButton.tsx, src/components/profile/SaveButton.tsx
- **Usage count**: 5
- **Used in**:
  - `src/app/explore/[role]/page.tsx`
  - `src/app/profile/[uid]/page.tsx`
  - `src/app/services/[id]/page.tsx`
  - `src/components/explore/DiscoveryGrid.tsx`
  - `src/components/explore/NewExploreGrid.tsx`

#### SkeletonCard
- **Defined in**: src/components/ui/SkeletonCard.tsx
- **Usage count**: 5
- **Used in**:
  - `components/ClientBookings.tsx`
  - `components/ProviderBookings.tsx`
  - `components/dashboard/ServicesList.tsx`
  - `src/components/leaderboard/Leaderboard.tsx`
  - `src/components/profile/ProfileReviewList.tsx`

#### SkeletonCard 
- **Defined in**: src/components/ui/SkeletonCard.tsx
- **Usage count**: 5
- **Used in**:
  - `components/ClientBookings.tsx`
  - `components/ProviderBookings.tsx`
  - `components/dashboard/ServicesList.tsx`
  - `src/components/leaderboard/Leaderboard.tsx`
  - `src/components/profile/ProfileReviewList.tsx`

#### Tabs
- **Defined in**: src/components/ui/tabs.tsx
- **Usage count**: 5
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/rankings/Leaderboard.tsx`
  - `src/components/verification/AdminVerificationDashboard.tsx`

#### TabsContent
- **Defined in**: src/components/ui/tabs.tsx
- **Usage count**: 5
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/rankings/Leaderboard.tsx`
  - `src/components/verification/AdminVerificationDashboard.tsx`

#### TabsList
- **Defined in**: src/components/ui/tabs.tsx
- **Usage count**: 5
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/rankings/Leaderboard.tsx`
  - `src/components/verification/AdminVerificationDashboard.tsx`

#### TabsTrigger
- **Defined in**: src/components/ui/tabs.tsx
- **Usage count**: 5
- **Used in**:
  - `src/app/dashboard/admin/challenge-management/page.tsx`
  - `src/app/dashboard/challenges/page.tsx`
  - `src/app/test/verification-components/page.tsx`
  - `src/components/rankings/Leaderboard.tsx`
  - `src/components/verification/AdminVerificationDashboard.tsx`

### 🟡 Specific Components (61)
*Used in specific contexts only (2-4 usages)*

#### Avatar
- **Defined in**: src/components/ui/avatar.tsx
- **Usage count**: 4
- **Used in**: src/components/challenges/ChallengeLeaderboard.tsx, src/components/rankings/Leaderboard.tsx, src/components/rankings/LeaderboardWidget.tsx, src/components/verification/AdminVerificationDashboard.tsx

#### AvatarFallback
- **Defined in**: src/components/ui/avatar.tsx
- **Usage count**: 4
- **Used in**: src/components/challenges/ChallengeLeaderboard.tsx, src/components/rankings/Leaderboard.tsx, src/components/rankings/LeaderboardWidget.tsx, src/components/verification/AdminVerificationDashboard.tsx

#### AvatarImage
- **Defined in**: src/components/ui/avatar.tsx
- **Usage count**: 4
- **Used in**: src/components/challenges/ChallengeLeaderboard.tsx, src/components/rankings/Leaderboard.tsx, src/components/rankings/LeaderboardWidget.tsx, src/components/verification/AdminVerificationDashboard.tsx

#### getRankIcon
- **Defined in**: src/components/leaderboard/Leaderboard.tsx, src/components/rankings/Leaderboard.tsx, src/components/rankings/LeaderboardWidget.tsx
- **Usage count**: 4
- **Used in**: src/app/dashboard/home/page.tsx, src/app/dashboard/leaderboard/page.tsx, src/app/test/ranking-components/page.tsx, src/app/leaderboard/page.tsx

#### PointsBadge
- **Defined in**: src/components/profile/PointsBadge.tsx
- **Usage count**: 4
- **Used in**: src/app/leaderboards/[city]/[role]/page.tsx, src/app/profile/[uid]/page.tsx, src/components/explore/DiscoveryGrid.tsx, src/components/explore/NewExploreGrid.tsx

#### TierBadge 
- **Defined in**: src/components/badges/TierBadge.tsx
- **Usage count**: 4
- **Used in**: src/app/profile/[uid]/page.tsx, src/components/cards/CreatorCard.tsx, src/components/dashboard/RankProgress.tsx, src/components/leaderboard/Leaderboard.tsx

#### VerificationStatusWidget
- **Defined in**: src/components/verification/VerificationStatusWidget.tsx
- **Usage count**: 4
- **Used in**: src/app/dashboard/home/page.tsx, src/app/dashboard/profile/page.tsx, src/app/dashboard/verification/page.tsx, src/app/test/verification-components/page.tsx

#### ApplyVerificationButton
- **Defined in**: src/components/profile/ApplyVerificationButton.tsx
- **Usage count**: 3
- **Used in**: src/app/profile/[uid]/page.tsx, src/app/profile/edit/page.tsx, src/app/test-verification/page.tsx

#### BadgeProgress
- **Defined in**: src/components/gamification/BadgeProgress.tsx
- **Usage count**: 3
- **Used in**: src/app/dashboard/home/page.tsx, src/app/dashboard/profile/page.tsx, src/app/test/badge-display/page.tsx

#### BookingChat
- **Defined in**: src/components/booking/BookingChat.tsx
- **Usage count**: 3
- **Used in**: src/app/dashboard/bookings/[bookingId]/page.tsx, src/app/dashboard/bookings/page.tsx, src/app/dashboard/purchases/[bookingId]/page.tsx

#### DisputeForm
- **Defined in**: src/components/disputes/DisputeForm.tsx
- **Usage count**: 3
- **Used in**: src/app/dashboard/bookings/[bookingId]/page.tsx, src/app/dashboard/bookings/page.bak.tsx, src/app/dashboard/bookings/page.tsx

#### formatAwardedDate
- **Defined in**: src/components/gamification/BadgeCard.tsx, src/components/gamification/BadgeProgress.tsx
- **Usage count**: 3
- **Used in**: src/app/dashboard/home/page.tsx, src/app/dashboard/profile/page.tsx, src/app/test/badge-display/page.tsx

#### formatDate
- **Defined in**: src/components/booking/ContractPreview.tsx, src/components/dashboard/BookingsPreview.tsx, src/components/verification/AdminVerificationDashboard.tsx
- **Usage count**: 3
- **Used in**: src/app/booking/preview/[bookingId]/page.tsx, src/app/dashboard/[role]/page.tsx, src/app/dashboard/admin/verification-management/page.tsx

#### getStatusDescription
- **Defined in**: src/components/profile/ApplyVerificationButton.tsx
- **Usage count**: 3
- **Used in**: src/app/profile/[uid]/page.tsx, src/app/profile/edit/page.tsx, src/app/test-verification/page.tsx

#### getStatusText
- **Defined in**: src/components/chat/PresenceIndicator.tsx, src/components/profile/ApplyVerificationButton.tsx
- **Usage count**: 3
- **Used in**: src/app/profile/[uid]/page.tsx, src/app/profile/edit/page.tsx, src/app/test-verification/page.tsx

#### handleClickOutside
- **Defined in**: src/components/search/AdvancedSearchInterface.tsx, src/components/ui/NotificationBell.tsx
- **Usage count**: 3
- **Used in**: src/app/search/page.tsx, src/app/test-components/page.tsx, src/components/Navbar.tsx

#### handleSuccess
- **Defined in**: src/components/profile/ApplyVerificationButton.tsx
- **Usage count**: 3
- **Used in**: src/app/profile/[uid]/page.tsx, src/app/profile/edit/page.tsx, src/app/test-verification/page.tsx

#### handleTyping
- **Defined in**: src/components/booking/BookingChat.tsx
- **Usage count**: 3
- **Used in**: src/app/dashboard/bookings/[bookingId]/page.tsx, src/app/dashboard/bookings/page.tsx, src/app/dashboard/purchases/[bookingId]/page.tsx

#### Leaderboard
- **Defined in**: src/components/leaderboard/Leaderboard.tsx, src/components/rankings/Leaderboard.tsx
- **Usage count**: 3
- **Used in**: src/app/dashboard/leaderboard/page.tsx, src/app/test/ranking-components/page.tsx, src/app/leaderboard/page.tsx

#### Progress
- **Defined in**: src/components/ui/progress.tsx
- **Usage count**: 3
- **Used in**: src/components/challenges/ChallengeLeaderboard.tsx, src/components/verification/VerificationProgress.tsx, src/components/verification/VerificationStatusWidget.tsx

#### ReleaseFundsButton
- **Defined in**: src/components/booking/ReleaseFundsButton.tsx
- **Usage count**: 3
- **Used in**: src/app/dashboard/bookings/[bookingId]/page.tsx, src/app/dashboard/bookings/page.bak.tsx, src/app/dashboard/bookings/page.tsx

#### RoleDashboardLayout
- **Defined in**: src/components/dashboard/RoleDashboardLayout.tsx
- **Usage count**: 3
- **Used in**: src/app/dashboard/[role]/page.tsx, src/app/dashboard/collabs/[bookingId]/page.tsx, src/app/dashboard/collabs/page.tsx

#### SignatureBadge
- **Defined in**: src/components/badges/SignatureBadge.tsx
- **Usage count**: 3
- **Used in**: src/app/admin/users/page.tsx, src/app/profile/[uid]/page.tsx, src/components/cards/CreatorCard.tsx

#### update
- **Defined in**: src/components/booking/BookingChat.tsx, src/components/ui/StarRating.tsx
- **Usage count**: 3
- **Used in**: src/app/dashboard/bookings/[bookingId]/page.tsx, src/app/dashboard/bookings/page.tsx, src/app/dashboard/purchases/[bookingId]/page.tsx

#### XPWidget
- **Defined in**: src/components/gamification/XPWidget.tsx
- **Usage count**: 3
- **Used in**: src/app/dashboard/home/page.tsx, src/app/dashboard/profile/page.tsx, src/app/test/xp-display/page.tsx

#### BadgeGrid
- **Defined in**: src/components/gamification/BadgeGrid.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/profile/page.tsx, src/app/test/badge-display/page.tsx

#### BadgeNotification
- **Defined in**: src/components/gamification/BadgeNotification.tsx
- **Usage count**: 2
- **Used in**: src/app/test/badge-display/page.tsx, src/providers/BadgeProvider.tsx

#### BookingInbox
- **Defined in**: src/components/dashboard/BookingInbox.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/inbox/page.tsx, src/app/test-components/page.tsx

#### BookingSummary
- **Defined in**: src/components/BookingSummary.tsx
- **Usage count**: 2
- **Used in**: src/app/booking/[bookingId]/page.tsx, src/app/booking/page.tsx

#### GenreBadges
- **Defined in**: src/components/explore/GenreBadges.tsx
- **Usage count**: 2
- **Used in**: src/components/explore/DiscoveryGrid.tsx, src/components/explore/NewExploreGrid.tsx

#### getApplicationStatusBadge
- **Defined in**: src/components/verification/VerificationProgress.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/verification/page.tsx, src/app/test/verification-components/page.tsx

#### getBookingStatusColor
- **Defined in**: src/components/dashboard/BookingInbox.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/inbox/page.tsx, src/app/test-components/page.tsx

#### getCategoryIcon
- **Defined in**: src/components/rankings/LeaderboardWidget.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/home/page.tsx, src/app/dashboard/leaderboard/page.tsx

#### getCategoryLabel
- **Defined in**: src/components/rankings/LeaderboardWidget.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/home/page.tsx, src/app/dashboard/leaderboard/page.tsx

#### getNotificationIcon
- **Defined in**: src/components/ui/NotificationBell.tsx
- **Usage count**: 2
- **Used in**: src/app/test-components/page.tsx, src/components/Navbar.tsx

#### getPercentile
- **Defined in**: src/components/rankings/LeaderboardWidget.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/home/page.tsx, src/app/dashboard/leaderboard/page.tsx

#### getRankColor
- **Defined in**: src/components/rankings/LeaderboardWidget.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/home/page.tsx, src/app/dashboard/leaderboard/page.tsx

#### getTierColor
- **Defined in**: src/components/rankings/Leaderboard.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/leaderboard/page.tsx, src/app/test/ranking-components/page.tsx

#### handleBookingClick
- **Defined in**: src/components/dashboard/BookingInbox.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/inbox/page.tsx, src/app/test-components/page.tsx

#### handleClose
- **Defined in**: src/components/gamification/BadgeNotification.tsx, src/components/ui/WalkthroughOverlay.tsx
- **Usage count**: 2
- **Used in**: src/app/test/badge-display/page.tsx, src/providers/BadgeProvider.tsx

#### handleDismiss
- **Defined in**: src/components/gamification/XPNotificationSystem.tsx, src/components/verification/VerificationNotification.tsx
- **Usage count**: 2
- **Used in**: src/app/test/verification-components/page.tsx, src/components/verification/VerificationNotificationManager.tsx

#### handleMessageClick
- **Defined in**: src/components/dashboard/BookingInbox.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/inbox/page.tsx, src/app/test-components/page.tsx

#### Input
- **Defined in**: src/components/ui/input.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/admin/challenge-management/page.tsx, src/components/verification/AdminVerificationDashboard.tsx

#### LeaderboardContent
- **Defined in**: src/components/rankings/Leaderboard.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/leaderboard/page.tsx, src/app/test/ranking-components/page.tsx

#### LeaderboardWidget
- **Defined in**: src/components/rankings/LeaderboardWidget.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/home/page.tsx, src/app/dashboard/leaderboard/page.tsx

#### NotificationBell
- **Defined in**: src/components/ui/NotificationBell.tsx
- **Usage count**: 2
- **Used in**: src/app/test-components/page.tsx, src/components/Navbar.tsx

#### Textarea
- **Defined in**: src/components/ui/textarea.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/admin/challenge-management/page.tsx, src/components/verification/AdminVerificationDashboard.tsx

#### toggleDropdown
- **Defined in**: src/components/ui/NotificationBell.tsx
- **Usage count**: 2
- **Used in**: src/app/test-components/page.tsx, src/components/Navbar.tsx

#### UserRankingWidget
- **Defined in**: src/components/rankings/LeaderboardWidget.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/home/page.tsx, src/app/dashboard/leaderboard/page.tsx

#### VerificationAppliedNotification
- **Defined in**: src/components/verification/VerificationNotification.tsx
- **Usage count**: 2
- **Used in**: src/app/test/verification-components/page.tsx, src/components/verification/VerificationNotificationManager.tsx

#### VerificationApprovedNotification
- **Defined in**: src/components/verification/VerificationNotification.tsx
- **Usage count**: 2
- **Used in**: src/app/test/verification-components/page.tsx, src/components/verification/VerificationNotificationManager.tsx

#### VerificationEligibleNotification
- **Defined in**: src/components/verification/VerificationNotification.tsx
- **Usage count**: 2
- **Used in**: src/app/test/verification-components/page.tsx, src/components/verification/VerificationNotificationManager.tsx

#### VerificationNotification
- **Defined in**: src/components/verification/VerificationNotification.tsx
- **Usage count**: 2
- **Used in**: src/app/test/verification-components/page.tsx, src/components/verification/VerificationNotificationManager.tsx

#### VerificationProgress
- **Defined in**: src/components/verification/VerificationProgress.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/verification/page.tsx, src/app/test/verification-components/page.tsx

#### VerificationRejectedNotification
- **Defined in**: src/components/verification/VerificationNotification.tsx
- **Usage count**: 2
- **Used in**: src/app/test/verification-components/page.tsx, src/components/verification/VerificationNotificationManager.tsx

#### VerificationReminderNotification
- **Defined in**: src/components/verification/VerificationNotification.tsx
- **Usage count**: 2
- **Used in**: src/app/test/verification-components/page.tsx, src/components/verification/VerificationNotificationManager.tsx

#### VerificationReviewCard
- **Defined in**: src/components/admin/VerificationReviewCard.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/admin/verifications/page.tsx, src/app/test-admin-verification/page.tsx

#### VerifiedBadge
- **Defined in**: src/components/ui/VerifiedBadge.tsx
- **Usage count**: 2
- **Used in**: src/app/profile/[uid]/page.tsx, src/components/explore/DiscoveryGrid.tsx

#### VerifiedIcon
- **Defined in**: src/components/ui/VerifiedBadge.tsx
- **Usage count**: 2
- **Used in**: src/app/profile/[uid]/page.tsx, src/components/explore/DiscoveryGrid.tsx

#### XPDisplay
- **Defined in**: src/components/gamification/XPDisplay.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/admin/xp-management/page.tsx, src/app/test/xp-display/page.tsx

#### XPProgressBar
- **Defined in**: src/components/gamification/XPProgressBar.tsx
- **Usage count**: 2
- **Used in**: src/app/dashboard/admin/xp-management/page.tsx, src/app/test/xp-display/page.tsx

### 🟠 Limited Components (136)
*Used in only one place (1 usage)*

- **addLink** (src/components/profile/PortfolioEditor.tsx) → used in `src/app/dashboard/edit/page.tsx`
- **AdminVerificationDashboard** (src/components/verification/AdminVerificationDashboard.tsx) → used in `src/app/dashboard/admin/verification-management/page.tsx`
- **AdvancedSearchInterface** (src/components/search/AdvancedSearchInterface.tsx) → used in `src/app/search/page.tsx`
- **Alert** (src/components/ui/alert.tsx) → used in `src/app/dashboard/verification/page.tsx`
- **AlertDescription** (src/components/ui/alert.tsx) → used in `src/app/dashboard/verification/page.tsx`
- **AlertTitle** (src/components/ui/alert.tsx) → used in `src/app/dashboard/verification/page.tsx`
- **applyPreset** (src/components/portfolio/themes/PortfolioThemeSelector.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **AvailabilitySelector** (src/components/profile/AvailabilitySelector.tsx) → used in `src/app/dashboard/edit/page.tsx`
- **BadgeCard** (src/components/gamification/BadgeCard.tsx) → used in `src/app/test/badge-display/page.tsx`
- **BannedModal** (src/components/BannedModal.tsx) → used in `pages/banned.tsx`
- **BannedNotice** (src/components/BannedNotice.tsx) → used in `src/app/auth/page.tsx`
- **BookingChatThread** (src/components/BookingChatThread.tsx) → used in `src/app/booking/[bookingId]/chat/page.tsx`
- **BookingChatTopBar** (src/components/booking/BookingChatTopBar.tsx) → used in `src/app/dashboard/bookings/[bookingId]/page.tsx`
- **BookingForm** (src/components/booking/BookingForm.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **BookingsPreview** (src/components/dashboard/BookingsPreview.tsx) → used in `src/app/dashboard/[role]/page.tsx`
- **BookingSummarySidebar** (src/components/booking/BookingSummarySidebar.tsx) → used in `src/app/book/[uid]/page.tsx`
- **BottomNav** (src/components/dashboard/BottomNav.tsx) → used in `src/app/(dashboard)/layout/layout.tsx`
- **canProceed** (src/components/onboarding/OnboardingWizard.tsx) → used in `src/app/onboarding/page.tsx`
- **CaseStudyCard** (src/components/CaseStudyCard.tsx) → used in `src/app/success/page.tsx`
- **ChallengeGrid** (src/components/challenges/ChallengeGrid.tsx) → used in `src/app/dashboard/challenges/page.tsx`
- **ChallengeLeaderboardComponent** (src/components/challenges/ChallengeLeaderboard.tsx) → used in `src/app/dashboard/challenges/page.tsx`
- **clearAll** (src/components/PortfolioUploader.tsx, src/components/media/MediaUpload.tsx) → used in `pages/portfolio-uploader-demo.tsx`
- **CollabBookingSummary** (src/components/collab/CollabBookingSummary.tsx) → used in `src/app/dashboard/collabs/[bookingId]/page.tsx`
- **CollabDashboard** (src/components/dashboard/collab/CollabDashboard.tsx) → used in `src/app/dashboard/collabs/page.tsx`
- **CollabStatsWidget** (src/components/dashboard/collab/CollabStatsWidget.tsx) → used in `src/app/dashboard/home/page.tsx`
- **CompletionNotice** (src/components/onboarding/CompletionNotice.tsx) → used in `src/app/create-profile/page.tsx`
- **ContactModal** (src/components/profile/ContactModal.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **ContractPreview** (src/components/booking/ContractPreview.tsx) → used in `src/app/booking/preview/[bookingId]/page.tsx`
- **CreatorNotificationButton** (src/components/profile/CreatorNotificationButton.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **FloatingCartButton** (src/components/cart/FloatingCartButton.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **formatDateTime** (src/components/booking/TalentRequestModal.tsx, src/components/collab/CollabBookingSummary.tsx, src/components/dashboard/SplitBookingCard.tsx) → used in `src/app/dashboard/collabs/[bookingId]/page.tsx`
- **formatFileSize** (src/components/PortfolioUploader.tsx, src/components/media/MediaUpload.tsx, src/components/media/PortfolioGallery.tsx) → used in `pages/portfolio-uploader-demo.tsx`
- **formatMessageTime** (src/components/BookingChatThread.tsx, src/components/chat/EnhancedChatThread.tsx) → used in `src/app/booking/[bookingId]/chat/page.tsx`
- **formatTime** (src/components/booking/ContractPreview.tsx) → used in `src/app/booking/preview/[bookingId]/page.tsx`
- **formatTimeOnly** (src/components/collab/CollabBookingSummary.tsx) → used in `src/app/dashboard/collabs/[bookingId]/page.tsx`
- **formatTimestamp** (src/components/dashboard/MessagesPreview.tsx) → used in `src/app/dashboard/[role]/page.tsx`
- **formatValue** (src/components/challenges/ChallengeLeaderboard.tsx) → used in `src/app/dashboard/challenges/page.tsx`
- **getBadgeColor** (src/components/social-proof/SocialProofWidgets.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **getBadgeIcon** (src/components/social-proof/SocialProofWidgets.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **getConfidenceIcon** (src/components/search/SmartSearchResults.tsx) → used in `src/app/search/page.tsx`
- **getDurationText** (src/components/booking/ContractPreview.tsx) → used in `src/app/booking/preview/[bookingId]/page.tsx`
- **getFileIcon** (src/components/PortfolioUploader.tsx, src/components/media/MediaUpload.tsx) → used in `pages/portfolio-uploader-demo.tsx`
- **getIndustryIcon** (src/components/portfolio/themes/PortfolioThemeSelector.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **getMatchScoreColor** (src/components/search/SmartSearchResults.tsx) → used in `src/app/search/page.tsx`
- **getOtherParticipant** (src/components/dashboard/MessagesPreview.tsx) → used in `src/app/dashboard/[role]/page.tsx`
- **getPositionBadge** (src/components/challenges/ChallengeCard.tsx, src/components/challenges/ChallengeLeaderboard.tsx) → used in `src/app/dashboard/challenges/page.tsx`
- **getPositionIcon** (src/components/challenges/ChallengeLeaderboard.tsx) → used in `src/app/dashboard/challenges/page.tsx`
- **getRankBadgeColor** (src/components/leaderboard/Leaderboard.tsx) → used in `src/app/leaderboard/page.tsx`
- **getRewardForPosition** (src/components/challenges/ChallengeLeaderboard.tsx) → used in `src/app/dashboard/challenges/page.tsx`
- **getStatusBadge** (src/components/verification/AdminVerificationDashboard.tsx) → used in `src/app/dashboard/admin/verification-management/page.tsx`
- **getSuggestionBadgeColor** (src/components/search/AdvancedSearchInterface.tsx) → used in `src/app/search/page.tsx`
- **getSuggestionIcon** (src/components/search/AdvancedSearchInterface.tsx) → used in `src/app/search/page.tsx`
- **getThemeIcon** (src/components/portfolio/themes/PortfolioThemeSelector.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **handleClick** (src/components/explore/LocationAutocomplete.tsx) → used in `src/app/apply/[role]/page.tsx`
- **handleEmailCapture** (src/components/onboarding/OnboardingManager.tsx) → used in `src/app/layout.tsx`
- **handleFilterChange** (src/components/search/AdvancedSearchInterface.tsx) → used in `src/app/search/page.tsx`
- **handleInputChange** (src/components/BookingChatThread.tsx, src/components/chat/EnhancedChatThread.tsx, src/components/event/EventBookingForm.tsx) → used in `src/app/booking/[bookingId]/chat/page.tsx`
- **handleKey** (src/components/profile/MediaCarousel.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **handleMouseLeave** (src/components/onboarding/OnboardingManager.tsx) → used in `src/app/layout.tsx`
- **handleNotificationRequest** (src/components/profile/CreatorNotificationButton.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **handleOverlayClick** (src/components/BannedModal.tsx, src/components/booking/TalentRequestModal.tsx, src/components/profile/ReportModal.tsx) → used in `pages/banned.tsx`
- **handlePrevious** (src/components/onboarding/OnboardingWizard.tsx) → used in `src/app/onboarding/page.tsx`
- **handleReportClick** (src/components/profile/ReportUserButton.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **handleRetry** (src/components/PortfolioUploader.tsx, src/components/media/MediaUpload.tsx) → used in `pages/portfolio-uploader-demo.tsx`
- **handleScroll** (src/components/booking/ContractPreview.tsx, src/components/chat/EnhancedChatThread.tsx) → used in `src/app/booking/preview/[bookingId]/page.tsx`
- **handleSelect** (src/components/booking/WeeklyCalendarSelector.tsx, src/components/explore/LocationAutocomplete.tsx) → used in `src/app/apply/[role]/page.tsx`
- **handleSignupPrompt** (src/components/onboarding/OnboardingManager.tsx) → used in `src/app/layout.tsx`
- **handleStarClick** (src/components/ReviewForm.tsx) → used in `src/app/booking/[bookingId]/page.tsx`
- **handleStarHover** (src/components/ReviewForm.tsx) → used in `src/app/booking/[bookingId]/page.tsx`
- **handleStarLeave** (src/components/ReviewForm.tsx) → used in `src/app/booking/[bookingId]/page.tsx`
- **handleSuggestionClick** (src/components/search/AdvancedSearchInterface.tsx) → used in `src/app/search/page.tsx`
- **handleTemplateSelect** (src/components/portfolio/themes/PortfolioThemeSelector.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **handleThemeSelect** (src/components/portfolio/themes/PortfolioThemeSelector.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **isCreatorView** (src/components/dashboard/collab/MyCollabBookings.tsx) → used in `src/components/dashboard/collab/CollabDashboard.tsx`
- **Label** (src/components/ui/label.tsx) → used in `src/app/dashboard/admin/challenge-management/page.tsx`
- **LocationAutocomplete** (src/components/explore/LocationAutocomplete.tsx) → used in `src/app/apply/[role]/page.tsx`
- **MediaCarousel** (src/components/profile/MediaCarousel.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **MessagesPreview** (src/components/dashboard/MessagesPreview.tsx) → used in `src/app/dashboard/[role]/page.tsx`
- **MyCollabBookings** (src/components/dashboard/collab/MyCollabBookings.tsx) → used in `src/components/dashboard/collab/CollabDashboard.tsx`
- **MyCollabPackages** (src/components/dashboard/collab/MyCollabPackages.tsx) → used in `src/components/dashboard/collab/CollabDashboard.tsx`
- **MyServicesPreview** (src/components/dashboard/MyServicesPreview.tsx) → used in `src/app/dashboard/[role]/page.tsx`
- **Navbar** (src/components/Navbar.tsx) → used in `src/app/layout.tsx`
- **next** (src/components/profile/MediaCarousel.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **NotificationsPanel** (src/components/dashboard/NotificationsPanel.tsx) → used in `src/app/dashboard/home/page.tsx`
- **OnboardingManager** (src/components/onboarding/OnboardingManager.tsx) → used in `src/app/layout.tsx`
- **OnboardingStepHeader** (src/components/onboarding/OnboardingStepHeader.tsx) → used in `src/app/apply/[role]/page.tsx`
- **OnboardingWizard** (src/components/onboarding/OnboardingWizard.tsx) → used in `src/app/onboarding/page.tsx`
- **PortfolioEditor** (src/components/profile/PortfolioEditor.tsx) → used in `src/app/dashboard/edit/page.tsx`
- **PortfolioThemeSelector** (src/components/portfolio/themes/PortfolioThemeSelector.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **PortfolioUploader** (src/components/PortfolioUploader.tsx) → used in `pages/portfolio-uploader-demo.tsx`
- **prev** (src/components/profile/MediaCarousel.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **ProfileActionBar** (src/components/profile/ProfileActionBar.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **ProfileTrustStats** (src/components/profile/ProfileTrustStats.tsx) → used in `src/app/dashboard/home/page.tsx`
- **ProgressRing** (src/components/ui/ProgressRing.tsx) → used in `src/components/cards/CreatorCard.tsx`
- **RankProgress** (src/components/dashboard/RankProgress.tsx) → used in `src/app/dashboard/home/page.tsx`
- **RatingBarChart** (src/components/profile/RatingBarChart.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **removeFile** (src/components/PortfolioUploader.tsx, src/components/media/MediaUpload.tsx) → used in `pages/portfolio-uploader-demo.tsx`
- **removeLink** (src/components/profile/PortfolioEditor.tsx) → used in `src/app/dashboard/edit/page.tsx`
- **renderBadgesWidget** (src/components/social-proof/SocialProofWidgets.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **renderCertificationsWidget** (src/components/social-proof/SocialProofWidgets.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **renderChallengeHeader** (src/components/challenges/ChallengeLeaderboard.tsx) → used in `src/app/dashboard/challenges/page.tsx`
- **renderChallengeStats** (src/components/challenges/ChallengeGrid.tsx) → used in `src/app/dashboard/challenges/page.tsx`
- **renderEmptyState** (src/components/challenges/ChallengeGrid.tsx) → used in `src/app/dashboard/challenges/page.tsx`
- **renderFilterControls** (src/components/challenges/ChallengeGrid.tsx) → used in `src/app/dashboard/challenges/page.tsx`
- **renderLeaderboardEntry** (src/components/challenges/ChallengeLeaderboard.tsx) → used in `src/app/dashboard/challenges/page.tsx`
- **renderMetricsWidget** (src/components/social-proof/SocialProofWidgets.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **renderTabContent** (src/components/dashboard/collab/CollabDashboard.tsx) → used in `src/app/dashboard/collabs/page.tsx`
- **renderTestimonialsWidget** (src/components/social-proof/SocialProofWidgets.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **renderTrustScoreWidget** (src/components/social-proof/SocialProofWidgets.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **renderWidget** (src/components/social-proof/SocialProofWidgets.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **ReportUserButton** (src/components/profile/ReportUserButton.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **ReviewList** (src/components/reviews/ReviewList.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **ReviewPrompt** (src/components/dashboard/ReviewPrompt.tsx) → used in `src/app/(dashboard)/layout/layout.tsx`
- **RoleBadge** (src/components/explore/RoleBadge.tsx) → used in `src/components/explore/NewExploreGrid.tsx`
- **RoleSelectCard** (src/components/onboarding/RoleSelectCard.tsx) → used in `src/app/apply/page.tsx`
- **scrollToBooking** (src/components/profile/ProfileActionBar.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **scrollToBottom** (src/components/BookingChatThread.tsx) → used in `src/app/booking/[bookingId]/chat/page.tsx`
- **SearchResultsSkeleton** (src/components/search/SmartSearchResults.tsx) → used in `src/app/search/page.tsx`
- **Select** (src/components/ui/select.tsx) → used in `src/app/dashboard/admin/challenge-management/page.tsx`
- **SelectContent** (src/components/ui/select.tsx) → used in `src/app/dashboard/admin/challenge-management/page.tsx`
- **SelectItem** (src/components/ui/select.tsx) → used in `src/app/dashboard/admin/challenge-management/page.tsx`
- **SelectTrigger** (src/components/ui/select.tsx) → used in `src/app/dashboard/admin/challenge-management/page.tsx`
- **SelectValue** (src/components/ui/select.tsx) → used in `src/app/dashboard/admin/challenge-management/page.tsx`
- **Sidebar** (src/components/dashboard/Sidebar.tsx) → used in `src/app/(dashboard)/layout/layout.tsx`
- **SidebarItem** (src/components/ui/SidebarItem.tsx) → used in `src/components/dashboard/Sidebar.tsx`
- **SmartSearchResults** (src/components/search/SmartSearchResults.tsx) → used in `src/app/search/page.tsx`
- **SocialProofWidgets** (src/components/social-proof/SocialProofWidgets.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **StreakToast** (src/components/gamification/StreakToast.tsx) → used in `src/app/layout.tsx`
- **TestimonialManager** (src/components/testimonials/TestimonialManager.tsx) → used in `src/app/dashboard/creator-showcase/page.tsx`
- **toggleTag** (src/components/search/SmartSearchResults.tsx) → used in `src/app/search/page.tsx`
- **triggerSignupPrompt** (src/components/booking/BookingForm.tsx) → used in `src/app/profile/[uid]/page.tsx`
- **truncateMessage** (src/components/dashboard/MessagesPreview.tsx) → used in `src/app/dashboard/[role]/page.tsx`
- **TrustBadges** (src/components/booking/TrustBadges.tsx) → used in `src/app/book/[uid]/page.tsx`
- **VerificationGuide** (src/components/verification/VerificationGuide.tsx) → used in `src/app/verify-info/page.tsx`
- **VerificationNotificationManager** (src/components/verification/VerificationNotificationManager.tsx) → used in `src/app/layout.tsx`
- **VerifiedProgress** (src/components/profile/VerifiedProgress.tsx) → used in `src/app/profile/[uid]/page.tsx`


### 🔴 Unused Components (164)
*Not found in any imports (0 usages)*

- **addArrayItem** (src/components/forms/CreateMentorshipForm.tsx)
- **addEquipment** (src/components/collab/CreateCollabPackageForm.tsx)
- **addFiles** (src/components/profile/MediaUploader.tsx)
- **addGenre** (src/components/explore/FilterPanel.tsx)
- **addLinkField** (src/components/profile/VerificationFormModal.tsx)
- **addLocation** (src/components/collab/CreateCollabPackageForm.tsx)
- **addNotification** (src/components/gamification/XPNotificationSystem.tsx)
- **addTag** (src/components/collab/CreateCollabPackageForm.tsx)
- **AdminVerificationRequests** (src/components/admin/AdminVerificationRequests.tsx)
- **apply** (src/components/explore/SavedFilters.tsx)
- **ArtistDashboard** (src/components/roles/ArtistDashboard.tsx)
- **assignRole** (src/components/collab/CreateCollabPackageForm.tsx)
- **AssignRoleForm** (src/components/admin/AssignRoleForm.tsx)
- **AvatarRing** (src/components/ui/AvatarRing.tsx)
- **BookingCalendar** (src/components/booking/BookingCalendar.tsx)
- **BookingSidebar** (src/components/book/BookingSidebar.tsx)
- **BookingsList** (src/components/bookings/BookingsList.tsx)
- **BookingStatusCard** (src/components/booking/BookingStatusCard.tsx)
- **calcQuote** (src/components/booking/studio/calcQuote.ts)
- **CalendarSync** (src/components/calendar/CalendarSync.tsx)
- **CardBody** (src/components/ui/Card.tsx)
- **ChallengeCard** (src/components/challenges/ChallengeCard.tsx)
- **clearAllNotifications** (src/components/gamification/XPNotificationSystem.tsx)
- **clearRecentSearches** (src/components/explore/SearchBar.tsx)
- **closeFullscreen** (src/components/profile/EnhancedMediaGallery.tsx)
- **CollabPackageCard** (src/components/collab/CollabPackageCard.tsx)
- **CreateCollabPackageForm** (src/components/collab/CreateCollabPackageForm.tsx)
- **CreateMentorshipForm** (src/components/forms/CreateMentorshipForm.tsx)
- **CreatorCard** (src/components/cards/CreatorCard.tsx)
- **default** (src/components/gamification/index.ts, src/components/ui/button.tsx)
- **default as XPDisplay ** (src/components/gamification/index.ts)
- **default as XPProgressBar ** (src/components/gamification/index.ts)
- **default as XPWidget ** (src/components/gamification/index.ts)
- **DefaultDashboard** (src/components/roles/DefaultDashboard.tsx)
- **DiscoveryGrid** (src/components/explore/DiscoveryGrid.tsx)
- **DiscoveryMap** (src/components/explore/DiscoveryMap.tsx)
- **DiscoveryWrapper** (src/components/explore/DiscoveryWrapper.tsx)
- **dismissNotification** (src/components/gamification/XPNotificationSystem.tsx)
- **DisputeButton** (src/components/disputes/DisputeButton.tsx)
- **EarningsChart** (src/components/admin/EarningsChart.tsx)
- **EarningsDashboard** (src/components/dashboard/EarningsDashboard.tsx)
- **EmailCaptureModal** (src/components/onboarding/EmailCaptureModal.tsx)
- **EngineerDashboard** (src/components/roles/EngineerDashboard.tsx)
- **EnhancedChatThread** (src/components/chat/EnhancedChatThread.tsx)
- **EnhancedMediaGallery** (src/components/profile/EnhancedMediaGallery.tsx)
- **ErrorBoundary** (src/components/ErrorBoundary.tsx)
- **EventBookingForm** (src/components/event/EventBookingForm.tsx)
- **FeaturedSection** (src/components/profile/EnhancedMediaGallery.tsx)
- **FilterPanel** (src/components/explore/FilterPanel.tsx)
- **formatCurrency** (src/components/admin/TopRolesCard.tsx, src/components/booking/TalentRequestModal.tsx, src/components/dashboard/SplitBookingCard.tsx)
- **formatDuration** (src/components/collab/CreateCollabPackageForm.tsx, src/components/dashboard/SplitBookingCard.tsx)
- **formatLastSeen** (src/components/chat/PresenceIndicator.tsx)
- **formatTimeAgo** (src/components/notifications/SplitBookingNotification.tsx)
- **formatTimeRemaining** (src/components/challenges/ChallengeCard.tsx)
- **getBackgroundColor** (src/components/gamification/XPNotificationSystem.tsx)
- **getCompletionPercent** (src/components/profile/ProfileForm.tsx)
- **getContent** (src/components/onboarding/EmailCaptureModal.tsx)
- **getGrowthColor** (src/components/admin/TopRolesCard.tsx)
- **getIcon** (src/components/gamification/XPNotificationSystem.tsx)
- **getNotificationContent** (src/components/notifications/SplitBookingNotification.tsx)
- **getPaymentStatusColor** (src/components/dashboard/SplitBookingCard.tsx)
- **getTalentStatusIcon** (src/components/dashboard/SplitBookingCard.tsx)
- **handleArrayChange** (src/components/forms/CreateMentorshipForm.tsx)
- **handleBookClick** (src/components/collab/CollabPackageCard.tsx)
- **handleCancelBooking** (src/components/dashboard/SplitBookingsList.tsx)
- **handleCardClick** (src/components/collab/CollabPackageCard.tsx)
- **handleChange** (src/components/forms/CreateMentorshipForm.tsx, src/components/forms/MentorshipBookingForm.tsx, src/components/profile/ProfileForm.tsx)
- **handleClear** (src/components/explore/SearchBar.tsx)
- **handleCreatorSelect** (src/components/event/EventBookingForm.tsx)
- **handleDrop** (src/components/profile/MediaUploader.tsx)
- **handleFileChange** (src/components/profile/MediaUploader.tsx)
- **handleGeoToggle** (src/components/explore/FilterPanel.tsx)
- **handleKeyDown** (src/components/ui/StarRating.tsx)
- **handleKeyPress** (src/components/chat/EnhancedChatThread.tsx)
- **handleLogin** (src/components/onboarding/SignupPromptModal.tsx)
- **handleNext** (src/components/ui/WalkthroughOverlay.tsx)
- **handlePayNow** (src/components/dashboard/SplitBookingsList.tsx)
- **handleRecentSearch** (src/components/explore/SearchBar.tsx)
- **handleRoleToggle** (src/components/event/EventBookingForm.tsx)
- **handleSignup** (src/components/onboarding/SignupPromptModal.tsx)
- **handleSubmit** (src/components/chat/EnhancedChatThread.tsx, src/components/media/PortfolioGallery.tsx)
- **handleSwitch** (src/components/dashboard/RoleSwitcher.tsx)
- **handleTalentRequest** (src/components/dashboard/SplitBookingsList.tsx)
- **handleTalentResponse** (src/components/dashboard/SplitBookingsList.tsx)
- **handleTierChange** (src/components/explore/FilterPanel.tsx)
- **handleTouchEnd** (src/components/profile/EnhancedMediaGallery.tsx)
- **handleTouchMove** (src/components/profile/EnhancedMediaGallery.tsx)
- **handleTouchStart** (src/components/profile/EnhancedMediaGallery.tsx)
- **handleUploadComplete** (src/components/media/PortfolioGallery.tsx)
- **handleViewDetails** (src/components/dashboard/SplitBookingsList.tsx)
- **IDVerificationForm** (src/components/profile/IDVerificationForm/IDVerificationForm.tsx, src/components/profile/IDVerificationForm.tsx)
- **LanguageSwitcher** (src/components/ui/LanguageSwitcher.tsx)
- **LeaderboardList** (src/components/leaderboard/LeaderboardList.tsx)
- **MediaGallery** (src/components/profile/MediaGallery.tsx)
- **MediaUpload** (src/components/media/MediaUpload.tsx)
- **MediaUploader** (src/components/profile/MediaUploader.tsx)
- **MentorshipBookingForm** (src/components/forms/MentorshipBookingForm.tsx)
- **MultiUserPresence** (src/components/chat/PresenceIndicator.tsx)
- **MyComponent** (src/components/ClientBookings.tsx)
- **NewExploreGrid** (src/components/explore/NewExploreGrid.tsx)
- **nextItem** (src/components/profile/EnhancedMediaGallery.tsx)
- **notifyBadgeEarned** (src/components/gamification/XPNotificationSystem.tsx)
- **notifyDailyCap** (src/components/gamification/XPNotificationSystem.tsx)
- **notifyTierUp** (src/components/gamification/XPNotificationSystem.tsx)
- **notifyXPGained** (src/components/gamification/XPNotificationSystem.tsx)
- **onScroll** (src/components/explore/DiscoveryGrid.tsx, src/components/explore/DiscoveryMap.tsx, src/components/explore/NewExploreGrid.tsx)
- **openFullscreen** (src/components/profile/EnhancedMediaGallery.tsx)
- **PayButton** (src/components/pay/PayButton.tsx)
- **PortfolioGallery** (src/components/media/PortfolioGallery.tsx)
- **PortfolioGrid** (src/components/profile/PortfolioGrid.tsx)
- **PresenceAvatar** (src/components/chat/PresenceIndicator.tsx)
- **PresenceIndicator** (src/components/chat/PresenceIndicator.tsx)
- **prevItem** (src/components/profile/EnhancedMediaGallery.tsx)
- **ProducerDashboard** (src/components/roles/ProducerDashboard.tsx)
- **ProfileForm** (src/components/profile/ProfileForm.tsx)
- **ProfileReviewList** (src/components/profile/ProfileReviewList.tsx)
- **ProviderBookings** (src/components/ProviderBookings.tsx)
- **QuoteCalculator** (src/components/booking/studio/QuoteCalculator.tsx)
- **removeArrayItem** (src/components/forms/CreateMentorshipForm.tsx)
- **removeEquipment** (src/components/collab/CreateCollabPackageForm.tsx)
- **removeLinkField** (src/components/profile/VerificationFormModal.tsx)
- **removeLocation** (src/components/collab/CreateCollabPackageForm.tsx)
- **removeRole** (src/components/collab/CreateCollabPackageForm.tsx)
- **removeTag** (src/components/collab/CreateCollabPackageForm.tsx)
- **renderGridLayout** (src/components/media/PortfolioGallery.tsx)
- **renderMediaContent** (src/components/profile/EnhancedMediaGallery.tsx)
- **renderMediaItem** (src/components/media/PortfolioGallery.tsx)
- **renderMessage** (src/components/chat/EnhancedChatThread.tsx)
- **renderRewards** (src/components/challenges/ChallengeCard.tsx)
- **renderTypingText** (src/components/chat/TypingIndicator.tsx)
- **ReportModal** (src/components/profile/ReportModal.tsx)
- **RoleOverview** (src/components/dashboard/RoleOverview.tsx)
- **RoleSwitcher** (src/components/dashboard/RoleSwitcher.tsx)
- **RoleToggle** (src/components/RoleToggle.tsx)
- **SavedFilters** (src/components/explore/SavedFilters.tsx)
- **SearchBar** (src/components/explore/SearchBar.tsx)
- **selectTalent** (src/components/booking/SplitBookingForm.tsx)
- **SEOMeta** (src/components/SEOMeta.tsx)
- **ServiceManager** (src/components/ServiceManager.tsx)
- **SignupPromptModal** (src/components/onboarding/SignupPromptModal.tsx)
- **SplitBookingCard** (src/components/dashboard/SplitBookingCard.tsx)
- **SplitBookingForm** (src/components/booking/SplitBookingForm.tsx)
- **SplitBookingNotification** (src/components/notifications/SplitBookingNotification.tsx)
- **SplitBookingsList** (src/components/dashboard/SplitBookingsList.tsx)
- **StarRating** (src/components/ui/StarRating.tsx)
- **StatusBadge** (src/components/ui/Badge.tsx)
- **StripeWrapper** (src/components/checkout/StripeWrapper.tsx)
- **StudioBookingForm** (src/components/booking/studio/StudioBookingForm.tsx)
- **StudioDashboard** (src/components/roles/StudioDashboard.tsx)
- **SubscriptionSettings** (src/components/settings/SubscriptionSettings.tsx)
- **TalentRequestModal** (src/components/booking/TalentRequestModal.tsx)
- **tileDisabled** (src/components/booking/BookingCalendar.tsx)
- **TopRolesCard** (src/components/admin/TopRolesCard.tsx)
- **TourTooltip** (src/components/onboarding/TourTooltip.tsx)
- **TypingIndicator** (src/components/chat/TypingIndicator.tsx)
- **TypingIndicatorMinimal** (src/components/chat/TypingIndicator.tsx)
- **updateFilters** (src/components/explore/FilterPanel.tsx)
- **updateLink** (src/components/profile/VerificationFormModal.tsx)
- **useXPNotifications** (src/components/gamification/XPNotificationSystem.tsx, src/components/gamification/index.ts)
- **VerificationFormModal** (src/components/profile/VerificationFormModal.tsx)
- **VideographerDashboard** (src/components/roles/VideographerDashboard.tsx)
- **WalkthroughOverlay** (src/components/ui/WalkthroughOverlay.tsx)
- **WeeklyCalendarSelector** (src/components/booking/WeeklyCalendarSelector.tsx)
- **XPNotificationSystem** (src/components/gamification/XPNotificationSystem.tsx)


---

## Analysis Notes

This analysis is based on:
- Static analysis of import statements
- Component export detection
- File path resolution for imports

**Limitations**:
- Dynamic imports are not fully tracked
- Some usage patterns might be missed due to complex import structures
- Default exports might not be fully captured in all cases

Generated by: AuditoryX System Integration Audit
