import { sendEmail } from '@/lib/email/sendEmail';

export async function sendReviewRequest(toEmail: string, bookingId: string) {
  await sendEmail(toEmail, 'Leave a Review', 'review-request.html', {
    bookingId,
  });
}
