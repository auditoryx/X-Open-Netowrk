# Booking Confirmation Email Setup

## Overview

This implementation automatically sends booking confirmation emails after successful Stripe payments. The system:

1. Listens for `checkout.session.completed` webhook events from Stripe
2. Extracts booking metadata and fetches booking details from Firestore
3. Sends a professional HTML email confirmation to the client via SendGrid
4. Includes booking details, payment reference, and next steps

## Files Modified/Created

### 1. `/lib/email/sendBookingConfirmation.ts`
- Updated to use SendGrid instead of Resend
- Added comprehensive BookingData interface
- Supports HTML template with dynamic content injection

### 2. `/lib/email/templates/bookingConfirmation.html`
- Professional HTML email template with responsive design
- Includes booking details, security messaging, and next steps
- Mobile-friendly with inline CSS

### 3. `/functions/src/payments/handleStripeWebhook.ts`
- Enhanced to send booking confirmation emails after payment
- Includes error handling to prevent webhook failures
- Fetches complete booking data from Firestore

### 4. `/functions/package.json`
- Added `@sendgrid/mail` dependency

## Setup Instructions

### 1. Environment Variables

For Firebase Functions, configure SendGrid environment variables:

```bash
# Set SendGrid API key
firebase functions:config:set sendgrid.api_key="your_sendgrid_api_key"

# Set from email address
firebase functions:config:set sendgrid.from_email="booking@auditoryx.com"
```

For local development, add to your `.env` file:
```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=booking@auditoryx.com
```

### 2. SendGrid Setup

1. Create a SendGrid account at https://sendgrid.com
2. Generate an API key with "Full Access" permissions
3. Verify your sender email address/domain
4. Configure the environment variables as shown above

### 3. Firestore Booking Structure

Ensure your booking documents include these fields:
```javascript
{
  id: string,
  clientEmail: string,     // Required for email sending
  clientName?: string,     // Client's display name
  providerName?: string,   // Provider's display name
  serviceName?: string,    // Service title
  total?: number,          // Total amount paid
  price?: number,          // Alternative price field
  stripeSessionId?: string, // Set automatically by webhook
  contractId?: string,     // For linking to contract
  status: string          // Updated to 'paid' after payment
}
```

### 4. Stripe Webhook Configuration

1. In your Stripe dashboard, go to Webhooks
2. Add endpoint: `https://your-project.cloudfunctions.net/handleStripeWebhook`
3. Subscribe to events: `checkout.session.completed`
4. Copy the webhook signing secret and configure it:

```bash
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
```

### 5. Deploy Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Email Template Customization

The email template includes:

- **Responsive Design**: Works on desktop and mobile
- **Professional Styling**: Clean, modern appearance
- **Dynamic Content**: Client name, provider, service, amount, etc.
- **Security Messaging**: Explains fund escrow protection
- **Call-to-Action**: Link to view booking details
- **Next Steps**: Clear guidance for what happens next

### Template Variables

The following variables are replaced in the HTML template:

- `{clientName}` - Client's name or "Valued Client"
- `{providerName}` - Provider's name or "Service Provider"  
- `{service}` - Service name or title
- `{total}` - Total amount paid
- `{sessionId}` - Stripe session ID for reference
- `{contractLink}` - Link to booking details page

## Testing

### 1. Test Stripe Webhook Locally

Use Stripe CLI to forward webhooks to your local development server:

```bash
stripe listen --forward-to localhost:5001/your-project/us-central1/handleStripeWebhook
```

### 2. Test Email Sending

Create a test booking and trigger a payment to verify:

1. Email is sent within 1 minute of payment
2. All booking details are populated correctly
3. Email renders properly in Gmail and mobile
4. Links work correctly
5. No errors appear in function logs

### 3. Verify in SendGrid Dashboard

Check the SendGrid dashboard for:
- Email delivery status
- Open/click rates
- Any bounce/spam issues

## Error Handling

The implementation includes comprehensive error handling:

- **Webhook Failures**: Errors don't prevent webhook completion
- **Missing Data**: Graceful handling of missing booking fields
- **SendGrid Issues**: Detailed error logging
- **Configuration**: Clear error messages for missing config

## Monitoring

Monitor the system through:

1. **Firebase Console**: Function execution logs
2. **SendGrid Dashboard**: Email delivery metrics  
3. **Stripe Dashboard**: Webhook delivery status
4. **Client Feedback**: Confirm clients receive emails

## Security Notes

- SendGrid API key should be kept secure
- Use environment variables, never hardcode keys
- Verify webhook signatures to prevent spoofing
- Limit SendGrid API permissions to sending only

## Troubleshooting

### Common Issues

1. **Emails not sending**: Check SendGrid API key and from email verification
2. **Missing booking data**: Verify Firestore document structure
3. **Webhook failures**: Check Stripe endpoint URL and signing secret
4. **Template errors**: Validate HTML template syntax

### Debug Steps

1. Check Firebase function logs: `firebase functions:log`
2. Test webhook endpoint: Use Stripe CLI or webhook testing tool
3. Verify SendGrid activity: Check SendGrid dashboard
4. Test email template: Send test email with sample data
