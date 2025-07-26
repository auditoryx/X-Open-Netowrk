# AuditoryX Open Network - UI Screenshots

This directory contains automatically generated screenshots showcasing the platform's user interface across different user tiers and key features.

## Screenshot Categories

### Tier-Based User Experience
Screenshots demonstrating the visual differences between Standard, Verified, and Signature tier users:

**Profile Views:**
- `profile-standard-tier.png` - Basic profile without verification badges
- `profile-verified-tier.png` - Profile with blue checkmark verification badge  
- `profile-signature-tier.png` - Premium profile with gold star signature badge

**Search Result Cards:**
- `creator-card-standard-tier.png` - Standard user appearance in search
- `creator-card-verified-badge.png` - Verified badge display in search results
- `creator-card-signature-star.png` - Signature star prominence in search

**Booking Interface Differences:**
- `booking-standard-limitations.png` - Single-person booking limitations
- `booking-verified-features.png` - Enhanced collaborative features
- `booking-signature-unlimited.png` - Full unlimited collaboration access

### Core Platform Features
- `homepage-hero.png` - Main landing page and value proposition
- `search-page-overview.png` - Advanced search with tier filtering
- `booking-flow-complete.png` - End-to-end booking process
- `chat-interface-overview.png` - Real-time communication features
- `analytics-dashboard.png` - Professional analytics and insights

### Verification and Trust System
- `kyc-verification-flow.png` - Government ID verification process
- `admin-verification-panel.png` - Admin review and approval interface
- `tier-upgrade-process.png` - User tier progression workflow

### Mobile Responsive Design
- `mobile-homepage.png` - Mobile-optimized landing page
- `mobile-search-results.png` - Mobile search and discovery
- `mobile-booking-flow.png` - Mobile booking experience

## Automated Generation

Screenshots are automatically generated using Playwright automation:

```bash
# Run screenshot generation script
npx playwright test scripts/capture-ui-screens.ts

# Prerequisites
npm run dev  # Start development server
npx playwright install  # Install browsers
```

## Usage in Documentation

These screenshots are embedded in:
- **Executive Overview** - Market positioning and feature showcase
- **Investor Presentation** - Visual platform demonstration  
- **Tier System Documentation** - User experience comparisons
- **Technical Documentation** - UI implementation examples

## Quality Standards

- **Resolution**: 1440x900 for desktop, 375x667 for mobile
- **Format**: PNG for crisp quality and transparency support
- **Consistency**: Standardized viewports and user data across screenshots
- **Accessibility**: Alt text and descriptions provided for all images

*Note: Screenshots are generated from test data and mock user accounts to demonstrate tier differences without exposing real user information.*

## Manual Screenshot Guidelines

When taking manual screenshots for documentation:

1. **Use consistent test data** across tier demonstrations
2. **Maintain uniform lighting** and browser settings
3. **Focus on key differentiators** between tiers
4. **Include context** showing the full user experience
5. **Optimize for presentation** with clean, professional appearance

---

*Screenshots directory managed by automated scripts - see `scripts/capture-ui-screens.ts` for generation logic*