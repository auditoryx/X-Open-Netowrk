import { sendBookingConfirmation } from '../lib/email/sendBookingConfirmation';

// Test script for booking confirmation email
async function testBookingConfirmation() {
  const testBookingData = {
    id: 'test-booking-123',
    clientName: 'John Doe',
    clientEmail: 'test@example.com', // Replace with your test email
    providerName: 'Sarah Smith',
    serviceName: 'Professional Audio Mixing',
    total: 150,
    stripeSessionId: 'cs_test_1234567890',
    contractId: 'contract-abc123'
  };

  try {
    console.log('🧪 Testing booking confirmation email...');
    await sendBookingConfirmation(testBookingData.clientEmail, testBookingData);
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
}

// Run the test
testBookingConfirmation();
