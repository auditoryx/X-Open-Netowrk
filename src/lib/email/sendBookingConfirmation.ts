import { sendEmail } from '@/lib/email/sendEmail';

export async function sendBookingConfirmation(to: string, selectedTime: string, message: string, senderName?: string) {
  const subject = `📅 New Booking Request – ${selectedTime}`;
  const body = `
You have a new booking request.

🕒 Time: ${selectedTime}
💬 Message: ${message}
🙋 From: ${senderName || 'Anonymous'}

Please check your dashboard to accept or decline this request.
`;

  await sendEmail(to, subject, 'booking-confirmation.html', {
    selectedTime,
    message,
    senderName: senderName || 'Anonymous',
  });
}
