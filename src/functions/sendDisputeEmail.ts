import { sendEmail } from '@/lib/email/sendEmail';

export async function sendDisputeEmail(toEmail: string, disputeId: string) {
  await sendEmail(toEmail, 'Dispute Opened', 'dispute-opened.html', {
    disputeId,
  });
}
