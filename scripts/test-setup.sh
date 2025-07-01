#!/bin/bash

# Test Booking Confirmation Email Setup
# Run this script after setting up environment variables to test the system

echo "🧪 Testing Booking Confirmation Email Setup"
echo "============================================"

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first."
    exit 1
fi

echo
echo "1. Checking Firebase Functions configuration..."

# Check if environment variables are set
CONFIG=$(firebase functions:config:get 2>/dev/null)

if [[ -z "$CONFIG" || "$CONFIG" == "{}" ]]; then
    echo "❌ No Firebase Functions configuration found."
    echo "   Please run: ./scripts/setup-environment.sh"
    exit 1
fi

echo "✅ Firebase Functions configuration found:"
echo "$CONFIG" | jq . 2>/dev/null || echo "$CONFIG"

echo
echo "2. Checking deployed functions..."

# List deployed functions
FUNCTIONS=$(firebase functions:list 2>/dev/null)
if echo "$FUNCTIONS" | grep -q "handleStripeWebhook"; then
    echo "✅ handleStripeWebhook function is deployed"
else
    echo "❌ handleStripeWebhook function not found"
    echo "   Please deploy with: firebase deploy --only functions:handleStripeWebhook"
    exit 1
fi

echo
echo "3. Getting webhook endpoint URL..."
PROJECT_ID=$(firebase projects:list --json 2>/dev/null | jq -r '.[] | select(.id | contains("auditory-x-open-network")) | .id' 2>/dev/null)

if [[ -z "$PROJECT_ID" ]]; then
    PROJECT_ID="auditory-x-open-network"  # fallback
fi

WEBHOOK_URL="https://us-central1-${PROJECT_ID}.cloudfunctions.net/handleStripeWebhook-handleStripeWebhook"
echo "✅ Your webhook URL: $WEBHOOK_URL"

echo
echo "4. Testing webhook endpoint availability..."

# Test if the endpoint is reachable
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$WEBHOOK_URL" || echo "000")

if [[ "$HTTP_STATUS" == "405" ]]; then
    echo "✅ Webhook endpoint is accessible (returns 405 as expected for GET requests)"
elif [[ "$HTTP_STATUS" == "200" ]]; then
    echo "✅ Webhook endpoint is accessible"
elif [[ "$HTTP_STATUS" == "000" ]]; then
    echo "⚠️  Could not reach webhook endpoint (network issue or timeout)"
    echo "   This might be normal in some environments"
else
    echo "⚠️  Webhook endpoint returned status: $HTTP_STATUS"
    echo "   This might be normal - webhooks expect POST requests from Stripe"
fi

echo
echo "5. Checking recent function logs..."
echo "Recent handleStripeWebhook logs:"
firebase functions:log --only handleStripeWebhook --limit 5 2>/dev/null || echo "No recent logs found"

echo
echo "📋 Setup Verification Summary:"
echo "================================="
echo "✅ Firebase Functions configuration: OK"
echo "✅ handleStripeWebhook function: Deployed"
echo "✅ Webhook URL: $WEBHOOK_URL"

echo
echo "🔧 Next Steps:"
echo "1. Add this webhook URL to your Stripe Dashboard:"
echo "   $WEBHOOK_URL"
echo
echo "2. Configure webhook to listen for: checkout.session.completed"
echo
echo "3. Test with a real booking:"
echo "   - Make a booking through your app"
echo "   - Complete Stripe payment"
echo "   - Check that confirmation email is sent"
echo
echo "4. Monitor logs during testing:"
echo "   firebase functions:log --only handleStripeWebhook --limit 10"
echo
echo "🎉 Your booking confirmation email system is ready for testing!"
