import { sendEmail } from '@/lib/email/sendEmail';

export async function sendBookingConfirmation(
  to: string,
  selectedTime: string,
  message: string,
  senderName?: string,
  providerTZ?: string,
  clientTZ?: string
) {
  const subject = `📅 New Booking Request – ${selectedTime}`;

  try {
    const result = await sendEmail(to, subject, 'booking-confirmation.html', {
      selectedTime,
      message,
      senderName: senderName || 'Anonymous',
      providerTZ: providerTZ || '',
      clientTZ: clientTZ || '',
    });

    if (result.error) {
      console.error(`Booking email failed to ${to}:`, result.error);
      return { error: result.error };
    }

    return { success: true };
  } catch (err: any) {
    console.error(`Booking confirmation error for ${to}:`, err.message);
    return { error: 'Email send failed' };
  }
}
