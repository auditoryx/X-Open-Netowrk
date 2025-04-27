import { sendEmail } from '@/lib/email/sendEmail';

export async function sendPayoutConfirmation(toEmail: string, payoutId: string) {
  await sendEmail(toEmail, 'Payout Received', 'payment-received.html', {
    payoutId,
  });
}
