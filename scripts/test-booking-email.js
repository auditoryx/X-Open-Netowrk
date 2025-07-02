/**
 * Test script for booking confirmation email system
 * Run with: node scripts/test-booking-email.js
 */

const { sendSingleBookingConfirmation } = require('../lib/email/sendBookingConfirmationEmail');

// Test booking data
const testBooking = {
  id: 'test-booking-12345',
  status: 'confirmed',
  totalAmount: 15000,
  bookingDate: '2025-07-18',
  startTime: '14:00',
  endTime: '16:00',
  location: 'Studio Tokyo, Shibuya',
  notes: 'Please bring your own instruments. We have a piano available.',
  
  clientId: 'client-123',
  clientName: 'Yuki Tanaka',
  clientEmail: 'yuki.tanaka@example.com',
  
  providerId: 'provider-456',
  providerName: 'Alex Johnson',
  providerEmail: 'alex.johnson@example.com',
  
  serviceName: 'Music Production Session',
  serviceDescription: 'Professional music production and mixing session',
  serviceType: 'studio',
  
  contractId: 'contract-789',
  contractUrl: 'https://auditoryx.com/contracts/contract-789.pdf',
  revenueSplitEnabled: true,
  
  stripeSessionId: 'cs_test_1234567890',
  paymentStatus: 'completed'
};

async function testBookingEmail() {
  console.log('🧪 Testing booking confirmation email...');
  console.log('📧 Test booking data:', JSON.stringify(testBooking, null, 2));
  
  try {
    // Test client email
    console.log('\n📤 Sending test email to client...');
    await sendSingleBookingConfirmation(
      'test-client@example.com', 
      testBooking, 
      'client'
    );
    console.log('✅ Client email sent successfully');
    
    // Test provider email
    console.log('\n📤 Sending test email to provider...');
    await sendSingleBookingConfirmation(
      'test-provider@example.com', 
      testBooking, 
      'provider'
    );
    console.log('✅ Provider email sent successfully');
    
    console.log('\n🎉 All test emails sent successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('SENDGRID_API_KEY')) {
      console.log('\n💡 Tip: Make sure SENDGRID_API_KEY is set in your environment variables');
      console.log('   You can set it in your .env.local file:');
      console.log('   SENDGRID_API_KEY=your_sendgrid_api_key_here');
    }
    
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testBookingEmail();
}

module.exports = { testBookingEmail, testBooking };
