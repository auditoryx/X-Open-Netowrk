# Re-wire Candidates

Generated on: 2025-07-19T09:02:17.852Z

## Summary

This document lists components that are unused in code but are mentioned in documentation with clear usage context. These should be re-integrated into the codebase or their documentation updated.

**Total re-wire candidates**: 10

## Re-wiring Strategy

These components fall into categories:
1. **Import Examples**: Components shown in import statements in docs
2. **Usage Examples**: Components with usage examples in documentation  
3. **Feature References**: Components mentioned as part of feature descriptions

## Components for Re-wiring


### Button

- **File**: `src/components/ui/Button.tsx`
- **Exports**: Button
- **Referenced In**: BOOKING_INBOX_IMPLEMENTATION.md, CONTRACT_PREVIEW_DOCS.md, CONTRIBUTING.md, GAMIFICATION_DEVELOPMENT_NOTES.md, ROLE_DASHBOARD_IMPLEMENTATION_GUIDE.md, SIGNATURE_TIER_IMPLEMENTATION_GUIDE.md, SPLIT_BOOKING_SYSTEM_README.md, USER_VERIFICATION_IMPLEMENTATION.md, docs/ADMIN_SYSTEM_PLAN.md, docs/AUDIT_EXECUTIVE_SUMMARY.md, docs/BRUTALIST_DESIGN_SYSTEM.md, docs/BRUTALIST_IMPLEMENTATION_PLAN.md, docs/COMPONENT_REFACTOR_MAP.md, docs/PLATFORM_STRUCTURE_MAP.md, docs/TIER_SYSTEM_AUDIT.md, docs/TIER_SYSTEM_PLAN.md, docs/UI_AUDIT_REPORT.md, docs/archive/PHASE_4_MESSAGING_COMPLETE.md, docs/archive/PHASE_4_RANKINGS_COMPLETE.md
- **Reason**: Referenced in documentation with import/usage context

**Documentation References**:

- **BOOKING_INBOX_IMPLEMENTATION.md:133**
  ```
  1. **Visit Test Page**: Navigate to `/test-components` for a comprehensive testing interface
2. **Create Sample Data**: Use the "Create Sample Data" button to populate test notifications and bookings
...
  ```

- **CONTRACT_PREVIEW_DOCS.md:21**
  ```
  - Terms agreement checkbox
- Secure payment button with loading states
- Professional styling and responsive design
  ```

- **CONTRIBUTING.md:128**
  ```
  ```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary';
  ```

- **GAMIFICATION_DEVELOPMENT_NOTES.md:563**
  ```
  - ✅ localStorage for cross-session persistence
- ✅ Clear action buttons with navigation
- ✅ Non-intrusive positioning (top-right)
  ```

- **ROLE_DASHBOARD_IMPLEMENTATION_GUIDE.md:153**
  ```
  - **Test**: Mobile and desktop layouts
- **Expected**: Clean responsive behavior, readable text, accessible buttons

  ```

- **SIGNATURE_TIER_IMPLEMENTATION_GUIDE.md:52**
  ```
  - **Features**:
  - Toggle button to grant/revoke Signature tier
  - Real-time UI updates
  ```

- **SPLIT_BOOKING_SYSTEM_README.md:150**
  ```
    limit={5}                    // Optional: limit displayed bookings
  showHeader={true}            // Show header with filters and create button
  onCreateNew={() => {
  ```

- **USER_VERIFICATION_IMPLEMENTATION.md:7**
  ```
  
### 1. Apply Verification Button Component
- **Smart Status Detection**: Automatically detects current verification status
  ```

- **docs/ADMIN_SYSTEM_PLAN.md:124**
  ```
  - Role-based menu visibility
- Quick action buttons
- User context display
  ```

- **docs/AUDIT_EXECUTIVE_SUMMARY.md:35**
  ```
  | **Interactions** | Smooth transitions | Sharp, dramatic effects | 🔴 MAJOR GAP |
| **Components** | Standard cards/buttons | Brutalist cards/buttons | 🔴 MAJOR GAP |

  ```

- **docs/BRUTALIST_DESIGN_SYSTEM.md:10**
  ```
  - **Monospace Font**: JetBrains Mono (400-800 weights) for UI elements
- **Text Transform**: UPPERCASE for headings, buttons, and labels
- **Heavy Weights**: Use 700+ font weights only for display ele...
  ```

- **docs/BRUTALIST_IMPLEMENTATION_PLAN.md:22**
  ```
  - [ ] **Footer.tsx** - Minimal sharp design
- [ ] **Button System** - Large, uppercase, monospaced buttons
- [ ] **Form Components** - Angular inputs with sharp focus states
  ```

- **docs/COMPONENT_REFACTOR_MAP.md:74**
  ```
  - Soft, refined typography
- Standard button styling

  ```

- **docs/PLATFORM_STRUCTURE_MAP.md:220**
  ```
  ├── Color palette: Background/text across entire platform
├── Component styling: Cards, buttons, forms, navigation
├── Interaction design: Hover effects, transitions, animations
  ```

- **docs/TIER_SYSTEM_AUDIT.md:62**
  ```
    - User list with tier status display
  - Signature tier toggle buttons
  - Real-time UI updates
  ```

- **docs/TIER_SYSTEM_PLAN.md:96**
  ```
  - **Promotion Process**:
  1. User clicks "Apply for Verification" button
  2. Verification form with portfolio upload
  ```

- **docs/UI_AUDIT_REPORT.md:84**
  ```
  font-sizes: Larger scale for impact
text-transform: UPPERCASE for headings/buttons
```
  ```

- **docs/archive/PHASE_4_MESSAGING_COMPLETE.md:33**
  ```
  ### 4. Profile Integration (`src/components/profile/ContactModal.tsx`)
- **Direct Messaging**: "Send Message" button on creator profiles
- **Thread Creation**: Automatically creates conversation threa...
  ```

- **docs/archive/PHASE_4_RANKINGS_COMPLETE.md:117**
  ```
  - **Responsive Grids**: Adapts from 4-column desktop to single-column mobile
- **Touch-Friendly**: Appropriate button sizes and spacing
- **Progressive Disclosure**: Compact mobile view, full desktop ...
  ```



### CalendarSync

- **File**: `src/components/calendar/CalendarSync.tsx`
- **Exports**: CalendarSync
- **Referenced In**: MVP_DEPLOYMENT_GUIDE.md, MVP_IMPLEMENTATION_PLAN.md, TECHNICAL_IMPLEMENTATION_GUIDE.md
- **Reason**: Referenced in documentation with import/usage context

**Documentation References**:

- **MVP_DEPLOYMENT_GUIDE.md:182**
  ```
  - `src/app/api/stripe/webhook/route.ts` - Payment webhook handling
- `src/lib/google/calendarSync.ts` - Calendar integration

  ```

- **MVP_IMPLEMENTATION_PLAN.md:28**
  ```
  - `/src/app/api/calendar/push/route.ts` - Push to Google Calendar
- `/src/components/calendar/CalendarSync.tsx` - UI component
- `/src/lib/google/calendar.ts` - Enhanced calendar service
  ```

- **TECHNICAL_IMPLEMENTATION_GUIDE.md:23**
  ```
  ### Calendar Sync Service
Create `src/lib/google/calendarSync.ts`:

  ```



### EmptyState

- **File**: `src/components/ui/EmptyState.tsx`
- **Exports**: EmptyState
- **Referenced In**: docs/archive/DEPLOYMENT_STATUS_JULY_4_FINAL.md
- **Reason**: Referenced in documentation with import/usage context

**Documentation References**:

- **docs/archive/DEPLOYMENT_STATUS_JULY_4_FINAL.md:219**
  ```
  - **MAJOR MILESTONE**: All import/export errors completely resolved!
- Fixed missing exports: EmptyState, SkeletonCard, storage, TIER_REQUIREMENTS, calculateTier
- Added missing functions: uploadPortf...
  ```



### MediaUpload

- **File**: `src/components/media/MediaUpload.tsx`
- **Exports**: MediaUpload
- **Referenced In**: MVP_IMPLEMENTATION_PLAN.md, TECHNICAL_IMPLEMENTATION_GUIDE.md, docs/archive/PHASE_5B_CREATOR_TOOLS_PLAN.md
- **Reason**: Referenced in documentation with import/usage context

**Documentation References**:

- **MVP_IMPLEMENTATION_PLAN.md:114**
  ```
  **Files to Create:**
- `/src/components/media/MediaUpload.tsx` - Upload component
- `/src/components/media/PortfolioGallery.tsx` - Gallery display
  ```

- **TECHNICAL_IMPLEMENTATION_GUIDE.md:471**
  ```
  ### Media Upload Component
Create `src/components/media/MediaUpload.tsx`:

  ```

- **docs/archive/PHASE_5B_CREATOR_TOOLS_PLAN.md:123**
  ```
  │   │   └── portfolio/
│   │       ├── MediaUpload.tsx
│   │       ├── PortfolioGallery.tsx
  ```



### PortfolioGallery

- **File**: `src/components/media/PortfolioGallery.tsx`
- **Exports**: PortfolioGallery
- **Referenced In**: MVP_IMPLEMENTATION_PLAN.md, docs/archive/PHASE_5B_CREATOR_TOOLS_PLAN.md
- **Reason**: Referenced in documentation with import/usage context

**Documentation References**:

- **MVP_IMPLEMENTATION_PLAN.md:115**
  ```
  - `/src/components/media/MediaUpload.tsx` - Upload component
- `/src/components/media/PortfolioGallery.tsx` - Gallery display
- `/src/app/api/media/upload/route.ts` - Upload endpoint
  ```

- **docs/archive/PHASE_5B_CREATOR_TOOLS_PLAN.md:124**
  ```
  │   │       ├── MediaUpload.tsx
│   │       ├── PortfolioGallery.tsx
│   │       └── ProjectShowcase.tsx
  ```



### prev

- **File**: `src/components/profile/MediaCarousel.tsx`
- **Exports**: prev
- **Referenced In**: ADVANCED_CLIENT_MANAGEMENT_SYSTEM_PLAN.md, AGENTS.md, BOOKING_CONFIRMATION_SETUP.md, BOOKING_FLOW.md, BOOKING_INBOX_IMPLEMENTATION.md, BUILD_SUCCESS_REPORT.md, CONTRACT_PREVIEW_DOCS.md, CONTRIBUTING.md, ENTERPRISE_TECHNICAL_ARCHITECTURE.md, EXECUTABLE_NEW_IDEAS_PLAN.md, GAMIFICATION_DEVELOPMENT_NOTES.md, GAMIFICATION_IMPLEMENTATION_BLUEPRINT.md, MVP_DEVELOPMENT_ROADMAP.md, README.md, REVIEW_SYSTEM_FINAL_GUIDE.md, REVIEW_SYSTEM_README.md, ROLE_DASHBOARD_IMPLEMENTATION_GUIDE.md, SEARCH_FUNCTIONALITY_DOCS.md, SECURITY_MODEL.md, SIGNATURE_TIER_IMPLEMENTATION_GUIDE.md, SPLIT_BOOKING_SYSTEM_README.md, TECHNICAL_IMPLEMENTATION_GUIDE.md, TIER_SYSTEM.md, UI_UX_AUDIT_REPORT.md, USER_VERIFICATION_IMPLEMENTATION.md, VERIFICATION_POLICY.md, docs/ADMIN_SYSTEM_PLAN.md, docs/ADMIN_VERIFICATION_IMPLEMENTATION.md, docs/ARCHITECTURE.md, docs/AUDIT_EXECUTIVE_SUMMARY.md, docs/BOOKING_CONFIRMATION_EMAIL.md, docs/BRUTALIST_IMPLEMENTATION_PLAN.md, docs/E2E_IMPLEMENTATION_SUMMARY.md, docs/E2E_TESTING.md, docs/PLATFORM_STRUCTURE_MAP.md, docs/SETUP.md, docs/TIER_SYSTEM_AUDIT.md, docs/TIER_SYSTEM_PLAN.md, docs/archive/ADMIN_ROLE_ACCESS_CONTROL_COMPLETE.md, docs/archive/ADVANCED_CLIENT_MANAGEMENT_IMPLEMENTATION_COMPLETE.md, docs/archive/AUDITORYX_PLATFORM_AUDIT_COMPLETE.md, docs/archive/COLLAB_DASHBOARD_COMPLETE.md, docs/archive/DEPLOYMENT_STATUS_FINAL.md, docs/archive/DEPLOYMENT_STATUS_JULY_4_FINAL.md, docs/archive/GAMIFICATION_DEPLOYMENT_SUMMARY.md, docs/archive/PHASE_1A_XP_SERVICE_COMPLETE.md, docs/archive/PHASE_2A_BADGE_ENGINE_COMPLETE.md, docs/archive/PHASE_2B_ANTI_GAMING_VALIDATION_COMPLETE.md, docs/archive/PHASE_2B_BADGE_UI_COMPLETE.md, docs/archive/PHASE_3A_VERIFICATION_LOGIC_COMPLETE.md, docs/archive/PHASE_3B_VERIFICATION_UI_COMPLETE.md, docs/archive/PHASE_4_MESSAGING_COMPLETE.md, docs/archive/PHASE_4_RANKINGS_COMPLETE.md, docs/archive/PHASE_5B_COMPLETION_SUMMARY.md, docs/archive/PHASE_5B_CREATOR_TOOLS_COMPLETE.md, docs/archive/PHASE_5B_CREATOR_TOOLS_PLAN.md, docs/archive/REVIEW_VALIDATION_COMPLETE.md, docs/archive/SMOKE_TESTS_SUMMARY.md, docs/archive/VERIFICATION_IMPLEMENTATION_SUMMARY.md, docs/backend-migration.md, docs/booking-system.md, docs/deployment.md, docs/gamification_tasks.md, docs/payment-system.md
- **Reason**: Referenced in documentation with import/usage context

**Documentation References**:

- **ADVANCED_CLIENT_MANAGEMENT_SYSTEM_PLAN.md:29**
  ```
    - Cross-artist booking coordination
  - Revenue tracking across entire roster

  ```

- **AGENTS.md:49**
  ```
  - Create a new branch for each change using the pattern `codex/<slug>`.
- Open a pull request when work is ready for review.

  ```

- **BOOKING_CONFIRMATION_SETUP.md:26**
  ```
  - Enhanced to send booking confirmation emails after payment
- Includes error handling to prevent webhook failures
- Fetches complete booking data from Firestore
  ```

- **BOOKING_FLOW.md:11**
  ```
  ```
    [Browse] → [Request] → [Pending] → [Confirmed] → [In Progress] → [Completed] → [Reviewed]
                    ↓           ↓            ↓              ↓
  ```

- **BOOKING_INBOX_IMPLEMENTATION.md:16**
  ```
  - **Real-time Badge**: Shows unread notification count
- **Dropdown Interface**: Preview notifications without leaving current page
- **Mark as Read**: Individual and bulk mark-as-read functionality
  ```

- **BUILD_SUCCESS_REPORT.md:21**
  ```
     - Added proper error handling for missing environment variables
   - Added try-catch blocks to prevent initialization failures
   - Added console warnings for missing configuration
  ```

- **CONTRACT_PREVIEW_DOCS.md:1**
  ```
  # Contract Preview Feature Documentation

  ```

- **CONTRIBUTING.md:225**
  ```
  4. Open pull request with descriptive title
5. Request review from team members
6. Address feedback and merge when approved
  ```

- **ENTERPRISE_TECHNICAL_ARCHITECTURE.md:439**
  ```
  ### Business Metrics
- Revenue per tenant
- Feature adoption rates
  ```

- **EXECUTABLE_NEW_IDEAS_PLAN.md:22**
  ```
  **Features:**
- Style matching based on previous bookings
- Budget optimization suggestions
  ```

- **GAMIFICATION_DEVELOPMENT_NOTES.md:205**
  ```
  - Never skip validation in production flows
- Always use `contextId` for duplicate prevention
- Implement cooldowns for user actions
  ```

- **GAMIFICATION_IMPLEMENTATION_BLUEPRINT.md:76**
  ```
  - [x] XP accurately tracks for all booking completions
- [x] Daily XP cap prevents gaming
- [x] Admin can manage XP effectively
  ```

- **MVP_DEVELOPMENT_ROADMAP.md:46**
  ```
     - Implement payment dispute handling
   - Add fraud detection and prevention
   - Create payment audit logs
  ```

- **README.md:3**
  ```
  
**AuditoryX** is a comprehensive platform connecting audio creators, engineers, and music professionals for seamless collaboration, booking management, and revenue sharing. Built for the modern creat...
  ```

- **REVIEW_SYSTEM_FINAL_GUIDE.md:14**
  ```
  - ✅ Review count display
- ✅ Secure Firestore rules preventing duplicate/unauthorized reviews

  ```

- **REVIEW_SYSTEM_README.md:12**
  ```
     - Located: `src/lib/reviews/postReview.ts`
   - Uses bookingId as document ID (prevents duplicates)
   - Validates rating (1-5) and comment requirements
  ```

- **ROLE_DASHBOARD_IMPLEMENTATION_GUIDE.md:11**
  ```
  - ✅ Centralized booking management with real-time stats
- ✅ Message preview with unread counts and threading
- ✅ Service management with status tracking
  ```

- **SEARCH_FUNCTIONALITY_DOCS.md:35**
  ```
  - Dropdown appears when focusing the search input
- Quick access to previous searches
- Clear all option available
  ```

- **SECURITY_MODEL.md:189**
  ```
  - Validate user permissions on both client and server
- Sanitize all user inputs to prevent injection attacks
- Implement proper error handling without exposing sensitive data
  ```

- **SIGNATURE_TIER_IMPLEMENTATION_GUIDE.md:159**
  ```
  - Only admin users can grant/revoke signature tier
- Firestore rules prevent unauthorized updates
- UI toggle only available to admin users
  ```

- **SPLIT_BOOKING_SYSTEM_README.md:353**
  ```
  - **Session Recording**: Integration with recording platforms
- **Review System**: Post-session feedback and ratings
- **Calendar Integration**: Sync with external calendars
  ```

- **TECHNICAL_IMPLEMENTATION_GUIDE.md:500**
  ```
        const progressCallback = (progress: number) => {
        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
      };
  ```

- **TIER_SYSTEM.md:54**
  ```
  4. **Community Standing**: No active disputes or violations
5. **Admin Approval**: Manual review required

  ```

- **UI_UX_AUDIT_REPORT.md:89**
  ```
  1. **✅ FIXED: Broken Explore Page** 
   - **Previous State**: Main discovery page showed "under construction"
   - **Impact**: Users could not browse creators (critical business failure)
  ```

- **USER_VERIFICATION_IMPLEMENTATION.md:11**
  ```
  - **Two Variants**: Button and card variants for different UI contexts
- **Disabled States**: Prevents re-submission when already verified or pending

  ```

- **VERIFICATION_POLICY.md:7**
  ```
  2. **Submit your ID** – use the in‑app form to upload a government issued ID. Only JPG, PNG or PDF files are accepted.
3. **Wait for review** – our team checks submissions in the order they are receiv...
  ```

- **docs/ADMIN_SYSTEM_PLAN.md:45**
  ```
    - Suspend accounts temporarily  
  - Review user activity and behavior patterns

  ```

- **docs/ADMIN_VERIFICATION_IMPLEMENTATION.md:88**
  ```
  ### Short-term Improvements:
- [ ] Document upload validation and preview
- [ ] Bulk approval/rejection actions
  ```

- **docs/ARCHITECTURE.md:20**
  ```
  ## Data
- Firestore: users, services, bookings, reviews, etc.
- Indexes and rules for security and performance
  ```

- **docs/AUDIT_EXECUTIVE_SUMMARY.md:14**
  ```
  ✅ **Identify redundant, confusing, or missing pages**  
✅ **Review core UI components** for inconsistencies  
✅ **Compare against brutalist style guide requirements**  
  ```

- **docs/BOOKING_CONFIRMATION_EMAIL.md:146**
  ```
  - **SendGrid Failures**: Detailed error logging and user-friendly messages
- **Already Confirmed**: Prevents duplicate email sending

  ```

- **docs/BRUTALIST_IMPLEMENTATION_PLAN.md:149**
  ```
  - [ ] User experience testing
- [ ] Design consistency review

  ```

- **docs/E2E_IMPLEMENTATION_SUMMARY.md:87**
  ```
  2. **Form Validation** - Required ratings, minimum text length
3. **Duplicate Prevention** - One review per booking restriction
4. **Edit Functionality** - Time-limited review editing
  ```

- **docs/E2E_TESTING.md:101**
  ```
  - Form validation (rating, text requirements)
- Duplicate review prevention
- Review editing within time limits
  ```

- **docs/PLATFORM_STRUCTURE_MAP.md:165**
  ```
  | Profile pages | Creator showcase | Critical | ⚠️ Major |
| Booking flow | Revenue generation | Critical | ⚠️ Major |
| Search | Content discovery | High | ⚠️ Moderate |
  ```

- **docs/SETUP.md:196**
  ```
  /artistServices/{serviceId}
/reviews/{reviewId}
/notifications/{notificationId}
  ```

- **docs/TIER_SYSTEM_AUDIT.md:109**
  ```
  - **Requirements**: 1000 XP + 3 completed bookings
- **Process**: User applies → Admin reviews → Manual approval
- **Implementation**: ✅ Complete
  ```

- **docs/TIER_SYSTEM_PLAN.md:254**
  ```
  3. **Progress Tracking**: XP and booking counters
4. **Motivation**: Benefits preview and success stories

  ```

- **docs/archive/ADMIN_ROLE_ACCESS_CONTROL_COMPLETE.md:157**
  ```
  
- **🔒 Secure**: Multi-layer protection prevents unauthorized access
- **👥 User-friendly**: Clear messaging and appropriate redirects
  ```

- **docs/archive/ADVANCED_CLIENT_MANAGEMENT_IMPLEMENTATION_COMPLETE.md:44**
  ```
  - **Real-time performance tracking** for artists and projects
- **Revenue and booking analytics** with interactive charts
- **Top performer identification** and recent activity monitoring
  ```

- **docs/archive/AUDITORYX_PLATFORM_AUDIT_COMPLETE.md:62**
  ```
  - Advanced booking chat with file sharing
- Contract preview and signing system
- Revision request system
  ```

- **docs/archive/COLLAB_DASHBOARD_COMPLETE.md:145**
  ```
  - **Calendar Integration**: Sync with calendar systems for scheduling
- **Contract Management**: Integrate with contract preview and signing

  ```

- **docs/archive/DEPLOYMENT_STATUS_FINAL.md:170**
  ```
  - Business intelligence dashboard
- Revenue optimization algorithms

  ```

- **docs/archive/DEPLOYMENT_STATUS_JULY_4_FINAL.md:386**
  ```
  
### 7. ✅ **SEO Metadata & Social Previews (Medium Priority)** - **10/10**
- **Status**: 100% Complete
  ```

- **docs/archive/GAMIFICATION_DEPLOYMENT_SUMMARY.md:31**
  ```
  - **Badge Administration**: Create, manage, and track badge distribution
- **Verification Queue**: Review and approve verification applications
- **Challenge Management**: Create, monitor, and analyze...
  ```

- **docs/archive/PHASE_1A_XP_SERVICE_COMPLETE.md:12**
  ```
  - **Core Methods**:
  - `awardXP()`: Awards XP with daily cap enforcement and duplicate prevention
  - `getUserProgress()`: Retrieves user XP data and progress
  ```

- **docs/archive/PHASE_2A_BADGE_ENGINE_COMPLETE.md:178**
  ```
  - Criteria-based eligibility validation
- Duplicate prevention
- Bonus XP rewards
  ```

- **docs/archive/PHASE_2B_ANTI_GAMING_VALIDATION_COMPLETE.md:19**
  ```
  ### 2. **XP Validation Service** (`/src/lib/services/xpValidationService.ts`)
- **Cooldown Enforcement**: Prevents rapid XP farming attempts
- **Rate Limiting**: User-specific rate limits for XP event...
  ```

- **docs/archive/PHASE_2B_BADGE_UI_COMPLETE.md:192**
  ```
  - **Graceful Degradation**: Components work with partial data
- **Error Boundaries**: Prevent badge UI crashes from affecting app
- **Retry Logic**: Automatic retry for failed badge data fetches
  ```

- **docs/archive/PHASE_3A_VERIFICATION_LOGIC_COMPLETE.md:35**
  ```
  - **Seamless Integration**: No impact on core XP flow performance
- **Error Handling**: Robust error handling prevents XP flow disruption

  ```

- **docs/archive/PHASE_3B_VERIFICATION_UI_COMPLETE.md:196**
  ```
  
## 🔄 **Integration with Previous Phases**

  ```

- **docs/archive/PHASE_4_MESSAGING_COMPLETE.md:39**
  ```
  
### 5. Dashboard Integration (`src/components/dashboard/MessagesPreview.tsx`)
- **Recent Messages**: Preview of latest conversations
  ```

- **docs/archive/PHASE_4_RANKINGS_COMPLETE.md:22**
  ```
  **Key Features**:
- **Logarithmic XP Scaling**: Prevents high-XP users from dominating rankings
- **Verification Boost**: +25 points for verified creators with recency bonus
  ```

- **docs/archive/PHASE_5B_COMPLETION_SUMMARY.md:49**
  ```
  - ✅ Customization presets (dark mode, high contrast, mobile compact)
- ✅ Live theme preview with customizations
- ✅ CSS generation for themes
  ```

- **docs/archive/PHASE_5B_CREATOR_TOOLS_COMPLETE.md:190**
  ```
  - **Visual Grid Layout**: Instagram-like portfolio display
- **Media Optimization**: Fast-loading thumbnails and previews
- **Drag-and-Drop**: Intuitive portfolio management
  ```

- **docs/archive/PHASE_5B_CREATOR_TOOLS_PLAN.md:10**
  ```
  - [ ] Performance metrics (response time, rating trends) 
- [ ] Revenue optimization suggestions
- [ ] Booking completion rates
  ```

- **docs/archive/REVIEW_VALIDATION_COMPLETE.md:32**
  ```
  ```
- ✅ Firestore document ID = bookingId (prevents duplicates)
- ✅ Pre-submission check for existing reviews
  ```

- **docs/archive/SMOKE_TESTS_SUMMARY.md:9**
  ```
  ### 1. **Role-based Smoke Tests (Complete User Journeys)**
- `tests/e2e/role-client-smoke.spec.ts` - Full client journey: sign-up → explore → book → pay → review
- `tests/e2e/role-provider-smoke.spec....
  ```

- **docs/archive/VERIFICATION_IMPLEMENTATION_SUMMARY.md:35**
  ```
  - Rejection flow testing
- Security testing (non-admin access prevention)
- API error handling verification
  ```

- **docs/backend-migration.md:179**
  ```
  ### Risk: Security Vulnerabilities
- Mitigation: Security review of new code
- Mitigation: Penetration testing
  ```

- **docs/booking-system.md:28**
  ```
  3. File sharing and feedback
4. Revision requests (if needed)
5. Final delivery
  ```

- **docs/deployment.md:412**
  ```
  1. **Frontend Rollback**
   - Revert to previous deployment
   - Update environment variables
  ```

- **docs/gamification_tasks.md:28**
  ```
  ## Phase 5 – Abuse & Monitoring
- ✅ Implement validation to prevent XP from fake bookings, duplicate reviews, or message spam.
- ✅ Add audit logging for suspicious activity and optional monitoring scr...
  ```

- **docs/payment-system.md:358**
  ```
  
### Fraud Prevention
```typescript
  ```



### SearchBar

- **File**: `src/components/explore/SearchBar.tsx`
- **Exports**: SearchBar
- **Referenced In**: PLATFORM_OPTIMIZATION_TO_10_IMPLEMENTATION.md, SEARCH_FUNCTIONALITY_DOCS.md
- **Reason**: Referenced in documentation with import/usage context

**Documentation References**:

- **PLATFORM_OPTIMIZATION_TO_10_IMPLEMENTATION.md:205**
  ```
  ```typescript
// Enhanced SearchBar with AI suggestions
export function AdvancedSearchBar({ onSearch, className }: SearchBarProps) {
  ```

- **SEARCH_FUNCTIONALITY_DOCS.md:62**
  ```
  ### Components
- `components/explore/SearchBar.tsx` - Main search input component
- Updated `src/app/explore/page.tsx` - Integration with explore page
  ```



### SEOMeta

- **File**: `src/components/SEOMeta.tsx`
- **Exports**: SEOMeta
- **Referenced In**: docs/archive/DEPLOYMENT_STATUS_JULY_4_FINAL.md
- **Reason**: Referenced in documentation with import/usage context

**Documentation References**:

- **docs/archive/DEPLOYMENT_STATUS_JULY_4_FINAL.md:389**
  ```
  - **Impact**: Enhanced discoverability
- **Details**: Created SEOMeta component, added Open Graph/Twitter cards, dynamic metadata

  ```



### SkeletonCard

- **File**: `src/components/ui/SkeletonCard.tsx`
- **Exports**: SkeletonCard
- **Referenced In**: docs/archive/DEPLOYMENT_STATUS_JULY_4_FINAL.md
- **Reason**: Referenced in documentation with import/usage context

**Documentation References**:

- **docs/archive/DEPLOYMENT_STATUS_JULY_4_FINAL.md:219**
  ```
  - **MAJOR MILESTONE**: All import/export errors completely resolved!
- Fixed missing exports: EmptyState, SkeletonCard, storage, TIER_REQUIREMENTS, calculateTier
- Added missing functions: uploadPortf...
  ```



### TierBadge

- **File**: `src/components/badges/TierBadge.tsx`
- **Exports**: TierBadge
- **Referenced In**: docs/GAMIFICATION.md, docs/TIER_SYSTEM_AUDIT.md, docs/TIER_SYSTEM_PLAN.md
- **Reason**: Referenced in documentation with import/usage context

**Documentation References**:

- **docs/GAMIFICATION.md:6**
  ```
  - Tiers: standard, blue, gold (with frozen state)
- TierBadge and ProgressRing components visualize status

  ```

- **docs/TIER_SYSTEM_AUDIT.md:50**
  ```
  
- **TierBadge**: `src/components/badges/TierBadge.tsx` 
  - Generic tier badge component
  ```

- **docs/TIER_SYSTEM_PLAN.md:55**
  ```
  ```typescript
// Component: TierBadge.tsx
interface TierBadgeProps {
  ```




---

*Generated by: Intelligent Re-wire & Safe-Delete Pass v2*
