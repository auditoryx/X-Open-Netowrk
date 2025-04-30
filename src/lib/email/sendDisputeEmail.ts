import { sendEmail } from '@/lib/email/sendEmail';

export async function sendDisputeEmail(bookingId: string, fromUser: string, reason: string) {
  const subject = `🛑 New Dispute Submitted – Booking ${bookingId}`;
  const body = `
    A new dispute has been submitted.

    🔒 Booking ID: ${bookingId}
    👤 Submitted by: ${fromUser}
    📝 Reason:
    ${reason}

    Please review it in the Admin Dashboard.
  `;

  await sendEmail({
    to: 'admin@auditoryx.com', // Change to real admin email
    subject,
    text: body,
  });
}
