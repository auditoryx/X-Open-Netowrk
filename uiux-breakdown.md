# UI/UX Breakdown — AuditoryX Open Network (Beta)

## 1. Page Inventory

### Core Platform Pages
- **`/`** - Homepage with hero section showcasing the global creative network built for music
- **`/explore`** - Main discovery page for browsing creators and services
- **`/explore/[role]`** - Role-specific exploration (artists, engineers, producers, studios, videographers)
- **`/search`** - Advanced search functionality with filtering capabilities
- **`/map`** - Geographic view of creators and services worldwide

### Authentication & Onboarding
- **`/auth`** - Main authentication page with login/signup options
- **`/login`** - Dedicated login form
- **`/signup`** - Registration flow for new users
- **`/forgot-password`** - Password reset functionality
- **`/auth/reset-password`** - Password reset completion page
- **`/auth/verify-email`** - Email verification step
- **`/verify-email`** - Email verification landing page
- **`/onboarding`** - Progressive onboarding flow for new users
- **`/select-intent`** - Role and intention selection during signup
- **`/create-profile`** - Profile creation wizard

### User Profiles & Management
- **`/profile/[uid]`** - Public user profile pages displaying portfolios and services
- **`/profile/edit`** - Profile editing interface
- **`/settings`** - User account settings
- **`/settings/security`** - Security settings including password and 2FA
- **`/availability`** - Availability calendar management

### Dashboard System (Role-Based)
- **`/dashboard`** - Main dashboard landing with role-specific content
- **`/dashboard/[role]`** - Role-specific dashboard views (artist, engineer, producer, studio, videographer)
- **`/dashboard/analytics`** - Performance metrics and insights
- **`/dashboard/bookings`** - Booking management interface
- **`/dashboard/bookings/[bookingId]`** - Individual booking details
- **`/dashboard/collabs`** - Collaboration management
- **`/dashboard/collabs/[bookingId]`** - Specific collaboration details
- **`/dashboard/messages`** - Messaging center
- **`/dashboard/messages/[threadId]`** - Individual conversation threads
- **`/dashboard/earnings`** - Revenue tracking and payment history
- **`/dashboard/reviews`** - Review management system
- **`/dashboard/portfolio`** - Portfolio management tools
- **`/dashboard/services`** - Service listing management
- **`/dashboard/notifications`** - Notification center
- **`/dashboard/favorites`** - Saved creators and services
- **`/dashboard/upcoming`** - Upcoming bookings and events

### Booking & Commerce
- **`/book/[uid]`** - Booking initiation for specific creators
- **`/booking`** - General booking flow entry point
- **`/booking/[bookingId]`** - Booking details and management
- **`/booking/[bookingId]/chat`** - Integrated chat for active bookings
- **`/booking/preview/[bookingId]`** - Booking preview before confirmation
- **`/cart`** - Shopping cart for multiple service bookings
- **`/cancel`** - Booking cancellation flow
- **`/success`** - Successful booking/payment confirmation

### Services & Marketplace
- **`/services`** - Service marketplace overview
- **`/services/[id]`** - Individual service detail pages
- **`/services/add`** - Service creation form
- **`/services/edit/[id]`** - Service editing interface
- **`/services/manage`** - Service management dashboard
- **`/beats`** - Beat marketplace (music-specific)
- **`/saved`** - User's saved services and creators

### Verification & Trust
- **`/verification`** - Verification process overview
- **`/verification/start`** - Begin verification process
- **`/verification/pending`** - Pending verification status
- **`/apply`** - General application landing page
- **`/apply/[role]`** - Role-specific application forms
- **`/verified`** - Verified status confirmation
- **`/set-role`** - Role selection/modification

### Admin Panel
- **`/admin/dashboard`** - Administrative overview
- **`/admin/users`** - User management interface
- **`/admin/users/[uid]`** - Individual user administration
- **`/admin/verifications`** - Verification request management
- **`/admin/applications`** - Application review system
- **`/admin/analytics`** - Platform-wide analytics
- **`/admin/reports`** - Reporting and moderation tools
- **`/admin/disputes`** - Dispute resolution interface
- **`/admin/listings`** - Service and listing moderation

### Community & Discovery
- **`/leaderboard`** - Global creator rankings
- **`/leaderboards/[city]/[role]`** - Location and role-specific leaderboards
- **`/top-creators`** - Featured creator showcase
- **`/artists`**, **`/engineers`**, **`/producers`**, **`/studios`**, **`/videographers`** - Role-specific directories

### Informational Pages
- **`/about`** - Platform overview and mission
- **`/contact`** - Contact information and support
- **`/creator-guidelines`** - Guidelines for content creators
- **`/privacy-policy`** - Privacy policy documentation
- **`/terms-of-service`** - Terms of service agreement
- **`/legal/escrow`** - Escrow payment information

### Testing & Development
- **`/test`** - Various testing pages for development
- **`/offline`** - Offline functionality page
- **`/start`** - Alternative entry point

## 2. Component Map

### Core UI Components
- **`Button`** (components/ui/) - Brutalist-styled button system with variants
- **`DragDropUpload`** (components/ui/) - File upload interface with drag-and-drop
- **`XpProgressBar`** (components/ui/) - Experience point visualization

### Navigation & Layout
- **`Navbar`** (components/) - Main navigation bar with brutalist design
- **`Footer`** (components/) - Site footer with links and information
- **`Layout`** (components/) - Page layout wrapper component
- **`DashboardHeader`** (components/) - Dashboard-specific navigation

### Service & Marketplace Components
- **`ServiceCard`** (components/) - Service listing card with pricing and actions
- **`ServiceList`** (components/) - Collection of service cards with filtering
- **`ServiceForm`** (components/) - Service creation and editing forms
- **`ServiceManager`** (components/) - Service management interface
- **`ServiceFilter`** (components/) - Advanced filtering for service discovery
- **`ServiceProfileModal`** (components/) - Modal for service details
- **`ServiceSubmissionForm`** (components/) - Service submission workflow

### Booking System
- **`BookingForm`** (components/) - Booking initiation interface
- **`BookingCard`** (components/booking/) - Individual booking display
- **`BookingConfirmation`** (components/booking/) - Booking confirmation UI
- **`BookingChatThread`** (components/) - Integrated messaging for bookings
- **`BookingsViewer`** (components/) - Booking management interface
- **`RevenueSplitViewer`** (components/booking/) - Revenue distribution display

### Dashboard Components
- **`Bookings`** (components/dashboard/) - Dashboard booking overview
- **`BookingCard`** (components/dashboard/) - Dashboard-specific booking cards
- **`Messages`** (components/dashboard/) - Message center interface
- **`Notifications`** (components/dashboard/) - Notification system
- **`ProfileCard`** (components/dashboard/) - User profile summary
- **`ServicesList`** (components/dashboard/) - Dashboard service management
- **`MentorshipCard`** (components/dashboard/) - Mentorship program interface
- **`MentorshipPanel`** (components/dashboard/) - Mentorship management
- **`EventTeamPanel`** (components/dashboard/) - Team collaboration tools

### User Management
- **`EditProfileForm`** (components/) - Profile editing interface
- **`RoleToggle`** (components/) - Role switching functionality
- **`ClientBookings`** (components/) - Client-side booking management
- **`ProviderBookings`** (components/) - Service provider booking interface
- **`IncomingRequests`** (components/) - Request management system

### Exploration & Discovery
- **`Explore`** (components/Explore/) - Main exploration interface
- **`ExploreServices`** (components/) - Service discovery component
- **`Hero`** (components/) - Homepage hero section
- **`HeroSection`** (components/) - Reusable hero component

### Forms & Interactions
- **`AvailabilityForm`** (components/) - Availability calendar management
- **`SendServiceRequest`** (components/) - Service request submission
- **`StripeCheckout`** (components/) - Payment processing interface

### Admin Components
- **`admin`** (components/admin/) - Administrative interface components

### Specialized Features
- **`Services`** (components/) - Service marketplace interface
- **`BannedModal`** (components/) - User moderation interface
- **`chat`** (components/chat/) - Real-time messaging components
- **`event`** (components/event/) - Event management tools
- **`forms`** (components/forms/) - Reusable form components

## 3. User Flows

### Sign-up → Profile Creation Flow
1. Visit homepage → Click signup/login
2. Complete registration form with email/password
3. Verify email address via confirmation link
4. Select user intent (hire talent vs. offer services)
5. Complete profile creation with role selection and basic information

### Search → Book → Payment Flow
1. Navigate to explore page or use search functionality
2. Filter by role, location, price range, and availability
3. Browse creator profiles and service offerings
4. Initiate booking with specific creator or service
5. Complete payment through Stripe integration with escrow protection

### Admin Verification Workflow
1. Admin accesses verification management dashboard
2. Review pending verification applications with submitted documentation
3. Verify creator credentials and portfolio authenticity
4. Approve or reject applications with feedback
5. Update user status and notify of verification decision

### Creator Service Management Flow
1. Creator accesses dashboard services section
2. Add new service with pricing, description, and media
3. Set availability calendar and booking preferences
4. Manage incoming booking requests and communications
5. Complete work delivery and receive payment release

### Collaboration Booking Flow
1. Discover creators through exploration or search
2. Review portfolios and previous work examples
3. Initiate booking with project requirements
4. Engage in pre-project chat and requirement clarification
5. Confirm booking with escrow payment and timeline agreement

## 4. Visual Style Summary

### Color Palette
- **Primary Brand**: Purple spectrum (#8B5CF6 - brand-500) with full 50-950 scale
- **Background**: Pure black (#000000 - brutalist-black) with dark grays for surfaces
- **Text**: White (#ffffff) for primary text with gray variants for hierarchy
- **Accent Colors**: Cyan (#06B6D4), Amber (#F59E0B), Emerald (#10B981), Rose (#EC4899)
- **Status Colors**: Success green, warning amber, error red with 50/500/600/700 variants

### Typography System
- **Display Font**: Space Grotesk (700, 800, 900 weights) for headers and branding
- **Body Font**: Inter (400, 700 weights) for readable content
- **Monospace**: JetBrains Mono for technical elements and data display
- **Brutalist Classes**: Uppercase transforms with enhanced letter-spacing and bold weights

### Spacing Scale
- **Mobile-first Approach**: Base spacing with responsive scaling
- **Safe Area Support**: iOS-compatible spacing with env() variables
- **Component Spacing**: Consistent 4px base scale with semantic size naming
- **Touch Targets**: Minimum 44px (2.75rem) for accessibility compliance

### Design System Implementation
- **Tailwind CSS**: Comprehensive utility-first framework with custom extensions
- **Brutalist System**: Custom CSS classes for strong, geometric design elements
- **Component Variants**: Class Variance Authority for component state management
- **Animation System**: Custom keyframes for fade, slide, scale, and brutalist effects

### Visual Elements
- **Shadows**: Brutalist box shadows (4px, 6px, 8px offsets) in gray
- **Borders**: Strong 2-4px borders for definition and structure
- **Cards**: Elevated surfaces with consistent shadow and border treatment
- **Buttons**: High-contrast with clear state changes and brutalist aesthetics

## 5. Responsiveness & A11y Snapshot

### Responsive Design Strategy
- **Mobile-First**: Base styles target mobile devices with progressive enhancement
- **Breakpoint System**: xs(475px), sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px)
- **Touch Optimization**: Dedicated touch device queries and tap target sizing
- **Flexible Typography**: Responsive font scaling with mobile-optimized line heights
- **Safe Area Support**: iOS notch and gesture area compatibility

### Layout Adaptation
- **Navigation**: Collapsible mobile menu with full-screen overlay
- **Cards**: Single-column mobile layout expanding to grid systems on larger screens
- **Dashboard**: Stacked mobile layout transforming to multi-column desktop interface
- **Forms**: Full-width mobile inputs with responsive labeling and spacing

### Accessibility Implementation
- **Semantic HTML**: Proper heading hierarchy and landmark elements
- **Keyboard Navigation**: Full keyboard accessibility for interactive elements
- **Focus Management**: Visible focus indicators with custom styling
- **Color Contrast**: High contrast brutalist design exceeds WCAG requirements
- **Screen Reader Support**: ARIA labels and descriptive text for complex interactions
- **Touch Targets**: Minimum 44px tap areas for motor accessibility

### Progressive Enhancement
- **Offline Support**: PWA capabilities with offline page functionality
- **Performance**: Optimized bundle sizes with code splitting
- **Loading States**: Skeleton screens and progressive loading indicators
- **Error Boundaries**: Graceful error handling with user-friendly messages

### Browser Support
- **Modern Standards**: ES6+ features with appropriate polyfills
- **CSS Grid/Flexbox**: Modern layout techniques with fallbacks
- **Custom Properties**: CSS variables for theming with fallback values
- **Service Workers**: Progressive web app features for enhanced performance