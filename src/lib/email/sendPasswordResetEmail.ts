/**
 * Password Reset Email Service
 * Sends password reset emails to users
 */

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  // In a real implementation, this would send via SendGrid or other email service
  console.log(`Password reset email would be sent to: ${email}`);
  console.log(`Reset link: ${resetLink}`);
  
  // Simulate email sending
  return Promise.resolve({
    success: true,
    messageId: `pwd_reset_${Date.now()}`
  });
}