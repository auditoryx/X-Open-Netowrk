# Quick Deployment Guide

## Prerequisites

1. Firebase CLI installed and authenticated
2. SendGrid account with API key
3. Stripe webhook configured

## Environment Setup

```bash
# Configure SendGrid for Firebase Functions
firebase functions:config:set sendgrid.api_key="your_sendgrid_api_key"
firebase functions:config:set sendgrid.from_email="booking@auditoryx.com"

# Configure Stripe webhook secret
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
firebase functions:config:set stripe.secret="sk_your_stripe_secret_key"
```

## Deploy

```bash
# Install dependencies
cd functions
npm install

# Deploy functions
cd ..
firebase deploy --only functions:handleStripeWebhook

# Or deploy all functions
firebase deploy --only functions
```

## Verification

1. Make a test booking with Stripe payment
2. Check Firebase Function logs: `firebase functions:log`
3. Verify email delivery in SendGrid dashboard
4. Check booking status in Firestore is updated to "paid"

## Webhook URL

Your webhook endpoint will be:
`https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/handleStripeWebhook`

Configure this URL in your Stripe Dashboard → Webhooks section.

## Environment Variables for Local Development

Add to your `.env` file:
```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=booking@auditoryx.com
```
