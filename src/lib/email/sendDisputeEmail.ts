import { sendEmail } from '@/lib/email/sendEmail';

export async function sendDisputeEmail(
  bookingId: string,
  fromUser: string,
  reason: string
) {
  const subject = `🛑 New Dispute Submitted – Booking ${bookingId}`;

  try {
    const result = await sendEmail(
      'admin@auditoryx.com',
      subject,
      'dispute-notification.html',
      { bookingId, fromUser, reason }
    );

    if (result.error) {
      console.error(`Dispute email failed:`, result.error);
      return { error: result.error };
    }

    return { success: true };
  } catch (err: any) {
    console.error(`Dispute email send error:`, err.message);
    return { error: 'Dispute email failed to send' };
  }
}
// Example usage
// sendDisputeEmail(
//   '12345',
//   '