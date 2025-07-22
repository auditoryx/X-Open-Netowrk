#!/usr/bin/env node

/**
 * Beta Issue Creation Script
 * 
 * This script creates all issues specified in docs/beta/ISSUE_GENERATION_GUIDE.md
 * Run with: node scripts/create-beta-issues.js
 * 
 * Prerequisites:
 * - GitHub CLI (gh) must be installed
 * - Must be authenticated with GitHub: gh auth login
 * - Must have write access to the repository
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Repository information
const REPO = 'auditoryx/X-Open-Netowrk';

// Issue templates from the guide
const issues = [
  // CRITICAL BETA-GAP ISSUES
  {
    title: '[CRITICAL] Implement Complete Password Reset Flow',
    priority: 'Critical',
    labels: ['beta-gap', 'authentication', 'security', 'priority:critical'],
    milestone: 'Beta Launch',
    estimate: '3 days',
    assignees: ['auditoryx'],
    body: `Password reset functionality is completely missing, blocking user recovery.

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
**Priority:** Critical`
  },
  
  {
    title: '[CRITICAL] Add Email Verification System',
    priority: 'Critical',
    labels: ['beta-gap', 'authentication', 'email', 'priority:critical'],
    milestone: 'Beta Launch',
    estimate: '3 days',
    assignees: ['auditoryx'],
    body: `User registration lacks email verification, creating security risk.

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
**Priority:** Critical`
  },
  
  {
    title: '[CRITICAL] Robust Payment Error Handling',
    priority: 'Critical',
    labels: ['beta-gap', 'payments', 'stripe', 'priority:critical'],
    milestone: 'Beta Launch',
    estimate: '4 days',
    assignees: ['auditoryx'],
    body: `Payment error handling is incomplete, causing poor user experience.

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
**Priority:** Critical`
  },
  
  {
    title: '[CRITICAL] Comprehensive Database Validation Rules',
    priority: 'Critical',
    labels: ['beta-gap', 'database', 'firestore', 'security', 'priority:critical'],
    milestone: 'Beta Launch',
    estimate: '3 days',
    assignees: ['auditoryx'],
    body: `Firestore security rules need comprehensive audit and validation.

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
**Priority:** Critical`
  },

  // HIGH PRIORITY BETA-GAP ISSUES
  {
    title: '[HIGH] Standardize Loading States Across App',
    priority: 'High',
    labels: ['beta-gap', 'ui-ux', 'components', 'priority:high'],
    milestone: 'Beta Launch',
    estimate: '2 days',
    assignees: [],
    body: `Inconsistent loading indicators create poor user experience.

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
**Priority:** High`
  },

  {
    title: '[HIGH] Mobile Dashboard Responsiveness',
    priority: 'High',
    labels: ['beta-gap', 'mobile', 'responsive', 'dashboard', 'priority:high'],
    milestone: 'Beta Launch',
    estimate: '5 days',
    assignees: [],
    body: `Dashboard is not optimized for mobile devices.

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
**Priority:** High`
  },

  {
    title: '[HIGH] Search Performance Optimization',
    priority: 'High',
    labels: ['beta-gap', 'performance', 'search', 'api', 'priority:high'],
    milestone: 'Beta Launch',
    estimate: '3 days',
    assignees: [],
    body: `Search queries are slow, impacting user experience.

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
**Priority:** High`
  },

  // MEDIUM PRIORITY BETA-GAP ISSUES
  {
    title: '[MEDIUM] Implement Rich Text Editor for Profiles',
    priority: 'Medium',
    labels: ['beta-gap', 'editor', 'profiles', 'priority:medium'],
    milestone: 'Beta v1.1',
    estimate: '4 days',
    assignees: [],
    body: `Profile descriptions and service descriptions need rich text editing capability.

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
**Priority:** Medium`
  },

  // POST-MVP ISSUES
  {
    title: '[POST-MVP] Label Dashboard for Record Labels',
    priority: 'Low',
    labels: ['post-mvp', 'enterprise', 'dashboard'],
    milestone: 'Post-Beta',
    estimate: '2 weeks',
    assignees: [],
    body: `Advanced dashboard for record labels to manage multiple artists.

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
**Priority:** Low`
  },

  {
    title: '[POST-MVP] Advanced Challenge System',
    priority: 'Low',
    labels: ['post-mvp', 'gamification', 'challenges'],
    milestone: 'Post-Beta',
    estimate: '3 weeks',
    assignees: [],
    body: `Complex challenge system with rewards and competition.

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
**Priority:** Low`
  },

  {
    title: '[POST-MVP] Advanced Analytics Dashboard',
    priority: 'Low',
    labels: ['post-mvp', 'analytics', 'dashboard'],
    milestone: 'Post-Beta',
    estimate: '4 weeks',
    assignees: [],
    body: `Comprehensive analytics for creators and platform admins.

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
**Priority:** Low`
  }
];

// Additional Critical Issues (based on common patterns from the guide)
const additionalCriticalIssues = [
  {
    title: '[CRITICAL] Two-Factor Authentication Implementation',
    priority: 'Critical',
    labels: ['beta-gap', 'authentication', 'security', 'priority:critical'],
    milestone: 'Beta Launch',
    estimate: '5 days',
    assignees: ['auditoryx'],
    body: `Missing two-factor authentication poses security risk for user accounts.

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
**Priority:** Critical`
  },

  {
    title: '[CRITICAL] Rate Limiting and DDoS Protection',
    priority: 'Critical',
    labels: ['beta-gap', 'security', 'infrastructure', 'priority:critical'],
    milestone: 'Beta Launch',
    estimate: '3 days',
    assignees: ['auditoryx'],
    body: `API endpoints lack rate limiting, making system vulnerable to abuse.

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
**Priority:** Critical`
  },

  {
    title: '[CRITICAL] Data Backup and Recovery System',
    priority: 'Critical',
    labels: ['beta-gap', 'database', 'backup', 'infrastructure', 'priority:critical'],
    milestone: 'Beta Launch',
    estimate: '4 days',
    assignees: ['auditoryx'],
    body: `No automated backup system in place for critical user data.

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
**Priority:** Critical`
  }
];

// Combine all issues
const allIssues = [...issues, ...additionalCriticalIssues];

function createGitHubIssue(issue) {
  const labelString = issue.labels.join(',');
  const assigneeString = issue.assignees.length > 0 ? issue.assignees.join(',') : '';
  
  let command = `gh issue create \\
    --repo "${REPO}" \\
    --title "${issue.title}" \\
    --body "${issue.body.replace(/"/g, '\\"')}" \\
    --label "${labelString}" \\
    --milestone "${issue.milestone}"`;
  
  if (assigneeString) {
    command += ` \\
    --assignee "${assigneeString}"`;
  }
  
  return command;
}

function createProjectBoard() {
  const projectCommand = `gh project create \\
    --repo "${REPO}" \\
    --title "Beta Launch" \\
    --body "Beta Launch project board for tracking all beta-gap and post-MVP issues"`;
  
  return projectCommand;
}

function generateScript() {
  let script = `#!/bin/bash

# Beta Issue Creation Script
# This script creates all beta-gap and post-MVP issues for the X-Open-Network project

set -e

echo "🚀 Starting Beta Issue Creation..."
echo "Repository: ${REPO}"
echo "Total issues to create: ${allIssues.length}"
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
gh api repos/${REPO}/milestones -f title="Beta Launch" -f description="Critical issues blocking beta launch" -f state="open" || echo "Milestone 'Beta Launch' may already exist"
gh api repos/${REPO}/milestones -f title="Beta v1.1" -f description="Medium priority improvements for beta" -f state="open" || echo "Milestone 'Beta v1.1' may already exist"
gh api repos/${REPO}/milestones -f title="Post-Beta" -f description="Post-MVP features and enhancements" -f state="open" || echo "Milestone 'Post-Beta' may already exist"

echo "✅ Milestones created"
echo ""

# Create project board
echo "📋 Creating Beta Launch project board..."
PROJECT_CREATION_OUTPUT=$(${createProjectBoard()} 2>&1 || echo "Project board may already exist")
echo "$PROJECT_CREATION_OUTPUT"
echo ""

# Create issues
echo "🎯 Creating issues..."
CREATED_COUNT=0
FAILED_COUNT=0

`;

  allIssues.forEach((issue, index) => {
    script += `
echo "Creating issue ${index + 1}/${allIssues.length}: ${issue.title}"
if ${createGitHubIssue(issue)}; then
    echo "✅ Created: ${issue.title}"
    CREATED_COUNT=$((CREATED_COUNT + 1))
else
    echo "❌ Failed: ${issue.title}"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""
`;
  });

  script += `
echo "📊 Issue Creation Summary:"
echo "✅ Successfully created: $CREATED_COUNT issues"
echo "❌ Failed to create: $FAILED_COUNT issues"
echo "📋 Total processed: ${allIssues.length} issues"
echo ""

if [ $FAILED_COUNT -eq 0 ]; then
    echo "🎉 All issues created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Visit your GitHub project board to organize issues"
    echo "2. Review and assign additional team members as needed"
    echo "3. Prioritize and schedule work based on milestones"
    echo ""
    echo "🔗 GitHub Repository: https://github.com/${REPO}"
    echo "🔗 Issues: https://github.com/${REPO}/issues"
    echo "🔗 Projects: https://github.com/${REPO}/projects"
else
    echo "⚠️  Some issues failed to create. Please check the errors above and retry."
    exit 1
fi
`;

  return script;
}

function main() {
  console.log('🎯 Beta Issue Creation Script Generator');
  console.log('=====================================');
  console.log('');
  
  console.log(`📊 Issue Summary:`);
  console.log(`   Critical issues: ${allIssues.filter(i => i.labels.includes('priority:critical')).length}`);
  console.log(`   High priority: ${allIssues.filter(i => i.labels.includes('priority:high')).length}`);
  console.log(`   Medium priority: ${allIssues.filter(i => i.labels.includes('priority:medium')).length}`);
  console.log(`   Post-MVP: ${allIssues.filter(i => i.labels.includes('post-mvp')).length}`);
  console.log(`   Total issues: ${allIssues.length}`);
  console.log('');
  
  // Generate the bash script
  const scriptContent = generateScript();
  const scriptPath = path.join(__dirname, 'create-beta-issues.sh');
  
  fs.writeFileSync(scriptPath, scriptContent);
  fs.chmodSync(scriptPath, 0o755);
  
  console.log(`✅ Generated executable script: ${scriptPath}`);
  console.log('');
  console.log('🚀 To run the script:');
  console.log(`   cd ${path.dirname(scriptPath)}`);
  console.log('   ./create-beta-issues.sh');
  console.log('');
  console.log('📋 Prerequisites:');
  console.log('   1. Install GitHub CLI: https://cli.github.com/');
  console.log('   2. Authenticate: gh auth login');
  console.log('   3. Ensure write access to repository');
  console.log('');
  
  // Also generate a JSON file with all issues for reference
  const issuesJsonPath = path.join(__dirname, 'beta-issues.json');
  fs.writeFileSync(issuesJsonPath, JSON.stringify(allIssues, null, 2));
  console.log(`📄 Issue data saved to: ${issuesJsonPath}`);
  
  console.log('');
  console.log('🎉 Ready to create issues!');
}

if (require.main === module) {
  main();
}

module.exports = { issues: allIssues, createGitHubIssue, createProjectBoard };