#!/bin/bash

# Beta Issue Creation Script
# This script creates all beta-gap and post-MVP issues for the X-Open-Network project

set -e

echo "🚀 Starting Beta Issue Creation..."
echo "Repository: auditoryx/X-Open-Netowrk"
echo "Total issues to create: 14"
echo ""

# Check if GitHub CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI is not installed. Please install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run:"
    echo "   gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"
echo ""

# Create or update milestones
echo "📅 Creating milestones..."
gh api repos/auditoryx/X-Open-Netowrk/milestones -f title="Beta Launch" -f description="Critical issues blocking beta launch" -f state="open" || echo "Milestone 'Beta Launch' may already exist"
gh api repos/auditoryx/X-Open-Netowrk/milestones -f title="Beta v1.1" -f description="Medium priority improvements for beta" -f state="open" || echo "Milestone 'Beta v1.1' may already exist"
gh api repos/auditoryx/X-Open-Netowrk/milestones -f title="Post-Beta" -f description="Post-MVP features and enhancements" -f state="open" || echo "Milestone 'Post-Beta' may already exist"

echo "✅ Milestones created"
echo ""

# Create project board
echo "📋 Creating Beta Launch project board..."
PROJECT_CREATION_OUTPUT=$(gh project create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "Beta Launch" \
    --body "Beta Launch project board for tracking all beta-gap and post-MVP issues" 2>&1 || echo "Project board may already exist")
echo "$PROJECT_CREATION_OUTPUT"
echo ""

# Create issues
echo "🎯 Creating issues..."
CREATED_COUNT=0
FAILED_COUNT=0


echo "Creating issue 1/14: [CRITICAL] Implement Complete Password Reset Flow"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[CRITICAL] Implement Complete Password Reset Flow" \
    --body "Password reset functionality is completely missing, blocking user recovery.

**Tasks:**
- [ ] Create forgot password UI component
- [ ] Implement password reset API endpoint
- [ ] Set up email template system
- [ ] Add password reset form validation
- [ ] Test email delivery and reset flow

**Acceptance Criteria:**
- Users can request password reset via email
- Password reset emails are delivered within 2 minutes
- Reset links expire after 24 hours
- New passwords meet security requirements

**Estimate:** 3 days
**Priority:** Critical" \
    --label "beta-gap,authentication,security,priority:critical" \
    --milestone "Beta Launch" \
    --assignee "auditoryx"; then
    echo "✅ Created: [CRITICAL] Implement Complete Password Reset Flow"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [CRITICAL] Implement Complete Password Reset Flow"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "Creating issue 2/14: [CRITICAL] Add Email Verification System"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[CRITICAL] Add Email Verification System" \
    --body "User registration lacks email verification, creating security risk.

**Tasks:**
- [ ] Add email verification step to signup flow
- [ ] Create email verification API endpoint
- [ ] Design verification email template
- [ ] Add verification status to user profiles
- [ ] Block unverified users from sensitive actions

**Acceptance Criteria:**
- New users must verify email before full access
- Verification emails sent immediately upon registration
- Clear UI indicates verification status
- Resend verification option available

**Estimate:** 3 days
**Priority:** Critical" \
    --label "beta-gap,authentication,email,priority:critical" \
    --milestone "Beta Launch" \
    --assignee "auditoryx"; then
    echo "✅ Created: [CRITICAL] Add Email Verification System"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [CRITICAL] Add Email Verification System"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "Creating issue 3/14: [CRITICAL] Robust Payment Error Handling"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[CRITICAL] Robust Payment Error Handling" \
    --body "Payment error handling is incomplete, causing poor user experience.

**Tasks:**
- [ ] Implement comprehensive Stripe error mapping
- [ ] Add user-friendly error messages
- [ ] Create payment retry mechanisms
- [ ] Add payment failure recovery flows
- [ ] Test all Stripe error scenarios

**Acceptance Criteria:**
- All Stripe errors have user-friendly messages
- Users can retry failed payments
- Payment failures don't lose booking data
- Clear next steps provided for each error type

**Estimate:** 4 days
**Priority:** Critical" \
    --label "beta-gap,payments,stripe,priority:critical" \
    --milestone "Beta Launch" \
    --assignee "auditoryx"; then
    echo "✅ Created: [CRITICAL] Robust Payment Error Handling"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [CRITICAL] Robust Payment Error Handling"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "Creating issue 4/14: [CRITICAL] Comprehensive Database Validation Rules"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[CRITICAL] Comprehensive Database Validation Rules" \
    --body "Firestore security rules need comprehensive audit and validation.

**Tasks:**
- [ ] Audit all Firestore security rules
- [ ] Add data validation rules
- [ ] Test unauthorized access scenarios  
- [ ] Add rate limiting rules
- [ ] Document security rule patterns

**Acceptance Criteria:**
- All collections have proper access controls
- Data validation prevents malformed documents
- Unauthorized users cannot access protected data
- Rate limiting prevents abuse

**Estimate:** 3 days
**Priority:** Critical" \
    --label "beta-gap,database,firestore,security,priority:critical" \
    --milestone "Beta Launch" \
    --assignee "auditoryx"; then
    echo "✅ Created: [CRITICAL] Comprehensive Database Validation Rules"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [CRITICAL] Comprehensive Database Validation Rules"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "Creating issue 5/14: [HIGH] Standardize Loading States Across App"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[HIGH] Standardize Loading States Across App" \
    --body "Inconsistent loading indicators create poor user experience.

**Tasks:**
- [ ] Create standardized loading components
- [ ] Audit all async operations for loading states
- [ ] Implement skeleton loaders for key pages
- [ ] Add loading states to forms and buttons
- [ ] Test loading behavior across slow connections

**Acceptance Criteria:**
- Consistent loading indicators across all pages
- No blank screens during data loading
- Loading states provide progress feedback
- Accessible loading announcements for screen readers

**Estimate:** 2 days
**Priority:** High" \
    --label "beta-gap,ui-ux,components,priority:high" \
    --milestone "Beta Launch"; then
    echo "✅ Created: [HIGH] Standardize Loading States Across App"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [HIGH] Standardize Loading States Across App"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "Creating issue 6/14: [HIGH] Mobile Dashboard Responsiveness"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[HIGH] Mobile Dashboard Responsiveness" \
    --body "Dashboard is not optimized for mobile devices.

**Tasks:**
- [ ] Audit dashboard components for mobile compatibility
- [ ] Implement responsive navigation patterns
- [ ] Optimize tables and data displays for small screens
- [ ] Test on various mobile devices and screen sizes
- [ ] Add touch-friendly interactions

**Acceptance Criteria:**
- Dashboard fully functional on mobile devices
- Navigation accessible via touch
- All data tables/lists usable on small screens
- Form inputs properly sized for mobile

**Estimate:** 5 days
**Priority:** High" \
    --label "beta-gap,mobile,responsive,dashboard,priority:high" \
    --milestone "Beta Launch"; then
    echo "✅ Created: [HIGH] Mobile Dashboard Responsiveness"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [HIGH] Mobile Dashboard Responsiveness"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "Creating issue 7/14: [HIGH] Search Performance Optimization"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[HIGH] Search Performance Optimization" \
    --body "Search queries are slow, impacting user experience.

**Tasks:**
- [ ] Analyze current search query performance
- [ ] Implement search result caching
- [ ] Add database indexes for search fields
- [ ] Optimize Firestore compound queries
- [ ] Add search result pagination

**Acceptance Criteria:**
- Search results load within 500ms
- Search supports pagination
- Search queries are cached appropriately
- Database queries are optimized

**Estimate:** 3 days
**Priority:** High" \
    --label "beta-gap,performance,search,api,priority:high" \
    --milestone "Beta Launch"; then
    echo "✅ Created: [HIGH] Search Performance Optimization"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [HIGH] Search Performance Optimization"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "Creating issue 8/14: [MEDIUM] Implement Rich Text Editor for Profiles"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[MEDIUM] Implement Rich Text Editor for Profiles" \
    --body "Profile descriptions and service descriptions need rich text editing capability.

**Tasks:**
- [ ] Evaluate rich text editor libraries
- [ ] Implement editor component
- [ ] Add image upload to editor
- [ ] Sanitize rich text output
- [ ] Add editor to profile and service forms

**Acceptance Criteria:**
- Users can format text with bold, italic, lists
- Safe HTML output prevents XSS attacks
- Image upload works within editor
- Editor is accessible via keyboard

**Estimate:** 4 days
**Priority:** Medium" \
    --label "beta-gap,editor,profiles,priority:medium" \
    --milestone "Beta v1.1"; then
    echo "✅ Created: [MEDIUM] Implement Rich Text Editor for Profiles"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [MEDIUM] Implement Rich Text Editor for Profiles"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "Creating issue 9/14: [POST-MVP] Label Dashboard for Record Labels"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[POST-MVP] Label Dashboard for Record Labels" \
    --body "Advanced dashboard for record labels to manage multiple artists.

**Tasks:**
- [ ] Design label management interface
- [ ] Implement artist roster management
- [ ] Add bulk booking capabilities
- [ ] Create label analytics dashboard
- [ ] Add revenue reporting for labels

**Acceptance Criteria:**
- Labels can manage multiple artist accounts
- Bulk operations for managing artists
- Comprehensive reporting and analytics
- Revenue tracking across all label artists

**Estimate:** 2 weeks
**Priority:** Low" \
    --label "post-mvp,enterprise,dashboard" \
    --milestone "Post-Beta"; then
    echo "✅ Created: [POST-MVP] Label Dashboard for Record Labels"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [POST-MVP] Label Dashboard for Record Labels"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "Creating issue 10/14: [POST-MVP] Advanced Challenge System"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[POST-MVP] Advanced Challenge System" \
    --body "Complex challenge system with rewards and competition.

**Tasks:**
- [ ] Design challenge framework
- [ ] Implement challenge creation tools
- [ ] Add reward system integration
- [ ] Create leaderboard competitions
- [ ] Add social sharing features

**Acceptance Criteria:**
- Admins can create custom challenges
- Users can participate in multiple challenges
- Rewards are automatically distributed
- Fair competition and anti-gaming measures

**Estimate:** 3 weeks
**Priority:** Low" \
    --label "post-mvp,gamification,challenges" \
    --milestone "Post-Beta"; then
    echo "✅ Created: [POST-MVP] Advanced Challenge System"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [POST-MVP] Advanced Challenge System"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "Creating issue 11/14: [POST-MVP] Advanced Analytics Dashboard"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[POST-MVP] Advanced Analytics Dashboard" \
    --body "Comprehensive analytics for creators and platform admins.

**Tasks:**
- [ ] Design analytics data model
- [ ] Implement data collection pipeline
- [ ] Create visualization components
- [ ] Add custom report builder
- [ ] Implement data export features

**Acceptance Criteria:**
- Real-time analytics data
- Customizable dashboard widgets
- Historical data analysis
- Export capabilities (PDF, CSV)

**Estimate:** 4 weeks
**Priority:** Low" \
    --label "post-mvp,analytics,dashboard" \
    --milestone "Post-Beta"; then
    echo "✅ Created: [POST-MVP] Advanced Analytics Dashboard"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [POST-MVP] Advanced Analytics Dashboard"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "Creating issue 12/14: [CRITICAL] Two-Factor Authentication Implementation"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[CRITICAL] Two-Factor Authentication Implementation" \
    --body "Missing two-factor authentication poses security risk for user accounts.

**Tasks:**
- [ ] Implement TOTP-based 2FA
- [ ] Create 2FA setup flow in user settings
- [ ] Add 2FA verification to login process
- [ ] Create backup code system
- [ ] Add 2FA recovery options

**Acceptance Criteria:**
- Users can enable/disable 2FA
- 2FA required for sensitive operations
- Backup codes available for account recovery
- Clear setup instructions and UI

**Estimate:** 5 days
**Priority:** Critical" \
    --label "beta-gap,authentication,security,priority:critical" \
    --milestone "Beta Launch" \
    --assignee "auditoryx"; then
    echo "✅ Created: [CRITICAL] Two-Factor Authentication Implementation"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [CRITICAL] Two-Factor Authentication Implementation"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "Creating issue 13/14: [CRITICAL] Rate Limiting and DDoS Protection"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[CRITICAL] Rate Limiting and DDoS Protection" \
    --body "API endpoints lack rate limiting, making system vulnerable to abuse.

**Tasks:**
- [ ] Implement rate limiting for all API endpoints
- [ ] Add DDoS protection middleware
- [ ] Create monitoring for unusual traffic patterns
- [ ] Add graceful degradation for high load
- [ ] Set up alerts for security events

**Acceptance Criteria:**
- All API endpoints have appropriate rate limits
- Automatic blocking of suspicious traffic
- Performance maintained under high load
- Security alerts trigger appropriately

**Estimate:** 3 days
**Priority:** Critical" \
    --label "beta-gap,security,infrastructure,priority:critical" \
    --milestone "Beta Launch" \
    --assignee "auditoryx"; then
    echo "✅ Created: [CRITICAL] Rate Limiting and DDoS Protection"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [CRITICAL] Rate Limiting and DDoS Protection"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "Creating issue 14/14: [CRITICAL] Data Backup and Recovery System"
if gh issue create \
    --repo "auditoryx/X-Open-Netowrk" \
    --title "[CRITICAL] Data Backup and Recovery System" \
    --body "No automated backup system in place for critical user data.

**Tasks:**
- [ ] Set up automated daily Firestore backups
- [ ] Implement point-in-time recovery
- [ ] Create disaster recovery procedures
- [ ] Test backup restoration process
- [ ] Document recovery procedures

**Acceptance Criteria:**
- Daily automated backups of all data
- Ability to restore data to any point in time
- Tested and documented recovery procedures
- Monitoring of backup success/failure

**Estimate:** 4 days
**Priority:** Critical" \
    --label "beta-gap,database,backup,infrastructure,priority:critical" \
    --milestone "Beta Launch" \
    --assignee "auditoryx"; then
    echo "✅ Created: [CRITICAL] Data Backup and Recovery System"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: [CRITICAL] Data Backup and Recovery System"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""

echo "📊 Issue Creation Summary:"
echo "✅ Successfully created: $CREATED_COUNT issues"
echo "❌ Failed to create: $FAILED_COUNT issues"
echo "📋 Total processed: 14 issues"
echo ""

if [ $FAILED_COUNT -eq 0 ]; then
    echo "🎉 All issues created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Visit your GitHub project board to organize issues"
    echo "2. Review and assign additional team members as needed"
    echo "3. Prioritize and schedule work based on milestones"
    echo ""
    echo "🔗 GitHub Repository: https://github.com/auditoryx/X-Open-Netowrk"
    echo "🔗 Issues: https://github.com/auditoryx/X-Open-Netowrk/issues"
    echo "🔗 Projects: https://github.com/auditoryx/X-Open-Netowrk/projects"
else
    echo "⚠️  Some issues failed to create. Please check the errors above and retry."
    exit 1
fi
