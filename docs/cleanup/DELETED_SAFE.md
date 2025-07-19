# Safely Deleted Components

Generated on: 2025-07-19T09:02:17.852Z

## Summary

This document lists components and files that were safely deleted because they had zero references in both code and documentation (excluding audit files).

**Total files deleted**: 102
**Components/functions removed**: 197

## Deletion Criteria

Files were considered safe to delete if:
1. Listed as unused in the audit report
2. No references found in any documentation files
3. No import statements or usage examples in docs

## Deleted Files

- `src/components/forms/CreateMentorshipForm.tsx`
- `src/components/collab/CreateCollabPackageForm.tsx`
- `src/components/explore/FilterPanel.tsx`
- `src/components/profile/PortfolioEditor.tsx`
- `src/components/profile/VerificationFormModal.tsx`
- `src/components/admin/AdminVerificationRequests.tsx`
- `src/components/ui/alert.tsx`
- `src/components/roles/ArtistDashboard.tsx`
- `src/components/admin/AssignRoleForm.tsx`
- `src/components/ui/AvatarRing.tsx`
- `src/components/ui/badge.tsx`
- `src/components/book/BookingSidebar.tsx`
- `src/components/booking/BookingStatusCard.tsx`
- `src/components/onboarding/OnboardingWizard.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/card.tsx`
- `src/components/challenges/ChallengeLeaderboard.tsx`
- `src/components/gamification/XPNotificationSystem.tsx`
- `src/components/explore/SearchBar.tsx`
- `src/components/profile/EnhancedMediaGallery.tsx`
- `src/components/collab/CollabBookingSummary.tsx`
- `src/components/gamification/index.ts`
- `src/components/roles/DefaultDashboard.tsx`
- `src/components/explore/DiscoveryMap.tsx`
- `src/components/explore/DiscoveryWrapper.tsx`
- `src/components/dashboard/EarningsDashboard.tsx`
- `src/components/roles/EngineerDashboard.tsx`
- `src/components/chat/EnhancedChatThread.tsx`
- `src/components/gamification/BadgeCard.tsx`
- `src/components/chat/PresenceIndicator.tsx`
- `src/components/booking/ContractPreview.tsx`
- `src/components/notifications/SplitBookingNotification.tsx`
- `src/components/challenges/ChallengeCard.tsx`
- `src/components/dashboard/MessagesPreview.tsx`
- `src/components/verification/VerificationProgress.tsx`
- `src/components/social-proof/SocialProofWidgets.tsx`
- `src/components/dashboard/BookingInbox.tsx`
- `src/components/rankings/LeaderboardWidget.tsx`
- `src/components/profile/ProfileForm.tsx`
- `src/components/search/SmartSearchResults.tsx`
- `src/components/onboarding/EmailCaptureModal.tsx`
- `src/components/PortfolioUploader.tsx`
- `src/components/admin/TopRolesCard.tsx`
- `src/components/portfolio/themes/PortfolioThemeSelector.tsx`
- `src/components/leaderboard/Leaderboard.tsx`
- `src/components/verification/AdminVerificationDashboard.tsx`
- `src/components/profile/ApplyVerificationButton.tsx`
- `src/components/search/AdvancedSearchInterface.tsx`
- `src/components/dashboard/SplitBookingCard.tsx`
- `src/components/rankings/Leaderboard.tsx`
- `src/components/collab/CollabPackageCard.tsx`
- `src/components/dashboard/SplitBookingsList.tsx`
- `src/components/explore/LocationAutocomplete.tsx`
- `src/components/gamification/BadgeNotification.tsx`
- `src/components/profile/MediaUploader.tsx`
- `src/components/onboarding/OnboardingManager.tsx`
- `src/components/BookingChatThread.tsx`
- `src/components/profile/MediaCarousel.tsx`
- `src/components/ui/StarRating.tsx`
- `src/components/onboarding/SignupPromptModal.tsx`
- `src/components/ui/WalkthroughOverlay.tsx`
- `src/components/profile/CreatorNotificationButton.tsx`
- `src/components/BannedModal.tsx`
- `src/components/profile/ReportUserButton.tsx`
- `src/components/booking/WeeklyCalendarSelector.tsx`
- `src/components/ReviewForm.tsx`
- `src/components/dashboard/RoleSwitcher.tsx`
- `src/components/booking/BookingChat.tsx`
- `src/components/media/PortfolioGallery.tsx`
- `src/components/profile/IDVerificationForm/IDVerificationForm.tsx`
- `src/components/dashboard/collab/MyCollabBookings.tsx`
- `src/components/ui/LanguageSwitcher.tsx`
- `src/components/leaderboard/LeaderboardList.tsx`
- `src/components/profile/MediaGallery.tsx`
- `src/components/ClientBookings.tsx`
- `src/components/explore/NewExploreGrid.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/explore/DiscoveryGrid.tsx`
- `src/components/roles/ProducerDashboard.tsx`
- `src/components/profile/ProfileReviewList.tsx`
- `src/components/challenges/ChallengeGrid.tsx`
- `src/components/dashboard/collab/CollabDashboard.tsx`
- `src/components/chat/TypingIndicator.tsx`
- `src/components/dashboard/RoleOverview.tsx`
- `src/components/profile/ProfileActionBar.tsx`
- `src/components/booking/SplitBookingForm.tsx`
- `src/components/onboarding/ProgressiveOnboarding.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/checkout/StripeWrapper.tsx`
- `src/components/booking/studio/StudioBookingForm.tsx`
- `src/components/roles/StudioDashboard.tsx`
- `src/components/settings/SubscriptionSettings.tsx`
- `src/components/booking/BookingCalendar.tsx`
- `src/components/ui/NotificationBell.tsx`
- `src/components/onboarding/TourTooltip.tsx`
- `src/components/booking/BookingForm.tsx`
- `src/components/verification/VerificationNotification.tsx`
- `src/components/ui/VerifiedBadge.tsx`
- `src/components/roles/VideographerDashboard.tsx`
- `src/hooks/useDebounce.ts`
- `src/hooks/useEnhancedChat.ts`
- `src/hooks/useEmailCapture.ts`

## Deleted Components/Functions


### addArrayItem

- **File**: `src/components/forms/CreateMentorshipForm.tsx`
- **Exports**: addArrayItem
- **Reason**: Component unused


### addEquipment

- **File**: `src/components/collab/CreateCollabPackageForm.tsx`
- **Exports**: addEquipment
- **Reason**: Component unused


### addGenre

- **File**: `src/components/explore/FilterPanel.tsx`
- **Exports**: addGenre
- **Reason**: Component unused


### addLink

- **File**: `src/components/profile/PortfolioEditor.tsx`
- **Exports**: addLink
- **Reason**: Component unused


### addLinkField

- **File**: `src/components/profile/VerificationFormModal.tsx`
- **Exports**: addLinkField
- **Reason**: Component unused


### addLocation

- **File**: `src/components/collab/CreateCollabPackageForm.tsx`
- **Exports**: addLocation
- **Reason**: Component unused


### addTag

- **File**: `src/components/collab/CreateCollabPackageForm.tsx`
- **Exports**: addTag
- **Reason**: Component unused


### AdminVerificationRequests

- **File**: `src/components/admin/AdminVerificationRequests.tsx`
- **Exports**: AdminVerificationRequests
- **Reason**: Component unused


### AlertTitle

- **File**: `src/components/ui/alert.tsx`
- **Exports**: AlertTitle
- **Reason**: Component unused


### ArtistDashboard

- **File**: `src/components/roles/ArtistDashboard.tsx`
- **Exports**: ArtistDashboard
- **Reason**: Component unused


### AssignRoleForm

- **File**: `src/components/admin/AssignRoleForm.tsx`
- **Exports**: AssignRoleForm
- **Reason**: Component unused


### AvatarRing

- **File**: `src/components/ui/AvatarRing.tsx`
- **Exports**: AvatarRing
- **Reason**: Component unused


### badgeVariants

- **File**: `src/components/ui/badge.tsx`
- **Exports**: badgeVariants
- **Reason**: Component unused


### BookingSidebar

- **File**: `src/components/book/BookingSidebar.tsx`
- **Exports**: BookingSidebar
- **Reason**: Component unused


### BookingStatusCard

- **File**: `src/components/booking/BookingStatusCard.tsx`
- **Exports**: BookingStatusCard
- **Reason**: Component unused


### canProceed

- **File**: `src/components/onboarding/OnboardingWizard.tsx`
- **Exports**: canProceed
- **Reason**: Component unused


### CardBody

- **File**: `src/components/ui/Card.tsx`
- **Exports**: CardBody
- **Reason**: Component unused


### CardDescription

- **File**: `src/components/ui/card.tsx`
- **Exports**: CardDescription
- **Reason**: Component unused


### CardFooter

- **File**: `src/components/ui/Card.tsx`
- **Exports**: CardFooter
- **Reason**: Component unused


### ChallengeLeaderboardComponent

- **File**: `src/components/challenges/ChallengeLeaderboard.tsx`
- **Exports**: ChallengeLeaderboardComponent
- **Reason**: Component unused


### clearAllNotifications

- **File**: `src/components/gamification/XPNotificationSystem.tsx`
- **Exports**: clearAllNotifications
- **Reason**: Component unused


### clearRecentSearches

- **File**: `src/components/explore/SearchBar.tsx`
- **Exports**: clearRecentSearches
- **Reason**: Component unused


### closeFullscreen

- **File**: `src/components/profile/EnhancedMediaGallery.tsx`
- **Exports**: closeFullscreen
- **Reason**: Component unused


### CollabBookingSummary

- **File**: `src/components/collab/CollabBookingSummary.tsx`
- **Exports**: CollabBookingSummary
- **Reason**: Component unused


### default as XPDisplay

- **File**: `src/components/gamification/index.ts`
- **Exports**: default as XPDisplay
- **Reason**: Component unused


### default as XPProgressBar

- **File**: `src/components/gamification/index.ts`
- **Exports**: default as XPProgressBar
- **Reason**: Component unused


### default as XPWidget

- **File**: `src/components/gamification/index.ts`
- **Exports**: default as XPWidget
- **Reason**: Component unused


### DefaultDashboard

- **File**: `src/components/roles/DefaultDashboard.tsx`
- **Exports**: DefaultDashboard
- **Reason**: Component unused


### DiscoveryMap

- **File**: `src/components/explore/DiscoveryMap.tsx`
- **Exports**: DiscoveryMap
- **Reason**: Component unused


### DiscoveryWrapper

- **File**: `src/components/explore/DiscoveryWrapper.tsx`
- **Exports**: DiscoveryWrapper
- **Reason**: Component unused


### dismissNotification

- **File**: `src/components/gamification/XPNotificationSystem.tsx`
- **Exports**: dismissNotification
- **Reason**: Component unused


### EarningsDashboard

- **File**: `src/components/dashboard/EarningsDashboard.tsx`
- **Exports**: EarningsDashboard
- **Reason**: Component unused


### EngineerDashboard

- **File**: `src/components/roles/EngineerDashboard.tsx`
- **Exports**: EngineerDashboard
- **Reason**: Component unused


### EnhancedChatThread

- **File**: `src/components/chat/EnhancedChatThread.tsx`
- **Exports**: EnhancedChatThread
- **Reason**: Component unused


### EnhancedMediaGallery

- **File**: `src/components/profile/EnhancedMediaGallery.tsx`
- **Exports**: EnhancedMediaGallery
- **Reason**: Component unused


### FeaturedSection

- **File**: `src/components/profile/EnhancedMediaGallery.tsx`
- **Exports**: FeaturedSection
- **Reason**: Component unused


### formatAwardedDate

- **File**: `src/components/gamification/BadgeCard.tsx`
- **Exports**: formatAwardedDate
- **Reason**: Component unused


### formatLastSeen

- **File**: `src/components/chat/PresenceIndicator.tsx`
- **Exports**: formatLastSeen
- **Reason**: Component unused


### formatTime

- **File**: `src/components/booking/ContractPreview.tsx`
- **Exports**: formatTime
- **Reason**: Component unused


### formatTimeAgo

- **File**: `src/components/notifications/SplitBookingNotification.tsx`
- **Exports**: formatTimeAgo
- **Reason**: Component unused


### formatTimeOnly

- **File**: `src/components/collab/CollabBookingSummary.tsx`
- **Exports**: formatTimeOnly
- **Reason**: Component unused


### formatTimeRemaining

- **File**: `src/components/challenges/ChallengeCard.tsx`
- **Exports**: formatTimeRemaining
- **Reason**: Component unused


### formatTimestamp

- **File**: `src/components/dashboard/MessagesPreview.tsx`
- **Exports**: formatTimestamp
- **Reason**: Component unused


### formatValue

- **File**: `src/components/challenges/ChallengeLeaderboard.tsx`
- **Exports**: formatValue
- **Reason**: Component unused


### getApplicationStatusBadge

- **File**: `src/components/verification/VerificationProgress.tsx`
- **Exports**: getApplicationStatusBadge
- **Reason**: Component unused


### getBackgroundColor

- **File**: `src/components/gamification/XPNotificationSystem.tsx`
- **Exports**: getBackgroundColor
- **Reason**: Component unused


### getBadgeColor

- **File**: `src/components/social-proof/SocialProofWidgets.tsx`
- **Exports**: getBadgeColor
- **Reason**: Component unused


### getBadgeIcon

- **File**: `src/components/social-proof/SocialProofWidgets.tsx`
- **Exports**: getBadgeIcon
- **Reason**: Component unused


### getBookingStatusColor

- **File**: `src/components/dashboard/BookingInbox.tsx`
- **Exports**: getBookingStatusColor
- **Reason**: Component unused


### getCategoryLabel

- **File**: `src/components/rankings/LeaderboardWidget.tsx`
- **Exports**: getCategoryLabel
- **Reason**: Component unused


### getCompletionPercent

- **File**: `src/components/profile/ProfileForm.tsx`
- **Exports**: getCompletionPercent
- **Reason**: Component unused


### getConfidenceIcon

- **File**: `src/components/search/SmartSearchResults.tsx`
- **Exports**: getConfidenceIcon
- **Reason**: Component unused


### getContent

- **File**: `src/components/onboarding/EmailCaptureModal.tsx`
- **Exports**: getContent
- **Reason**: Component unused


### getDurationText

- **File**: `src/components/booking/ContractPreview.tsx`
- **Exports**: getDurationText
- **Reason**: Component unused


### getFileIcon

- **File**: `src/components/PortfolioUploader.tsx`
- **Exports**: getFileIcon
- **Reason**: Component unused


### getGrowthColor

- **File**: `src/components/admin/TopRolesCard.tsx`
- **Exports**: getGrowthColor
- **Reason**: Component unused


### getIndustryIcon

- **File**: `src/components/portfolio/themes/PortfolioThemeSelector.tsx`
- **Exports**: getIndustryIcon
- **Reason**: Component unused


### getMatchScoreColor

- **File**: `src/components/search/SmartSearchResults.tsx`
- **Exports**: getMatchScoreColor
- **Reason**: Component unused


### getNotificationContent

- **File**: `src/components/notifications/SplitBookingNotification.tsx`
- **Exports**: getNotificationContent
- **Reason**: Component unused


### getPercentile

- **File**: `src/components/rankings/LeaderboardWidget.tsx`
- **Exports**: getPercentile
- **Reason**: Component unused


### getPositionBadge

- **File**: `src/components/challenges/ChallengeCard.tsx`
- **Exports**: getPositionBadge
- **Reason**: Component unused


### getRankBadgeColor

- **File**: `src/components/leaderboard/Leaderboard.tsx`
- **Exports**: getRankBadgeColor
- **Reason**: Component unused


### getRankColor

- **File**: `src/components/rankings/LeaderboardWidget.tsx`
- **Exports**: getRankColor
- **Reason**: Component unused


### getRankIcon

- **File**: `src/components/leaderboard/Leaderboard.tsx`
- **Exports**: getRankIcon
- **Reason**: Component unused


### getRewardForPosition

- **File**: `src/components/challenges/ChallengeLeaderboard.tsx`
- **Exports**: getRewardForPosition
- **Reason**: Component unused


### getStatusBadge

- **File**: `src/components/verification/AdminVerificationDashboard.tsx`
- **Exports**: getStatusBadge
- **Reason**: Component unused


### getStatusDescription

- **File**: `src/components/profile/ApplyVerificationButton.tsx`
- **Exports**: getStatusDescription
- **Reason**: Component unused


### getStatusText

- **File**: `src/components/chat/PresenceIndicator.tsx`
- **Exports**: getStatusText
- **Reason**: Component unused


### getSuggestionBadgeColor

- **File**: `src/components/search/AdvancedSearchInterface.tsx`
- **Exports**: getSuggestionBadgeColor
- **Reason**: Component unused


### getSuggestionIcon

- **File**: `src/components/search/AdvancedSearchInterface.tsx`
- **Exports**: getSuggestionIcon
- **Reason**: Component unused


### getTalentStatusIcon

- **File**: `src/components/dashboard/SplitBookingCard.tsx`
- **Exports**: getTalentStatusIcon
- **Reason**: Component unused


### getThemeIcon

- **File**: `src/components/portfolio/themes/PortfolioThemeSelector.tsx`
- **Exports**: getThemeIcon
- **Reason**: Component unused


### getTierColor

- **File**: `src/components/rankings/Leaderboard.tsx`
- **Exports**: getTierColor
- **Reason**: Component unused


### handleArrayChange

- **File**: `src/components/forms/CreateMentorshipForm.tsx`
- **Exports**: handleArrayChange
- **Reason**: Component unused


### handleBookClick

- **File**: `src/components/collab/CollabPackageCard.tsx`
- **Exports**: handleBookClick
- **Reason**: Component unused


### handleBookingClick

- **File**: `src/components/dashboard/BookingInbox.tsx`
- **Exports**: handleBookingClick
- **Reason**: Component unused


### handleCancelBooking

- **File**: `src/components/dashboard/SplitBookingsList.tsx`
- **Exports**: handleCancelBooking
- **Reason**: Component unused


### handleCardClick

- **File**: `src/components/collab/CollabPackageCard.tsx`
- **Exports**: handleCardClick
- **Reason**: Component unused


### handleClear

- **File**: `src/components/explore/SearchBar.tsx`
- **Exports**: handleClear
- **Reason**: Component unused


### handleClick

- **File**: `src/components/explore/LocationAutocomplete.tsx`
- **Exports**: handleClick
- **Reason**: Component unused


### handleClickOutside

- **File**: `src/components/search/AdvancedSearchInterface.tsx`
- **Exports**: handleClickOutside
- **Reason**: Component unused


### handleClose

- **File**: `src/components/gamification/BadgeNotification.tsx`
- **Exports**: handleClose
- **Reason**: Component unused


### handleDismiss

- **File**: `src/components/gamification/XPNotificationSystem.tsx`
- **Exports**: handleDismiss
- **Reason**: Component unused


### handleDrop

- **File**: `src/components/profile/MediaUploader.tsx`
- **Exports**: handleDrop
- **Reason**: Component unused


### handleEmailCapture

- **File**: `src/components/onboarding/OnboardingManager.tsx`
- **Exports**: handleEmailCapture
- **Reason**: Component unused


### handleFileChange

- **File**: `src/components/profile/MediaUploader.tsx`
- **Exports**: handleFileChange
- **Reason**: Component unused


### handleGeoToggle

- **File**: `src/components/explore/FilterPanel.tsx`
- **Exports**: handleGeoToggle
- **Reason**: Component unused


### handleInputChange

- **File**: `src/components/BookingChatThread.tsx`
- **Exports**: handleInputChange
- **Reason**: Component unused


### handleKey

- **File**: `src/components/profile/MediaCarousel.tsx`
- **Exports**: handleKey
- **Reason**: Component unused


### handleKeyDown

- **File**: `src/components/ui/StarRating.tsx`
- **Exports**: handleKeyDown
- **Reason**: Component unused


### handleKeyPress

- **File**: `src/components/chat/EnhancedChatThread.tsx`
- **Exports**: handleKeyPress
- **Reason**: Component unused


### handleLogin

- **File**: `src/components/onboarding/SignupPromptModal.tsx`
- **Exports**: handleLogin
- **Reason**: Component unused


### handleMessageClick

- **File**: `src/components/dashboard/BookingInbox.tsx`
- **Exports**: handleMessageClick
- **Reason**: Component unused


### handleMouseLeave

- **File**: `src/components/onboarding/OnboardingManager.tsx`
- **Exports**: handleMouseLeave
- **Reason**: Component unused


### handleNext

- **File**: `src/components/ui/WalkthroughOverlay.tsx`
- **Exports**: handleNext
- **Reason**: Component unused


### handleNotificationRequest

- **File**: `src/components/profile/CreatorNotificationButton.tsx`
- **Exports**: handleNotificationRequest
- **Reason**: Component unused


### handleOverlayClick

- **File**: `src/components/BannedModal.tsx`
- **Exports**: handleOverlayClick
- **Reason**: Component unused


### handlePayNow

- **File**: `src/components/dashboard/SplitBookingsList.tsx`
- **Exports**: handlePayNow
- **Reason**: Component unused


### handlePrevious

- **File**: `src/components/onboarding/OnboardingWizard.tsx`
- **Exports**: handlePrevious
- **Reason**: Component unused


### handleRecentSearch

- **File**: `src/components/explore/SearchBar.tsx`
- **Exports**: handleRecentSearch
- **Reason**: Component unused


### handleReportClick

- **File**: `src/components/profile/ReportUserButton.tsx`
- **Exports**: handleReportClick
- **Reason**: Component unused


### handleRetry

- **File**: `src/components/PortfolioUploader.tsx`
- **Exports**: handleRetry
- **Reason**: Component unused


### handleSelect

- **File**: `src/components/booking/WeeklyCalendarSelector.tsx`
- **Exports**: handleSelect
- **Reason**: Component unused


### handleSignup

- **File**: `src/components/onboarding/SignupPromptModal.tsx`
- **Exports**: handleSignup
- **Reason**: Component unused


### handleSignupPrompt

- **File**: `src/components/onboarding/OnboardingManager.tsx`
- **Exports**: handleSignupPrompt
- **Reason**: Component unused


### handleStarClick

- **File**: `src/components/ReviewForm.tsx`
- **Exports**: handleStarClick
- **Reason**: Component unused


### handleStarHover

- **File**: `src/components/ReviewForm.tsx`
- **Exports**: handleStarHover
- **Reason**: Component unused


### handleStarLeave

- **File**: `src/components/ReviewForm.tsx`
- **Exports**: handleStarLeave
- **Reason**: Component unused


### handleSuccess

- **File**: `src/components/profile/ApplyVerificationButton.tsx`
- **Exports**: handleSuccess
- **Reason**: Component unused


### handleSwitch

- **File**: `src/components/dashboard/RoleSwitcher.tsx`
- **Exports**: handleSwitch
- **Reason**: Component unused


### handleTalentRequest

- **File**: `src/components/dashboard/SplitBookingsList.tsx`
- **Exports**: handleTalentRequest
- **Reason**: Component unused


### handleTalentResponse

- **File**: `src/components/dashboard/SplitBookingsList.tsx`
- **Exports**: handleTalentResponse
- **Reason**: Component unused


### handleTemplateSelect

- **File**: `src/components/portfolio/themes/PortfolioThemeSelector.tsx`
- **Exports**: handleTemplateSelect
- **Reason**: Component unused


### handleThemeSelect

- **File**: `src/components/portfolio/themes/PortfolioThemeSelector.tsx`
- **Exports**: handleThemeSelect
- **Reason**: Component unused


### handleTierChange

- **File**: `src/components/explore/FilterPanel.tsx`
- **Exports**: handleTierChange
- **Reason**: Component unused


### handleTouchEnd

- **File**: `src/components/profile/EnhancedMediaGallery.tsx`
- **Exports**: handleTouchEnd
- **Reason**: Component unused


### handleTouchMove

- **File**: `src/components/profile/EnhancedMediaGallery.tsx`
- **Exports**: handleTouchMove
- **Reason**: Component unused


### handleTouchStart

- **File**: `src/components/profile/EnhancedMediaGallery.tsx`
- **Exports**: handleTouchStart
- **Reason**: Component unused


### handleTyping

- **File**: `src/components/booking/BookingChat.tsx`
- **Exports**: handleTyping
- **Reason**: Component unused


### handleUploadComplete

- **File**: `src/components/media/PortfolioGallery.tsx`
- **Exports**: handleUploadComplete
- **Reason**: Component unused


### handleViewDetails

- **File**: `src/components/dashboard/SplitBookingsList.tsx`
- **Exports**: handleViewDetails
- **Reason**: Component unused


### IDVerificationForm

- **File**: `src/components/profile/IDVerificationForm/IDVerificationForm.tsx`
- **Exports**: IDVerificationForm
- **Reason**: Component unused


### isCreatorView

- **File**: `src/components/dashboard/collab/MyCollabBookings.tsx`
- **Exports**: isCreatorView
- **Reason**: Component unused


### LanguageSwitcher

- **File**: `src/components/ui/LanguageSwitcher.tsx`
- **Exports**: LanguageSwitcher
- **Reason**: Component unused


### LeaderboardContent

- **File**: `src/components/rankings/Leaderboard.tsx`
- **Exports**: LeaderboardContent
- **Reason**: Component unused


### LeaderboardList

- **File**: `src/components/leaderboard/LeaderboardList.tsx`
- **Exports**: LeaderboardList
- **Reason**: Component unused


### MediaGallery

- **File**: `src/components/profile/MediaGallery.tsx`
- **Exports**: MediaGallery
- **Reason**: Component unused


### MediaUploader

- **File**: `src/components/profile/MediaUploader.tsx`
- **Exports**: MediaUploader
- **Reason**: Component unused


### MultiUserPresence

- **File**: `src/components/chat/PresenceIndicator.tsx`
- **Exports**: MultiUserPresence
- **Reason**: Component unused


### MyComponent

- **File**: `src/components/ClientBookings.tsx`
- **Exports**: MyComponent
- **Reason**: Component unused


### NewExploreGrid

- **File**: `src/components/explore/NewExploreGrid.tsx`
- **Exports**: NewExploreGrid
- **Reason**: Component unused


### nextItem

- **File**: `src/components/profile/EnhancedMediaGallery.tsx`
- **Exports**: nextItem
- **Reason**: Component unused


### NoCreatorsFound

- **File**: `src/components/ui/EmptyState.tsx`
- **Exports**: NoCreatorsFound
- **Reason**: Component unused


### NoMessages

- **File**: `src/components/ui/EmptyState.tsx`
- **Exports**: NoMessages
- **Reason**: Component unused


### NoSearchResults

- **File**: `src/components/ui/EmptyState.tsx`
- **Exports**: NoSearchResults
- **Reason**: Component unused


### onScroll

- **File**: `src/components/explore/DiscoveryGrid.tsx`
- **Exports**: onScroll
- **Reason**: Component unused


### openFullscreen

- **File**: `src/components/profile/EnhancedMediaGallery.tsx`
- **Exports**: openFullscreen
- **Reason**: Component unused


### prevItem

- **File**: `src/components/profile/EnhancedMediaGallery.tsx`
- **Exports**: prevItem
- **Reason**: Component unused


### ProducerDashboard

- **File**: `src/components/roles/ProducerDashboard.tsx`
- **Exports**: ProducerDashboard
- **Reason**: Component unused


### ProfileReviewList

- **File**: `src/components/profile/ProfileReviewList.tsx`
- **Exports**: ProfileReviewList
- **Reason**: Component unused


### removeArrayItem

- **File**: `src/components/forms/CreateMentorshipForm.tsx`
- **Exports**: removeArrayItem
- **Reason**: Component unused


### removeEquipment

- **File**: `src/components/collab/CreateCollabPackageForm.tsx`
- **Exports**: removeEquipment
- **Reason**: Component unused


### removeLink

- **File**: `src/components/profile/PortfolioEditor.tsx`
- **Exports**: removeLink
- **Reason**: Component unused


### removeLinkField

- **File**: `src/components/profile/VerificationFormModal.tsx`
- **Exports**: removeLinkField
- **Reason**: Component unused


### removeLocation

- **File**: `src/components/collab/CreateCollabPackageForm.tsx`
- **Exports**: removeLocation
- **Reason**: Component unused


### removeRole

- **File**: `src/components/collab/CreateCollabPackageForm.tsx`
- **Exports**: removeRole
- **Reason**: Component unused


### removeTag

- **File**: `src/components/collab/CreateCollabPackageForm.tsx`
- **Exports**: removeTag
- **Reason**: Component unused


### renderBadgesWidget

- **File**: `src/components/social-proof/SocialProofWidgets.tsx`
- **Exports**: renderBadgesWidget
- **Reason**: Component unused


### renderCertificationsWidget

- **File**: `src/components/social-proof/SocialProofWidgets.tsx`
- **Exports**: renderCertificationsWidget
- **Reason**: Component unused


### renderChallengeHeader

- **File**: `src/components/challenges/ChallengeLeaderboard.tsx`
- **Exports**: renderChallengeHeader
- **Reason**: Component unused


### renderEmptyState

- **File**: `src/components/challenges/ChallengeGrid.tsx`
- **Exports**: renderEmptyState
- **Reason**: Component unused


### renderFilterControls

- **File**: `src/components/challenges/ChallengeGrid.tsx`
- **Exports**: renderFilterControls
- **Reason**: Component unused


### renderGridLayout

- **File**: `src/components/media/PortfolioGallery.tsx`
- **Exports**: renderGridLayout
- **Reason**: Component unused


### renderLeaderboardEntry

- **File**: `src/components/challenges/ChallengeLeaderboard.tsx`
- **Exports**: renderLeaderboardEntry
- **Reason**: Component unused


### renderMediaContent

- **File**: `src/components/profile/EnhancedMediaGallery.tsx`
- **Exports**: renderMediaContent
- **Reason**: Component unused


### renderMediaItem

- **File**: `src/components/media/PortfolioGallery.tsx`
- **Exports**: renderMediaItem
- **Reason**: Component unused


### renderMessage

- **File**: `src/components/chat/EnhancedChatThread.tsx`
- **Exports**: renderMessage
- **Reason**: Component unused


### renderMetricsWidget

- **File**: `src/components/social-proof/SocialProofWidgets.tsx`
- **Exports**: renderMetricsWidget
- **Reason**: Component unused


### renderRewards

- **File**: `src/components/challenges/ChallengeCard.tsx`
- **Exports**: renderRewards
- **Reason**: Component unused


### renderTabContent

- **File**: `src/components/dashboard/collab/CollabDashboard.tsx`
- **Exports**: renderTabContent
- **Reason**: Component unused


### renderTestimonialsWidget

- **File**: `src/components/social-proof/SocialProofWidgets.tsx`
- **Exports**: renderTestimonialsWidget
- **Reason**: Component unused


### renderTrustScoreWidget

- **File**: `src/components/social-proof/SocialProofWidgets.tsx`
- **Exports**: renderTrustScoreWidget
- **Reason**: Component unused


### renderTypingText

- **File**: `src/components/chat/TypingIndicator.tsx`
- **Exports**: renderTypingText
- **Reason**: Component unused


### renderWidget

- **File**: `src/components/social-proof/SocialProofWidgets.tsx`
- **Exports**: renderWidget
- **Reason**: Component unused


### RoleOverview

- **File**: `src/components/dashboard/RoleOverview.tsx`
- **Exports**: RoleOverview
- **Reason**: Component unused


### RoleSwitcher

- **File**: `src/components/dashboard/RoleSwitcher.tsx`
- **Exports**: RoleSwitcher
- **Reason**: Component unused


### scrollToBooking

- **File**: `src/components/profile/ProfileActionBar.tsx`
- **Exports**: scrollToBooking
- **Reason**: Component unused


### SearchResultsSkeleton

- **File**: `src/components/search/SmartSearchResults.tsx`
- **Exports**: SearchResultsSkeleton
- **Reason**: Component unused


### selectTalent

- **File**: `src/components/booking/SplitBookingForm.tsx`
- **Exports**: selectTalent
- **Reason**: Component unused


### shouldShowSignupPrompt

- **File**: `src/components/onboarding/ProgressiveOnboarding.tsx`
- **Exports**: shouldShowSignupPrompt
- **Reason**: Component unused


### StarRating

- **File**: `src/components/ui/StarRating.tsx`
- **Exports**: StarRating
- **Reason**: Component unused


### StatusBadge

- **File**: `src/components/ui/Badge.tsx`
- **Exports**: StatusBadge
- **Reason**: Component unused


### StripeWrapper

- **File**: `src/components/checkout/StripeWrapper.tsx`
- **Exports**: StripeWrapper
- **Reason**: Component unused


### StudioBookingForm

- **File**: `src/components/booking/studio/StudioBookingForm.tsx`
- **Exports**: StudioBookingForm
- **Reason**: Component unused


### StudioDashboard

- **File**: `src/components/roles/StudioDashboard.tsx`
- **Exports**: StudioDashboard
- **Reason**: Component unused


### SubscriptionSettings

- **File**: `src/components/settings/SubscriptionSettings.tsx`
- **Exports**: SubscriptionSettings
- **Reason**: Component unused


### tileDisabled

- **File**: `src/components/booking/BookingCalendar.tsx`
- **Exports**: tileDisabled
- **Reason**: Component unused


### toggleDropdown

- **File**: `src/components/ui/NotificationBell.tsx`
- **Exports**: toggleDropdown
- **Reason**: Component unused


### toggleTag

- **File**: `src/components/search/SmartSearchResults.tsx`
- **Exports**: toggleTag
- **Reason**: Component unused


### TourTooltip

- **File**: `src/components/onboarding/TourTooltip.tsx`
- **Exports**: TourTooltip
- **Reason**: Component unused


### triggerSignupPrompt

- **File**: `src/components/booking/BookingForm.tsx`
- **Exports**: triggerSignupPrompt
- **Reason**: Component unused


### truncateMessage

- **File**: `src/components/dashboard/MessagesPreview.tsx`
- **Exports**: truncateMessage
- **Reason**: Component unused


### TypingIndicatorMinimal

- **File**: `src/components/chat/TypingIndicator.tsx`
- **Exports**: TypingIndicatorMinimal
- **Reason**: Component unused


### updateFilters

- **File**: `src/components/explore/FilterPanel.tsx`
- **Exports**: updateFilters
- **Reason**: Component unused


### updateLink

- **File**: `src/components/profile/VerificationFormModal.tsx`
- **Exports**: updateLink
- **Reason**: Component unused


### VerificationRejectedNotification

- **File**: `src/components/verification/VerificationNotification.tsx`
- **Exports**: VerificationRejectedNotification
- **Reason**: Component unused


### VerificationReminderNotification

- **File**: `src/components/verification/VerificationNotification.tsx`
- **Exports**: VerificationReminderNotification
- **Reason**: Component unused


### VerifiedIcon

- **File**: `src/components/ui/VerifiedBadge.tsx`
- **Exports**: VerifiedIcon
- **Reason**: Component unused


### VideographerDashboard

- **File**: `src/components/roles/VideographerDashboard.tsx`
- **Exports**: VideographerDashboard
- **Reason**: Component unused


### WalkthroughOverlay

- **File**: `src/components/ui/WalkthroughOverlay.tsx`
- **Exports**: WalkthroughOverlay
- **Reason**: Component unused


### debouncedFn

- **File**: `src/hooks/useDebounce.ts`
- **Exports**: debouncedFn
- **Reason**: Component unused


### handleBeforeUnload

- **File**: `src/hooks/useEnhancedChat.ts`
- **Exports**: handleBeforeUnload
- **Reason**: Component unused


### handleVisibilityChange

- **File**: `src/hooks/useEnhancedChat.ts`
- **Exports**: handleVisibilityChange
- **Reason**: Component unused


### useAdvancedDebounce

- **File**: `src/hooks/useDebounce.ts`
- **Exports**: useAdvancedDebounce
- **Reason**: Component unused


### useDebouncedAPICall

- **File**: `src/hooks/useDebounce.ts`
- **Exports**: useDebouncedAPICall
- **Reason**: Component unused


### useDebouncedCallback

- **File**: `src/hooks/useDebounce.ts`
- **Exports**: useDebouncedCallback
- **Reason**: Component unused


### useEmailCapture

- **File**: `src/hooks/useEmailCapture.ts`
- **Exports**: useEmailCapture
- **Reason**: Component unused



---

*Generated by: Intelligent Re-wire & Safe-Delete Pass v2*
