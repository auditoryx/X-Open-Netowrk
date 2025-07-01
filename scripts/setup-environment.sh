#!/bin/bash

# Booking Confirmation Email - Environment Setup Script
# Run this script to configure Firebase Functions environment variables

echo "🔧 Setting up Booking Confirmation Email Environment Variables"
echo "============================================================="

# Function to read user input securely
read_secret() {
    echo -n "$1: "
    read -s value
    echo
    echo "$value"
}

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

echo
echo "Please provide the following credentials:"
echo

# Get SendGrid API Key
echo "📧 SendGrid Setup"
echo "1. Log into your SendGrid account"
echo "2. Go to Settings → API Keys" 
echo "3. Create a new API key with 'Full Access' permissions"
echo "4. Copy the API key (starts with 'SG.')"
echo
SENDGRID_API_KEY=$(read_secret "Enter your SendGrid API Key")

# Get SendGrid From Email
echo
echo "📧 SendGrid From Email"
echo "This should be a verified sender in your SendGrid account"
echo "Recommended: booking@auditoryx.com"
echo
echo -n "Enter your SendGrid From Email: "
read SENDGRID_FROM_EMAIL

# Get Stripe Webhook Secret
echo
echo "🔗 Stripe Webhook Secret"
echo "1. Go to your Stripe Dashboard → Webhooks"
echo "2. Find your webhook endpoint or create a new one with URL:"
echo "   https://us-central1-auditory-x-open-network.cloudfunctions.net/handleStripeWebhook-handleStripeWebhook"
echo "3. Copy the signing secret (starts with 'whsec_')"
echo
STRIPE_WEBHOOK_SECRET=$(read_secret "Enter your Stripe Webhook Secret")

# Optional: Stripe Secret Key
echo
echo "🔑 Stripe Secret Key (Optional - only if not already set)"
echo "Your Stripe secret key (starts with 'sk_')"
echo -n "Enter your Stripe Secret Key (press Enter to skip): "
read -s STRIPE_SECRET_KEY
echo

echo
echo "🚀 Setting Firebase Functions environment variables..."

# Set SendGrid configuration
echo "Setting SendGrid API Key..."
firebase functions:config:set sendgrid.api_key="$SENDGRID_API_KEY"

echo "Setting SendGrid From Email..."
firebase functions:config:set sendgrid.from_email="$SENDGRID_FROM_EMAIL"

# Set Stripe configuration
echo "Setting Stripe Webhook Secret..."
firebase functions:config:set stripe.webhook_secret="$STRIPE_WEBHOOK_SECRET"

# Set Stripe Secret Key if provided
if [[ -n "$STRIPE_SECRET_KEY" ]]; then
    echo "Setting Stripe Secret Key..."
    firebase functions:config:set stripe.secret="$STRIPE_SECRET_KEY"
fi

echo
echo "✅ Environment variables configured successfully!"
echo

# Verify configuration
echo "📋 Current configuration:"
firebase functions:config:get

echo
echo "🚀 IMPORTANT: You must now redeploy the function for changes to take effect:"
echo "   firebase deploy --only functions:handleStripeWebhook"
echo
echo "📋 Next steps:"
echo "1. Redeploy the function (command above)"
echo "2. Configure your Stripe webhook URL in Stripe Dashboard"
echo "3. Test with a real booking and payment"
echo
echo "🎉 Setup complete! Check SETUP_COMPLETION_GUIDE.md for detailed instructions."
