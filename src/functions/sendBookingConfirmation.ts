import { sendEmail } from '@/lib/email/sendEmail';

export async function sendBookingConfirmation(toEmail: string, bookingId: string) {
  await sendEmail(toEmail, 'Booking Confirmation', 'booking-confirmation.html', {
    bookingId,
  });
}
