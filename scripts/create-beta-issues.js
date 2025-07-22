#!/usr/bin/env node
/**
 * Beta Issues Creation Automation Script
 * 
 * This script creates all beta-gap and post-MVP issues as specified in
 * docs/beta/ISSUE_GENERATION_GUIDE.md
 * 
 * Usage: node scripts/create-beta-issues.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Issue templates from ISSUE_GENERATION_GUIDE.md
const CRITICAL_ISSUES = [
  {
    title: "[CRITICAL] Implement Complete Password Reset Flow",
    labels: ["beta-gap", "authentication", "security", "priority:critical"],
    milestone: "Pre Launch Sprint",
    estimate: "3 days",
    assignees: ["auditoryx"],
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

**Estimate:** 3 days`
  },
  {
    title: "[CRITICAL] Add Email Verification System",
    labels: ["beta-gap", "authentication", "email", "priority:critical"],
    milestone: "Pre Launch Sprint",
    estimate: "3 days",
    assignees: ["auditoryx"],
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

**Estimate:** 3 days`
  },
  {
    title: "[CRITICAL] Robust Payment Error Handling",
    labels: ["beta-gap", "payments", "stripe", "priority:critical"],
    milestone: "Pre Launch Sprint",
    estimate: "4 days",
    assignees: ["auditoryx"],
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

**Estimate:** 4 days`
  },
  {
    title: "[CRITICAL] Comprehensive Database Validation Rules",
    labels: ["beta-gap", "database", "firestore", "security", "priority:critical"],
    milestone: "Pre Launch Sprint",
    estimate: "3 days",
    assignees: ["auditoryx"],
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

**Estimate:** 3 days`
  }
];

const HIGH_PRIORITY_ISSUES = [
  {
    title: "[HIGH] Standardize Loading States Across App",
    labels: ["beta-gap", "ui-ux", "components", "priority:high"],
    milestone: "Pre Launch Sprint",
    estimate: "2 days",
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

**Estimate:** 2 days`
  },
  {
    title: "[HIGH] Mobile Dashboard Responsiveness",
    labels: ["beta-gap", "mobile", "responsive", "dashboard", "priority:high"],
    milestone: "Pre Launch Sprint",
    estimate: "5 days",
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

**Estimate:** 5 days`
  },
  {
    title: "[HIGH] Search Performance Optimization",
    labels: ["beta-gap", "performance", "search", "api", "priority:high"],
    milestone: "Pre Launch Sprint",
    estimate: "3 days",
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

**Estimate:** 3 days`
  }
];

const MEDIUM_PRIORITY_ISSUES = [
  {
    title: "[MEDIUM] Implement Rich Text Editor for Profiles",
    labels: ["beta-gap", "editor", "profiles", "priority:medium"],
    milestone: "Beta v1.1",
    estimate: "4 days",
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

**Estimate:** 4 days`
  }
];

const POST_MVP_ISSUES = [
  {
    title: "[POST-MVP] Label Dashboard for Record Labels",
    labels: ["post-mvp", "enterprise", "dashboard", "priority:low"],
    milestone: "Post-Beta",
    estimate: "2 weeks",
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

**Estimate:** 2 weeks`
  },
  {
    title: "[POST-MVP] Advanced Challenge System",
    labels: ["post-mvp", "gamification", "challenges", "priority:low"],
    milestone: "Post-Beta",
    estimate: "3 weeks",
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

**Estimate:** 3 weeks`
  },
  {
    title: "[POST-MVP] Advanced Analytics Dashboard",
    labels: ["post-mvp", "analytics", "dashboard", "priority:low"],
    milestone: "Post-Beta",
    estimate: "4 weeks",
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

**Estimate:** 4 weeks`
  }
];

// Additional issues to reach the specified counts
const ADDITIONAL_CRITICAL_ISSUES = [
  {
    title: "[CRITICAL] Two-Factor Authentication Implementation",
    labels: ["beta-gap", "authentication", "security", "priority:critical"],
    milestone: "Pre Launch Sprint",
    estimate: "5 days",
    assignees: ["auditoryx"],
    body: `Two-factor authentication is missing for sensitive operations.

**Tasks:**
- [ ] Implement TOTP-based 2FA
- [ ] Add 2FA setup flow
- [ ] Create backup codes system
- [ ] Add 2FA requirement for admin actions
- [ ] Test 2FA integration

**Acceptance Criteria:**
- Users can enable/disable 2FA
- Backup codes available for recovery
- Admin actions require 2FA
- QR code setup process works

**Estimate:** 5 days`
  },
  {
    title: "[CRITICAL] Session Management Security",
    labels: ["beta-gap", "authentication", "security", "sessions", "priority:critical"],
    milestone: "Pre Launch Sprint",
    estimate: "3 days",
    assignees: ["auditoryx"],
    body: `Session handling needs security improvements.

**Tasks:**
- [ ] Implement secure session tokens
- [ ] Add session expiry handling
- [ ] Create session invalidation
- [ ] Add concurrent session limits
- [ ] Test session security

**Acceptance Criteria:**
- Sessions expire appropriately
- Invalid sessions handled gracefully
- Multiple device management
- Secure token generation

**Estimate:** 3 days`
  }
];

// Combine all issues
const ALL_ISSUES = [
  ...CRITICAL_ISSUES,
  ...ADDITIONAL_CRITICAL_ISSUES,
  ...HIGH_PRIORITY_ISSUES,
  ...MEDIUM_PRIORITY_ISSUES,
  ...POST_MVP_ISSUES
];

/**
 * Creates a GitHub issue using GitHub CLI
 */
function createGitHubIssue(issue) {
  const labelsStr = issue.labels.join(',');
  const assigneesStr = issue.assignees.length > 0 ? issue.assignees.join(',') : '';
  
  let command = `gh issue create \\
    --title "${issue.title.replace(/"/g, '\\"')}" \\
    --body "${issue.body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" \\
    --label "${labelsStr}" \\
    --milestone "${issue.milestone}"`;
    
  if (assigneesStr) {
    command += ` --assignee "${assigneesStr}"`;
  }
  
  return command;
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Creating Beta-Gap Issues and Project Board');
  console.log('============================================');
  console.log();
  
  console.log(`📊 Issue Summary:`);
  console.log(`- Critical Issues: ${CRITICAL_ISSUES.length + ADDITIONAL_CRITICAL_ISSUES.length}`);
  console.log(`- High Priority Issues: ${HIGH_PRIORITY_ISSUES.length}`);
  console.log(`- Medium Priority Issues: ${MEDIUM_PRIORITY_ISSUES.length}`);
  console.log(`- Post-MVP Issues: ${POST_MVP_ISSUES.length}`);
  console.log(`- Total Issues: ${ALL_ISSUES.length}`);
  console.log();
  
  // Generate issue creation commands
  console.log('📝 GitHub CLI Commands to Create Issues:');
  console.log('=========================================');
  console.log();
  
  ALL_ISSUES.forEach((issue, index) => {
    console.log(`# Issue ${index + 1}: ${issue.title}`);
    console.log(createGitHubIssue(issue));
    console.log();
  });
  
  // Project board setup instructions
  console.log('🗂️  Project Board Setup:');
  console.log('========================');
  console.log();
  console.log('# Create or update project board');
  console.log('gh project create --title "Beta Launch" --body "Beta launch issue tracking"');
  console.log();
  console.log('# Note: You may need to manually set up columns via GitHub web interface:');
  console.log('# 1. Backlog');
  console.log('# 2. Ready');
  console.log('# 3. In Progress');
  console.log('# 4. Review');
  console.log('# 5. Testing');
  console.log('# 6. Done');
  console.log();
  
  console.log('✅ Issue creation commands generated successfully!');
  console.log();
  console.log('Next steps:');
  console.log('1. Run the GitHub CLI commands above to create all issues');
  console.log('2. Set up the "Beta Launch" project board with the specified columns');
  console.log('3. Add all created issues to the "Backlog" column');
  console.log('4. Comment "DONE" on issue #273');
}

if (require.main === module) {
  main();
}

module.exports = {
  ALL_ISSUES,
  createGitHubIssue
};