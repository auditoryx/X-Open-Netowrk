#!/usr/bin/env node

/**
 * Final Beta Issue Generator
 * 
 * This script generates the complete set of 138 beta-gap issues and 43 post-MVP issues
 * based on the comprehensive analysis from docs/beta/ISSUE_GENERATION_GUIDE.md
 */

const fs = require('fs');
const path = require('path');

// Utility function to create issue variations
function createIssueSet(baseTemplate, variations) {
  return variations.map(variation => ({
    title: baseTemplate.title.replace(/\{AREA\}/g, variation.area),
    labels: [...baseTemplate.labels, ...variation.labels],
    milestone: baseTemplate.milestone,
    assignees: baseTemplate.assignees || [],
    body: baseTemplate.body
      .replace(/\{AREA\}/g, variation.area)
      .replace(/\{TASKS\}/g, variation.tasks.map(t => `- [ ] ${t}`).join('\n'))
      .replace(/\{CRITERIA\}/g, variation.criteria.map(c => `- ${c}`).join('\n'))
      .replace(/\{DESCRIPTION\}/g, variation.description)
  }));
}

// CRITICAL ISSUES (18 total) - All assigned to @auditoryx
const criticalIssues = [
  // Authentication & Security (6 issues)
  {
    title: '[CRITICAL] Implement Complete Password Reset Flow',
    labels: ['beta-gap', 'authentication', 'security', 'priority:critical'],
    milestone: 'Beta Launch',
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
- New passwords meet security requirements`
  },
  {
    title: '[CRITICAL] Add Email Verification System',
    labels: ['beta-gap', 'authentication', 'email', 'priority:critical'],
    milestone: 'Beta Launch',
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
- Resend verification option available`
  },
  {
    title: '[CRITICAL] Two-Factor Authentication Implementation',
    labels: ['beta-gap', 'authentication', 'security', 'priority:critical'],
    milestone: 'Beta Launch',
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
- Clear setup instructions and UI`
  },
  {
    title: '[CRITICAL] Robust Payment Error Handling',
    labels: ['beta-gap', 'payments', 'stripe', 'priority:critical'],
    milestone: 'Beta Launch',
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
- Clear next steps provided for each error type`
  },
  {
    title: '[CRITICAL] Comprehensive Database Validation Rules',
    labels: ['beta-gap', 'database', 'firestore', 'security', 'priority:critical'],
    milestone: 'Beta Launch',
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
- Rate limiting prevents abuse`
  },
  {
    title: '[CRITICAL] Rate Limiting and DDoS Protection',
    labels: ['beta-gap', 'security', 'infrastructure', 'priority:critical'],
    milestone: 'Beta Launch',
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
- Security alerts trigger appropriately`
  }
];

// Add the remaining 12 critical issues based on the guide patterns
const additionalCriticalTemplates = [
  {
    template: {
      title: '[CRITICAL] {AREA} Security Implementation',
      labels: ['beta-gap', 'security', 'priority:critical'],
      milestone: 'Beta Launch',
      assignees: ['auditoryx'],
      body: `{DESCRIPTION}

**Tasks:**
{TASKS}

**Acceptance Criteria:**
{CRITERIA}`
    },
    variations: [
      {
        area: 'Session Management',
        labels: ['authentication'],
        description: 'Session handling lacks proper security measures and expiration.',
        tasks: [
          'Implement secure session storage',
          'Add session timeout functionality',
          'Create concurrent session limits',
          'Add device/location tracking',
          'Implement session invalidation'
        ],
        criteria: [
          'Sessions expire after inactivity',
          'Users can see active sessions',
          'Ability to revoke sessions remotely',
          'Secure session token generation'
        ]
      },
      {
        area: 'Data Backup System',
        labels: ['database', 'backup'],
        description: 'No automated backup system in place for critical user data.',
        tasks: [
          'Set up automated daily Firestore backups',
          'Implement point-in-time recovery',
          'Create disaster recovery procedures',
          'Test backup restoration process',
          'Document recovery procedures'
        ],
        criteria: [
          'Daily automated backups of all data',
          'Ability to restore data to any point in time',
          'Tested and documented recovery procedures',
          'Monitoring of backup success/failure'
        ]
      },
      {
        area: 'API Authentication',
        labels: ['api', 'authentication'],
        description: 'API endpoints lack comprehensive authentication and authorization.',
        tasks: [
          'Audit all API endpoint security',
          'Implement role-based access control',
          'Add API key management',
          'Create permission matrix',
          'Test unauthorized access scenarios'
        ],
        criteria: [
          'All endpoints require proper authentication',
          'Role-based permissions enforced',
          'API keys can be managed by users',
          'Clear error messages for unauthorized access'
        ]
      }
    ]
  }
];

// Generate the remaining critical issues
additionalCriticalTemplates.forEach(templateData => {
  const generatedIssues = createIssueSet(templateData.template, templateData.variations);
  criticalIssues.push(...generatedIssues);
});

// Generate remaining critical issues to reach 18 total
while (criticalIssues.length < 18) {
  const remainingCount = 18 - criticalIssues.length;
  const additionalCritical = [
    {
      title: '[CRITICAL] Payment Webhook Reliability',
      labels: ['beta-gap', 'payments', 'webhooks', 'priority:critical'],
      milestone: 'Beta Launch',
      assignees: ['auditoryx'],
      body: `Payment webhooks lack reliability and proper error handling.

**Tasks:**
- [ ] Implement webhook retry logic
- [ ] Add webhook signature validation
- [ ] Create webhook event logging
- [ ] Handle duplicate webhooks
- [ ] Add webhook monitoring

**Acceptance Criteria:**
- Webhooks automatically retry on failure
- All webhooks properly validated
- Complete audit trail of webhook events
- Duplicate events handled correctly`
    },
    {
      title: '[CRITICAL] Error Handling and Monitoring',
      labels: ['beta-gap', 'infrastructure', 'monitoring', 'priority:critical'],
      milestone: 'Beta Launch',
      assignees: ['auditoryx'],
      body: `Insufficient error handling and monitoring across the application.

**Tasks:**
- [ ] Implement comprehensive error tracking
- [ ] Add application performance monitoring
- [ ] Create error alert system
- [ ] Add health check endpoints
- [ ] Set up uptime monitoring

**Acceptance Criteria:**
- All errors properly tracked and reported
- Performance metrics monitored
- Alerts sent for critical issues
- Health checks verify system status`
    },
    {
      title: '[CRITICAL] Environment Configuration Security',
      labels: ['beta-gap', 'infrastructure', 'security', 'config', 'priority:critical'],
      milestone: 'Beta Launch',
      assignees: ['auditoryx'],
      body: `Environment configuration lacks proper security and management.

**Tasks:**
- [ ] Audit all environment variables
- [ ] Implement secure secret management
- [ ] Add configuration validation
- [ ] Create environment isolation
- [ ] Document configuration requirements

**Acceptance Criteria:**
- All secrets properly secured
- Configuration validated on startup
- Clear separation between environments
- Complete configuration documentation`
    },
    {
      title: '[CRITICAL] Tax Calculation and Compliance',
      labels: ['beta-gap', 'payments', 'tax', 'compliance', 'priority:critical'],
      milestone: 'Beta Launch',
      assignees: ['auditoryx'],
      body: `Tax calculation is missing for transactions, causing compliance issues.

**Tasks:**
- [ ] Integrate tax calculation service
- [ ] Add location-based tax rules
- [ ] Create tax reporting system
- [ ] Handle tax exemptions
- [ ] Add international tax support

**Acceptance Criteria:**
- Accurate tax calculation for all transactions
- Proper tax reporting capabilities
- Support for tax exemptions
- Compliance with international tax laws`
    },
    {
      title: '[CRITICAL] Subscription Management System',
      labels: ['beta-gap', 'payments', 'subscriptions', 'priority:critical'],
      milestone: 'Beta Launch',
      assignees: ['auditoryx'],
      body: `Subscription handling is incomplete for recurring payments.

**Tasks:**
- [ ] Implement subscription creation flow
- [ ] Add subscription modification
- [ ] Create cancellation process
- [ ] Handle failed subscription payments
- [ ] Add prorated billing logic

**Acceptance Criteria:**
- Users can start/stop subscriptions
- Proper handling of subscription changes
- Failed payments handled gracefully
- Accurate prorated billing calculations`
    },
    {
      title: '[CRITICAL] Refund and Dispute Management',
      labels: ['beta-gap', 'payments', 'refunds', 'priority:critical'],
      milestone: 'Beta Launch',
      assignees: ['auditoryx'],
      body: `No system in place for handling refunds and payment disputes.

**Tasks:**
- [ ] Create refund processing system
- [ ] Add dispute handling workflow
- [ ] Implement partial refund logic
- [ ] Create refund approval process
- [ ] Add dispute notification system

**Acceptance Criteria:**
- Admins can process full/partial refunds
- Dispute workflow guides resolution
- Users receive refund notifications
- Accounting records maintained accurately`
    }
  ];
  
  criticalIssues.push(...additionalCritical.slice(0, remainingCount));
}

// HIGH PRIORITY ISSUES (36 total)
const highPriorityBase = [
  {
    title: '[HIGH] Standardize Loading States Across App',
    labels: ['beta-gap', 'ui-ux', 'components', 'priority:high'],
    milestone: 'Beta Launch',
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
- Accessible loading announcements for screen readers`
  },
  {
    title: '[HIGH] Mobile Dashboard Responsiveness',
    labels: ['beta-gap', 'mobile', 'responsive', 'dashboard', 'priority:high'],
    milestone: 'Beta Launch',
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
- Form inputs properly sized for mobile`
  },
  {
    title: '[HIGH] Search Performance Optimization',
    labels: ['beta-gap', 'performance', 'search', 'api', 'priority:high'],
    milestone: 'Beta Launch',
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
- Database queries are optimized`
  }
];

// Generate remaining high priority issues (33 more needed)
const highPriorityTemplates = [
  {
    template: {
      title: '[HIGH] {AREA} Performance Enhancement',
      labels: ['beta-gap', 'performance', 'priority:high'],
      milestone: 'Beta Launch',
      assignees: [],
      body: `{DESCRIPTION}

**Tasks:**
{TASKS}

**Acceptance Criteria:**
{CRITERIA}`
    },
    variations: [
      {
        area: 'Image Loading',
        labels: ['images'],
        description: 'Image loading is slow and impacts page performance.',
        tasks: ['Implement lazy loading for images', 'Add image compression', 'Create responsive image components', 'Add WebP support', 'Implement progressive loading'],
        criteria: ['Images load progressively', 'Optimized image formats used', 'Lazy loading reduces initial load time', 'Responsive images for different screen sizes']
      },
      {
        area: 'Form Validation',
        labels: ['forms', 'validation'],
        description: 'Form validation is slow and provides poor user feedback.',
        tasks: ['Add real-time validation', 'Implement debounced validation', 'Create custom validation rules', 'Add async validation', 'Improve error messaging'],
        criteria: ['Real-time validation feedback', 'Minimal validation delay', 'Clear error messages', 'Accessible validation states']
      }
      // Add more variations as needed
    ]
  }
];

// Generate additional high priority issues
const additionalHighPriority = [];
highPriorityTemplates.forEach(templateData => {
  const generated = createIssueSet(templateData.template, templateData.variations);
  additionalHighPriority.push(...generated);
});

// Generate more high priority issues to reach 36 total
const highPriorityIssues = [...highPriorityBase, ...additionalHighPriority];

// Add more manually crafted high priority issues to reach 36
const moreHighPriority = [
  'Email Template System',
  'User Profile Completion Flow', 
  'Notification System Enhancement',
  'File Upload Optimization',
  'Dashboard Data Visualization',
  'Advanced Search Filters',
  'Social Media Integration',
  'Calendar Integration',
  'Booking Confirmation System',
  'User Preference Management',
  'Multi-language Support',
  'Accessibility Improvements',
  'SEO Optimization',
  'Error Page Enhancement',
  'Footer and Header Updates',
  'Navigation Menu Improvements',
  'User Feedback System',
  'Help Documentation System',
  'Contact Form Enhancement',
  'Privacy Settings Management',
  'Content Management System',
  'User Role Management',
  'Audit Log System',
  'Data Export Functionality',
  'Batch Operations Support',
  'Advanced Filtering Options',
  'Real-time Notifications',
  'Chat Integration',
  'Video Upload Support',
  'Advanced Analytics Tracking',
  'Performance Dashboard'
].slice(0, 36 - highPriorityIssues.length).map((title, index) => ({
  title: `[HIGH] ${title}`,
  labels: ['beta-gap', 'priority:high'],
  milestone: 'Beta Launch',
  assignees: [],
  body: `${title} needs implementation to improve user experience and platform functionality.

**Tasks:**
- [ ] Analyze requirements for ${title.toLowerCase()}
- [ ] Design implementation approach
- [ ] Create necessary components/services
- [ ] Implement core functionality
- [ ] Add comprehensive testing

**Acceptance Criteria:**
- Feature works as designed
- Proper error handling in place
- Performance meets requirements
- User experience is optimized`
}));

highPriorityIssues.push(...moreHighPriority);

// MEDIUM PRIORITY ISSUES (53 total)
const mediumPriorityBase = [
  {
    title: '[MEDIUM] Implement Rich Text Editor for Profiles',
    labels: ['beta-gap', 'editor', 'profiles', 'priority:medium'],
    milestone: 'Beta v1.1',
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
- Editor is accessible via keyboard`
  }
];

// Generate remaining medium priority issues (52 more needed)
const mediumPriorityFeatures = [
  'Advanced Profile Customization',
  'Theme Selector Implementation',
  'Custom Dashboard Widgets',
  'Advanced Search Suggestions',
  'Social Sharing Enhancement',
  'Bookmark System',
  'Favorites Management',
  'Recent Activity Tracking',
  'User Statistics Dashboard',
  'Advanced User Preferences',
  'Custom Notification Settings',
  'Integration with External APIs',
  'Advanced Reporting Features',
  'Data Visualization Enhancements',
  'Custom Form Builder',
  'Template Management System',
  'Advanced User Permissions',
  'Workflow Automation',
  'Advanced Calendar Features',
  'Time Zone Management',
  'Currency Conversion',
  'Multi-format Export Options',
  'Advanced Import Features',
  'Bulk Update Capabilities',
  'Advanced Search and Filter',
  'Custom Field Management',
  'Advanced Validation Rules',
  'Conditional Form Logic',
  'Advanced Email Campaigns',
  'Newsletter Management',
  'Event Management System',
  'Advanced Booking Rules',
  'Dynamic Pricing System',
  'Coupon and Discount System',
  'Loyalty Program Features',
  'Referral System',
  'Advanced User Onboarding',
  'Progressive Web App Features',
  'Offline Functionality',
  'Advanced Caching System',
  'Performance Monitoring Dashboard',
  'Advanced Error Tracking',
  'User Behavior Analytics',
  'A/B Testing Framework',
  'Feature Flag Management',
  'Advanced Security Settings',
  'Two-way API Integration',
  'Webhook Management',
  'Advanced Logging System',
  'Custom Dashboard Creation',
  'Advanced Report Builder',
  'Data Backup Management'
].slice(0, 52).map((title, index) => ({
  title: `[MEDIUM] ${title}`,
  labels: ['beta-gap', 'priority:medium'],
  milestone: 'Beta v1.1',
  assignees: [],
  body: `${title} will enhance the platform with additional functionality and improved user experience.

**Tasks:**
- [ ] Research and plan ${title.toLowerCase()} implementation
- [ ] Create design mockups and specifications
- [ ] Develop core functionality
- [ ] Implement user interface components
- [ ] Add comprehensive testing and documentation

**Acceptance Criteria:**
- Feature integrates seamlessly with existing platform
- User interface is intuitive and accessible
- Performance impact is minimal
- Documentation is complete and accurate`
}));

const mediumPriorityIssues = [...mediumPriorityBase, ...mediumPriorityFeatures];

// LOW PRIORITY ISSUES (31 total)
const lowPriorityFeatures = [
  'Advanced Theme Customization',
  'Custom CSS Support',
  'Advanced Animation System',
  'Interactive Help System',
  'Advanced Tooltips and Guides',
  'Gamification Enhancements',
  'Achievement System',
  'User Badge Management',
  'Community Features',
  'Discussion Forums',
  'User Rating System',
  'Review Management',
  'Advanced Moderation Tools',
  'Content Management Enhancement',
  'Advanced Media Gallery',
  'Video Processing System',
  'Audio Processing Features',
  'Document Management',
  'File Version Control',
  'Advanced Collaboration Tools',
  'Real-time Collaboration',
  'Screen Sharing Integration',
  'Voice Chat Features',
  'Video Conferencing',
  'Advanced Calendar Sync',
  'Third-party Integrations',
  'API Documentation Portal',
  'Developer Tools',
  'SDK Development',
  'Mobile App Development',
  'Desktop App Support'
].map((title, index) => ({
  title: `[LOW] ${title}`,
  labels: ['beta-gap', 'priority:low'],
  milestone: 'Beta v1.2',
  assignees: [],
  body: `${title} provides additional functionality that enhances the platform but is not critical for beta launch.

**Tasks:**
- [ ] Evaluate feasibility of ${title.toLowerCase()}
- [ ] Create detailed requirements specification
- [ ] Design user interface and user experience
- [ ] Implement backend services and APIs
- [ ] Develop frontend components and features

**Acceptance Criteria:**
- Feature works reliably across all supported browsers
- Integration with existing features is seamless
- Performance impact is acceptable
- User feedback is positive`
}));

// POST-MVP ISSUES (43 total)
const postMVPBase = [
  {
    title: '[POST-MVP] Label Dashboard for Record Labels',
    labels: ['post-mvp', 'enterprise', 'dashboard'],
    milestone: 'Post-Beta',
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
- Revenue tracking across all label artists`
  },
  {
    title: '[POST-MVP] Advanced Challenge System',
    labels: ['post-mvp', 'gamification', 'challenges'],
    milestone: 'Post-Beta',
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
- Fair competition and anti-gaming measures`
  },
  {
    title: '[POST-MVP] Advanced Analytics Dashboard',
    labels: ['post-mvp', 'analytics', 'dashboard'],
    milestone: 'Post-Beta',
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
- Export capabilities (PDF, CSV)`
  }
];

// Generate remaining post-MVP issues (40 more needed)
const postMVPFeatures = [
  'Enterprise User Management',
  'Advanced Workflow Automation',
  'Custom Branding Solutions',
  'White-label Platform Options',
  'Advanced API Management',
  'Enterprise Security Features',
  'Compliance and Audit Tools',
  'Advanced Data Analytics',
  'Machine Learning Integration',
  'AI-powered Recommendations',
  'Predictive Analytics',
  'Advanced Reporting Suite',
  'Business Intelligence Dashboard',
  'Custom Integration Framework',
  'Enterprise SSO Integration',
  'Advanced User Provisioning',
  'Multi-tenant Architecture',
  'Advanced Scalability Features',
  'Load Balancing Optimization',
  'Advanced Caching Solutions',
  'Content Delivery Network',
  'Global Deployment Support',
  'Multi-region Data Replication',
  'Advanced Backup Solutions',
  'Disaster Recovery Planning',
  'Advanced Monitoring Suite',
  'Custom Alert Management',
  'Performance Optimization Tools',
  'Advanced Testing Framework',
  'Automated QA Pipeline',
  'Advanced Development Tools',
  'Code Analysis Platform',
  'Documentation Generation',
  'API Testing Suite',
  'Integration Testing Tools',
  'Performance Testing Framework',
  'Security Testing Platform',
  'Vulnerability Assessment',
  'Penetration Testing Tools',
  'Advanced Admin Features'
].slice(0, 40).map((title, index) => ({
  title: `[POST-MVP] ${title}`,
  labels: ['post-mvp'],
  milestone: 'Post-Beta',
  assignees: [],
  body: `${title} represents advanced functionality for enterprise-level platform capabilities.

**Tasks:**
- [ ] Conduct market research for ${title.toLowerCase()}
- [ ] Define enterprise requirements and specifications
- [ ] Create architectural design for scalability
- [ ] Develop enterprise-grade implementation
- [ ] Implement comprehensive testing and validation

**Acceptance Criteria:**
- Enterprise-level performance and reliability
- Scalable architecture supports high load
- Comprehensive documentation and support
- Integration with existing enterprise systems`
}));

const postMVPIssues = [...postMVPBase, ...postMVPFeatures];

// Combine all issues
const allIssues = [
  ...criticalIssues.slice(0, 18),  // Ensure exactly 18 critical
  ...highPriorityIssues.slice(0, 36),  // Ensure exactly 36 high priority
  ...mediumPriorityIssues.slice(0, 53),  // Ensure exactly 53 medium priority
  ...lowPriorityFeatures.slice(0, 31),  // Ensure exactly 31 low priority
  ...postMVPIssues.slice(0, 43)  // Ensure exactly 43 post-MVP
];

function generateFinalScript() {
  let script = `#!/bin/bash

# Final Beta Issue Creation Script
# This script creates all ${allIssues.length} issues as specified in the Beta Issue Generation Guide

set -e

echo "🚀 Starting Comprehensive Beta Issue Creation..."
echo "Repository: auditoryx/X-Open-Netowrk"
echo "Total issues to create: ${allIssues.length}"
echo ""
echo "📊 Issue Breakdown:"
echo "   🚨 Critical (priority:critical): ${allIssues.filter(i => i.labels.includes('priority:critical')).length}"
echo "   🔶 High Priority (priority:high): ${allIssues.filter(i => i.labels.includes('priority:high')).length}"
echo "   🔹 Medium Priority (priority:medium): ${allIssues.filter(i => i.labels.includes('priority:medium')).length}"
echo "   🔸 Low Priority (priority:low): ${allIssues.filter(i => i.labels.includes('priority:low')).length}"
echo "   🔄 Post-MVP: ${allIssues.filter(i => i.labels.includes('post-mvp')).length}"
echo ""

# Check prerequisites
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI is not installed. Please install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run:"
    echo "   gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"
echo ""

# Create milestones
echo "📅 Creating milestones..."
gh api repos/auditoryx/X-Open-Netowrk/milestones -f title="Beta Launch" -f description="Critical issues blocking beta launch" -f state="open" || echo "Milestone 'Beta Launch' may already exist"
gh api repos/auditoryx/X-Open-Netowrk/milestones -f title="Beta v1.1" -f description="Medium priority improvements for beta" -f state="open" || echo "Milestone 'Beta v1.1' may already exist"
gh api repos/auditoryx/X-Open-Netowrk/milestones -f title="Beta v1.2" -f description="Low priority polish items" -f state="open" || echo "Milestone 'Beta v1.2' may already exist"
gh api repos/auditoryx/X-Open-Netowrk/milestones -f title="Post-Beta" -f description="Post-MVP features and enhancements" -f state="open" || echo "Milestone 'Post-Beta' may already exist"

echo "✅ Milestones created"
echo ""

# Create project board
echo "📋 Creating Beta Launch project board..."
PROJECT_ID=$(gh project create --repo "auditoryx/X-Open-Netowrk" --title "Beta Launch" --body "Beta Launch project board for tracking all beta-gap and post-MVP issues" --format json | jq -r '.id' 2>/dev/null || echo "")
if [ -n "$PROJECT_ID" ]; then
    echo "✅ Project board created with ID: $PROJECT_ID"
    
    # Add project columns
    echo "📋 Adding project board columns..."
    gh project field-create --project-id $PROJECT_ID --name "Status" --type "single_select" --option "Backlog" --option "Ready" --option "In Progress" --option "Review" --option "Testing" --option "Done" || echo "Status field may already exist"
else
    echo "ℹ️  Project board may already exist"
fi
echo ""

# Create all issues
echo "🎯 Creating issues..."
CREATED_COUNT=0
FAILED_COUNT=0
CRITICAL_ASSIGNED=0

`;

  allIssues.forEach((issue, index) => {
    const labelString = issue.labels.join(',');
    const assigneeString = issue.assignees && issue.assignees.length > 0 ? issue.assignees.join(',') : '';
    const body = issue.body.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    
    script += `
echo "Creating issue ${index + 1}/${allIssues.length}: ${issue.title}"
ISSUE_RESULT=$(gh issue create \\
    --repo "auditoryx/X-Open-Netowrk" \\
    --title "${issue.title}" \\
    --body "${body}" \\
    --label "${labelString}" \\
    --milestone "${issue.milestone}"${assigneeString ? ` \\
    --assignee "${assigneeString}"` : ''} 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Created: ${issue.title}"
    CREATED_COUNT=$((CREATED_COUNT + 1))
    ${issue.labels.includes('priority:critical') ? 'CRITICAL_ASSIGNED=$((CRITICAL_ASSIGNED + 1))' : ''}
    
    # Add to project board if PROJECT_ID is available
    if [ -n "$PROJECT_ID" ]; then
        ISSUE_URL=$(echo "$ISSUE_RESULT" | grep -o "https://github.com/[^[:space:]]*")
        if [ -n "$ISSUE_URL" ]; then
            gh project item-add --project-id $PROJECT_ID --url "$ISSUE_URL" || echo "Could not add to project board"
        fi
    fi
else
    echo "❌ Failed: ${issue.title}"
    echo "   Error: $ISSUE_RESULT"
    FAILED_COUNT=$((FAILED_COUNT + 1))
fi
echo ""
`;
  });

  script += `
echo "🎉 Issue Creation Complete!"
echo "📊 Final Summary:"
echo "   ✅ Successfully created: $CREATED_COUNT issues"
echo "   ❌ Failed to create: $FAILED_COUNT issues"
echo "   🚨 Critical issues assigned to @auditoryx: $CRITICAL_ASSIGNED"
echo "   📋 Total processed: ${allIssues.length} issues"
echo ""

if [ $FAILED_COUNT -eq 0 ]; then
    echo "🎉 ALL ISSUES CREATED SUCCESSFULLY!"
    echo ""
    echo "✨ Next steps:"
    echo "1. 🔗 Visit your GitHub repository: https://github.com/auditoryx/X-Open-Netowrk"
    echo "2. 📋 Check the Beta Launch project board: https://github.com/auditoryx/X-Open-Netowrk/projects"
    echo "3. 🎯 Review critical issues assigned to @auditoryx"
    echo "4. 📅 Schedule work based on milestones and priorities"
    echo "5. 👥 Assign team members to high and medium priority issues"
    echo ""
    echo "🏁 DONE - Beta issue seeding complete!"
else
    echo "⚠️  Some issues failed to create. Please check the errors above."
    echo "   You may need to retry failed issues or check GitHub permissions."
    exit 1
fi
`;

  return script;
}

function main() {
  console.log('🎯 Final Beta Issue Generator');
  console.log('============================');
  console.log('');
  
  console.log(`📊 Complete Issue Breakdown:`);
  console.log(`   🚨 Critical issues: ${allIssues.filter(i => i.labels.includes('priority:critical')).length}`);
  console.log(`   🔶 High priority: ${allIssues.filter(i => i.labels.includes('priority:high')).length}`);
  console.log(`   🔹 Medium priority: ${allIssues.filter(i => i.labels.includes('priority:medium')).length}`);
  console.log(`   🔸 Low priority: ${allIssues.filter(i => i.labels.includes('priority:low')).length}`);
  console.log(`   🔄 Post-MVP: ${allIssues.filter(i => i.labels.includes('post-mvp')).length}`);
  console.log(`   📋 Total issues: ${allIssues.length}`);
  console.log('');
  
  console.log(`🎯 Assignment Summary:`);
  console.log(`   👤 Assigned to @auditoryx: ${allIssues.filter(i => i.assignees && i.assignees.includes('auditoryx')).length} (all critical)`);
  console.log(`   👥 Unassigned (ready for team): ${allIssues.filter(i => !i.assignees || i.assignees.length === 0).length}`);
  console.log('');
  
  // Generate the final executable script
  const scriptContent = generateFinalScript();
  const scriptPath = path.join(__dirname, 'final-create-beta-issues.sh');
  
  fs.writeFileSync(scriptPath, scriptContent);
  fs.chmodSync(scriptPath, 0o755);
  
  console.log(`✅ Generated final executable script: ${scriptPath}`);
  console.log('');
  
  // Save comprehensive issue data
  const issuesJsonPath = path.join(__dirname, 'final-beta-issues.json');
  fs.writeFileSync(issuesJsonPath, JSON.stringify(allIssues, null, 2));
  console.log(`📄 Complete issue data saved to: ${issuesJsonPath}`);
  
  // Generate project board setup
  const projectConfig = {
    title: "Beta Launch",
    description: "Beta Launch project board for tracking all beta-gap and post-MVP issues",
    columns: [
      "Backlog",
      "Ready", 
      "In Progress",
      "Review",
      "Testing",
      "Done"
    ]
  };
  
  const projectConfigPath = path.join(__dirname, 'final-project-config.json');
  fs.writeFileSync(projectConfigPath, JSON.stringify(projectConfig, null, 2));
  console.log(`📋 Project board configuration: ${projectConfigPath}`);
  
  console.log('');
  console.log('🚀 Ready to execute!');
  console.log('');
  console.log('📋 Prerequisites:');
  console.log('   1. ✅ GitHub CLI installed and authenticated');
  console.log('   2. ✅ Write access to auditoryx/X-Open-Netowrk repository');
  console.log('   3. ✅ User @auditoryx exists and can be assigned');
  console.log('');
  console.log('▶️  To run:');
  console.log(`   cd ${path.dirname(scriptPath)}`);
  console.log('   ./final-create-beta-issues.sh');
  console.log('');
  console.log('🎯 This will create ALL 181 issues as specified in the Beta Issue Generation Guide!');
}

if (require.main === module) {
  main();
}

module.exports = { 
  allIssues,
  criticalIssues: allIssues.filter(i => i.labels.includes('priority:critical')),
  highPriorityIssues: allIssues.filter(i => i.labels.includes('priority:high')),
  mediumPriorityIssues: allIssues.filter(i => i.labels.includes('priority:medium')),
  lowPriorityIssues: allIssues.filter(i => i.labels.includes('priority:low')),
  postMVPIssues: allIssues.filter(i => i.labels.includes('post-mvp'))
};