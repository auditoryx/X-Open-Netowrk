import { sendEmail } from '@/lib/email/sendEmail';

export async function sendBookingAccepted(toEmail: string, bookingId: string) {
  await sendEmail(toEmail, 'Booking Accepted', 'booking-accepted.html', {
    bookingId,
  });
}
